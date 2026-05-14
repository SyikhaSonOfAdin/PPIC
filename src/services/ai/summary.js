"use strict";
const { v7: uuidv7 } = require("uuid");
const { PPIC } = require("../../config/db");
const {
  projectAiSummaryQuerys,
  projectAiSummaryTable,
} = require("../../models/projectAiSummary");
const { projectTable } = require("../../models/project");
const { projectDetailTable } = require("../../models/projectDetail");
const { remarkQuerys } = require("../../models/journalRemark");

const STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  READY: "ready",
  FAILED: "failed",
};

// =============================================================================
// Session-level lock wait timeout
// =============================================================================
// Default MySQL = 50 detik. Untuk write idempotent (upsert), fail-fast 5 detik
// lalu retry adalah strategi yang jauh lebih responsif dan tidak menumpuk
// koneksi yang menunggu lock.
const SESSION_LOCK_WAIT_SECONDS = 5;

// =============================================================================
// Schema bootstrap with in-flight lock (jalan sekali per proses)
// =============================================================================
let schemaReady = false;
let schemaInFlight = null;

const ensureSchema = async () => {
  if (schemaReady) return;
  if (schemaInFlight) return schemaInFlight;

  schemaInFlight = (async () => {
    const CONN = await PPIC.getConnection();
    try {
      await CONN.query(projectAiSummaryQuerys.ddl);
      schemaReady = true;
    } finally {
      CONN.release();
      schemaInFlight = null;
    }
  })();

  return schemaInFlight;
};

// =============================================================================
// Defensive connection prep
// =============================================================================
// SET autocommit = 1:
//   - Force koneksi ini ke autocommit mode.
//   - Implicitly COMMIT transaksi orphan kalau koneksi di-leak ke pool dengan
//     transaksi terbuka oleh caller sebelumnya.
// SET SESSION innodb_lock_wait_timeout: fail-fast (5s) bukan 50s default.
// const prepareConnection = async (CONN) => {
//   await CONN.query("SET autocommit = 1");
//   await CONN.query(
//     `SET SESSION innodb_lock_wait_timeout = ${SESSION_LOCK_WAIT_SECONDS}`,
//   );
// };

const selectProjectContextSQL = `SELECT
  P.${projectTable.COLUMN.ID} AS ID,
  P.${projectTable.COLUMN.PROJECT_NO} AS PROJECT_NO,
  P.${projectTable.COLUMN.CLIENT} AS CLIENT,
  PD.${projectDetailTable.COLUMN.NAME} AS DETAIL_NAME
  FROM ${projectTable.TABLE} AS P
  LEFT JOIN ${projectDetailTable.TABLE} AS PD
    ON P.${projectTable.COLUMN.ID} = PD.${projectDetailTable.COLUMN.PROJECT_ID}
  WHERE P.${projectTable.COLUMN.ID} = ?
  LIMIT 1`;

