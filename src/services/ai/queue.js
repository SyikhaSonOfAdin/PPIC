"use strict";

// fastq: in-memory queue runtime dari tim Fastify, dipakai Pino logger.
// async-retry: retry helper dari Vercel.
// Keduanya pure CommonJS, tidak ada masalah ESM/CJS interop.
// Install: npm install fastq async-retry
const fastq = require("fastq");
const retry = require("async-retry");

const { geminiServices } = require("./gemini");
const { aiSummaryServices } = require("./summary");

// =============================================================================
// Transient error detection
// =============================================================================
const TRANSIENT_CODES = new Set([
  "ER_LOCK_DEADLOCK",
  "ER_LOCK_WAIT_TIMEOUT",
  "PROTOCOL_CONNECTION_LOST",
  "ECONNRESET",
  "ETIMEDOUT",
]);
const TRANSIENT_ERRNOS = new Set([1205, 1213]); // lock wait timeout, deadlock
const TRANSIENT_MSG_RE =
  /Record has changed|Lock wait timeout|Deadlock found|timed out/i;

function isTransientError(err) {
  if (!err) return false;
  if (err.code && TRANSIENT_CODES.has(err.code)) return true;
  if (err.errno && TRANSIENT_ERRNOS.has(err.errno)) return true;
  return TRANSIENT_MSG_RE.test(String(err.message ?? err));
}

function isLockError(err) {
  return Boolean(err) && (err.errno === 1205 || err.errno === 1213);
}

// =============================================================================
// SummaryQueue: fastq concurrency=1 + async-retry per DB write
// =============================================================================
class SummaryQueue {
  constructor() {
    // fastq.promise: worker async, queue serialized (concurrency=1).
    // Job tunggal per waktu = tidak ada self-contention pada row yang sama.
    this._queue = fastq.promise(this._worker.bind(this), 1);

    // State tracking untuk endpoint /status dan dedup.
    // Business rule kalian (re-enqueue saat dirty) bukan tanggung jawab
    // library queue manapun; kita maintain di level aplikasi.
    this._statusMap = new Map();
    this._pendingSet = new Set();
    this._dirtySet = new Set();
    this._processing = null;
  }

  enqueue(projectId) {
    if (!projectId) return;
    if (!geminiServices.isConfigured()) {
      console.warn("[ai-queue] GEMINI_API_KEY missing, skip enqueue", projectId);
      return;
    }

    // Sedang processing: tandai dirty, re-enqueue otomatis setelah selesai.
    if (this._processing === projectId) {
      this._dirtySet.add(projectId);
      this._statusMap.set(projectId, "dirty");
      return;
    }

    // Sudah di queue (waiting): tidak perlu duplikasi.
    if (this._pendingSet.has(projectId)) {
      return;
    }

    this._pendingSet.add(projectId);
    this._statusMap.set(projectId, "pending");

    // push() returns Promise. Worker sudah handle semua error internally,
    // jadi catch ini hanya safety net untuk error yang lolos dari fastq sendiri.
    this._queue.push(projectId).catch((err) => {
      console.error("[ai-queue] unexpected queue error", projectId, err);
    });
  }

  getStatus(projectId) {
    return this._statusMap.get(projectId) ?? null;
  }

  snapshot() {
    return {
      processing: this._processing,
      pending: [...this._pendingSet],
      dirty: [...this._dirtySet],
      size: this._pendingSet.size + (this._processing ? 1 : 0),
    };
  }