// =============================================================================
// Atomic UPSERT — satu statement, satu round-trip, lock minimal.
// =============================================================================
const upsertResultSQL = `INSERT INTO ${projectAiSummaryTable.TABLE} (
  ${projectAiSummaryTable.COLUMN.ID},
  ${projectAiSummaryTable.COLUMN.PROJECT_ID},
  ${projectAiSummaryTable.COLUMN.OVERVIEW},
  ${projectAiSummaryTable.COLUMN.HEALTH_SCORE},
  ${projectAiSummaryTable.COLUMN.RISK_LEVEL},
  ${projectAiSummaryTable.COLUMN.TREND},
  ${projectAiSummaryTable.COLUMN.KEY_ISSUES},
  ${projectAiSummaryTable.COLUMN.PROBLEM_PATTERNS},
  ${projectAiSummaryTable.COLUMN.LESSONS_LEARNED},
  ${projectAiSummaryTable.COLUMN.ACTION_ITEMS},
  ${projectAiSummaryTable.COLUMN.REMARK_COUNT},
  ${projectAiSummaryTable.COLUMN.MODEL},
  ${projectAiSummaryTable.COLUMN.STATUS},
  ${projectAiSummaryTable.COLUMN.ERROR_MESSAGE},
  ${projectAiSummaryTable.COLUMN.GENERATED_AT}
) VALUES (
  ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW()
)
ON DUPLICATE KEY UPDATE
  ${projectAiSummaryTable.COLUMN.OVERVIEW}         = VALUES(${projectAiSummaryTable.COLUMN.OVERVIEW}),
  ${projectAiSummaryTable.COLUMN.HEALTH_SCORE}     = VALUES(${projectAiSummaryTable.COLUMN.HEALTH_SCORE}),
  ${projectAiSummaryTable.COLUMN.RISK_LEVEL}       = VALUES(${projectAiSummaryTable.COLUMN.RISK_LEVEL}),
  ${projectAiSummaryTable.COLUMN.TREND}            = VALUES(${projectAiSummaryTable.COLUMN.TREND}),
  ${projectAiSummaryTable.COLUMN.KEY_ISSUES}       = VALUES(${projectAiSummaryTable.COLUMN.KEY_ISSUES}),
  ${projectAiSummaryTable.COLUMN.PROBLEM_PATTERNS} = VALUES(${projectAiSummaryTable.COLUMN.PROBLEM_PATTERNS}),
  ${projectAiSummaryTable.COLUMN.LESSONS_LEARNED}  = VALUES(${projectAiSummaryTable.COLUMN.LESSONS_LEARNED}),
  ${projectAiSummaryTable.COLUMN.ACTION_ITEMS}     = VALUES(${projectAiSummaryTable.COLUMN.ACTION_ITEMS}),
  ${projectAiSummaryTable.COLUMN.REMARK_COUNT}     = VALUES(${projectAiSummaryTable.COLUMN.REMARK_COUNT}),
  ${projectAiSummaryTable.COLUMN.MODEL}            = VALUES(${projectAiSummaryTable.COLUMN.MODEL}),
  ${projectAiSummaryTable.COLUMN.STATUS}           = VALUES(${projectAiSummaryTable.COLUMN.STATUS}),
  ${projectAiSummaryTable.COLUMN.ERROR_MESSAGE}    = VALUES(${projectAiSummaryTable.COLUMN.ERROR_MESSAGE}),
  ${projectAiSummaryTable.COLUMN.GENERATED_AT}     = NOW()`;

// =============================================================================
// Diagnostic — daftar transaksi yang sudah hidup >3 detik
// Berguna untuk identifikasi koneksi rogue yang menahan lock.
// =============================================================================
const diagnoseLongTrxSQL = `SELECT
    trx_id,
    trx_state,
    trx_started,
    TIMESTAMPDIFF(SECOND, trx_started, NOW()) AS duration_seconds,
    trx_mysql_thread_id AS thread_id,
    SUBSTRING(IFNULL(trx_query, '(idle / no current query)'), 1, 200) AS query_snippet
  FROM information_schema.INNODB_TRX
  WHERE TIMESTAMPDIFF(SECOND, trx_started, NOW()) > 3
  ORDER BY trx_started ASC
  LIMIT 10`;

const parseJsonSafe = (value) => {
  if (value == null) return null;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch (_) {
    return null;
  }
};

const buildUpsertParams = (projectId, { summary, model, remarkCount, status, errorMessage }) => [
  uuidv7(),
  projectId,
  summary?.overview ?? null,
  summary?.health_score ?? null,
  summary?.risk_level ?? null,
  summary?.trend ?? null,
  summary?.key_issues ? JSON.stringify(summary.key_issues) : null,
  summary?.problem_patterns ? JSON.stringify(summary.problem_patterns) : null,
  summary?.lessons_learned ? JSON.stringify(summary.lessons_learned) : null,
  summary?.action_items ? JSON.stringify(summary.action_items) : null,
  remarkCount ?? 0,
  model ?? null,
  status ?? STATUS.READY,
  errorMessage ?? null,
];