  // ---------------------------------------------------------------------------
  // Worker: dipanggil oleh fastq, satu projectId per panggilan, sekuensial.
  // ---------------------------------------------------------------------------
  async _worker(projectId) {
    this._pendingSet.delete(projectId);
    this._processing = projectId;
    this._statusMap.set(projectId, "processing");
    this._dirtySet.delete(projectId);

    try {
      await this._process(projectId);
      this._statusMap.set(projectId, "ready");
    } catch (err) {
      this._statusMap.set(projectId, "failed");
      console.error("[ai-queue] process failed", projectId, err.message ?? err);
    } finally {
      this._processing = null;

      // Dirty: ada enqueue baru saat processing — schedule re-process.
      // setImmediate supaya tidak bertumpuk di stack yang sama.
      if (this._dirtySet.has(projectId)) {
        this._dirtySet.delete(projectId);
        setImmediate(() => this.enqueue(projectId));
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Process: fetch context + Gemini call + save dengan retry granular.
  // ---------------------------------------------------------------------------
  async _process(projectId) {
    const model = geminiServices.getModelName();

    const [project, remarks] = await Promise.all([
      aiSummaryServices.getProjectContext(projectId),
      aiSummaryServices.getRemarks(projectId),
    ]);

    if (!project) {
      await this._saveWithRetry(projectId, {
        summary: null,
        model,
        remarkCount: 0,
        status: aiSummaryServices.STATUS.FAILED,
        errorMessage: "Project not found",
      });
      return;
    }

    let summary;
    try {
      summary = await geminiServices.summarizeProjectRemarks({
        project,
        remarks,
      });
    } catch (err) {
      // Persist FAILED status, lalu lempar error asli ke worker.
      // Save error di-swallow supaya tidak menutupi penyebab utama (Gemini).
      try {
        await this._saveWithRetry(projectId, {
          summary: null,
          model,
          remarkCount: remarks.length,
          status: aiSummaryServices.STATUS.FAILED,
          errorMessage: err?.message ?? String(err),
        });
      } catch (saveErr) {
        console.error(
          "[ai-queue] failed to persist FAILED status",
          projectId,
          saveErr.message ?? saveErr,
        );
      }
      throw err;
    }

    await this._saveWithRetry(projectId, {
      summary,
      model,
      remarkCount: remarks.length,
      status: aiSummaryServices.STATUS.READY,
      errorMessage: null,
    });
  }

  // ---------------------------------------------------------------------------
  // Save with retry: exponential backoff + jitter via async-retry.
  // ---------------------------------------------------------------------------
  async _saveWithRetry(projectId, payload) {
    let diagnosticLogged = false;

    await retry(
      async (bail) => {
        try {
          await aiSummaryServices.upsertResult(projectId, payload);
        } catch (err) {
          if (!isTransientError(err)) {
            // Bug betulan, stop retrying. bail() membungkus error supaya
            // async-retry tidak menelannya.
            bail(err);
            return;
          }

          // Log diagnostic sekali per retry sequence untuk lock errors.
          // if (isLockError(err) && !diagnosticLogged) {
          //   diagnosticLogged = true;
          //   this._logLockDiagnostic(projectId).catch(() => {});
          // }

          throw err;
        }
      },
      {
        retries: 3, // total 4 attempts (1 + 3 retries)
        factor: 2,
        minTimeout: 150,
        maxTimeout: 2000,
        randomize: true, // jitter
        onRetry: (err, attempt) => {
          console.warn(
            `[ai-queue] retry attempt=${attempt}/3 project=${projectId} ` +
              `code=${err.code ?? "?"} errno=${err.errno ?? "?"} ` +
              `msg=${(err.message ?? err).toString().slice(0, 200)}`,
          );
        },
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Log transaksi MySQL yang sedang lama-lama jalan saat lock contention.
  // ---------------------------------------------------------------------------
  async _logLockDiagnostic(projectId) {
    try {
      const trxs = await aiSummaryServices.diagnoseLongTransactions();
      if (!trxs || trxs.length === 0) {
        console.warn(
          `[ai-queue] lock contention for ${projectId} but no long-running ` +
            `trx visible (durasi <3s, atau privilege PROCESS tidak tersedia)`,
        );
        return;
      }
      const lines = trxs.map((t) =>
        t.error
          ? `(diagnostic failed: ${t.error})`
          : `thread=${t.thread_id} state=${t.trx_state} ` +
            `duration=${t.duration_seconds}s started=${t.trx_started} ` +
            `query="${t.query_snippet}"`,
      );
      console.warn(
        `[ai-queue] lock contention diagnostic for ${projectId}:\n  ` +
          lines.join("\n  "),
      );
    } catch (err) {
      console.warn("[ai-queue] diagnostic failed", err.message ?? err);
    }
  }
}

const summaryQueue = new SummaryQueue();
module.exports = { summaryQueue };