const aiSummaryServices = {
  STATUS,
  ensureSchema,

  getProjectContext: async (projectId) => {
    const CONN = await PPIC.getConnection();
    try {
      // await prepareConnection(CONN);
      const [rows] = await CONN.query(selectProjectContextSQL, [projectId]);
      return rows?.[0] ?? null;
    } finally {
      CONN.release();
    }
  },

  getRemarks: async (projectId) => {
    const CONN = await PPIC.getConnection();
    try {
      // await prepareConnection(CONN);
      const [rows] = await CONN.query(remarkQuerys.select.onlyOne, [projectId]);
      return rows ?? [];
    } finally {
      CONN.release();
    }
  },

  getByProjectId: async (projectId) => {
    await ensureSchema();
    const CONN = await PPIC.getConnection();
    try {
      // await prepareConnection(CONN);
      const [rows] = await CONN.query(
        projectAiSummaryQuerys.selectByProjectId,
        [projectId],
      );
      const row = rows?.[0];
      if (!row) return null;
      return {
        id: row[projectAiSummaryTable.COLUMN.ID],
        project_id: row[projectAiSummaryTable.COLUMN.PROJECT_ID],
        overview: row[projectAiSummaryTable.COLUMN.OVERVIEW],
        health_score: row[projectAiSummaryTable.COLUMN.HEALTH_SCORE],
        risk_level: row[projectAiSummaryTable.COLUMN.RISK_LEVEL],
        trend: row[projectAiSummaryTable.COLUMN.TREND],
        key_issues: parseJsonSafe(row[projectAiSummaryTable.COLUMN.KEY_ISSUES]) ?? [],
        problem_patterns: parseJsonSafe(row[projectAiSummaryTable.COLUMN.PROBLEM_PATTERNS]) ?? [],
        lessons_learned: parseJsonSafe(row[projectAiSummaryTable.COLUMN.LESSONS_LEARNED]) ?? [],
        action_items: parseJsonSafe(row[projectAiSummaryTable.COLUMN.ACTION_ITEMS]) ?? [],
        remark_count: row[projectAiSummaryTable.COLUMN.REMARK_COUNT],
        model: row[projectAiSummaryTable.COLUMN.MODEL],
        status: row[projectAiSummaryTable.COLUMN.STATUS],
        error_message: row[projectAiSummaryTable.COLUMN.ERROR_MESSAGE],
        generated_at: row[projectAiSummaryTable.COLUMN.GENERATED_AT],
        updated_at: row[projectAiSummaryTable.COLUMN.UPDATED_AT],
      };
    } finally {
      CONN.release();
    }
  },

  // Single source of truth untuk write. Atomic, idempotent.
  upsertResult: async (projectId, payload) => {
    await ensureSchema();
    const CONN = await PPIC.getConnection();
    try {
      // await prepareConnection(CONN);
      const params = buildUpsertParams(projectId, payload);
      await CONN.query(upsertResultSQL, params);
    } finally {
      CONN.release();
    }
  },

  // Backward-compat shim (kalau ada caller lama yang masih pakai saveResult).
  saveResult: async (projectId, payload, _isExisting = false) => {
    return aiSummaryServices.upsertResult(projectId, payload);
  },

  // Dipanggil dari queue worker saat lock contention terdeteksi.
  // Butuh privilege PROCESS pada akun MySQL aplikasi. Kalau tidak ada,
  // return { error } per row dan retry tetap jalan normal.
  diagnoseLongTransactions: async () => {
    let CONN;
    try {
      CONN = await PPIC.getConnection();
      // await prepareConnection(CONN);
      const [rows] = await CONN.query(diagnoseLongTrxSQL);
      return rows ?? [];
    } catch (err) {
      return [{ error: err.message ?? String(err) }];
    } finally {
      if (CONN) CONN.release();
    }
  },
};

module.exports = { aiSummaryServices };