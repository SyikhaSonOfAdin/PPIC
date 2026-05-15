"use strict";
const { geminiCompanyServices } = require("./geminiCompany");
const { companyReportServices } = require("./companyReport");

class CompanyReportQueue {
  constructor() {
    this._processing = null;
    this._pendingSet = new Set();
    this._statusMap = new Map();
    this._running = false;
  }

  enqueue(companyId) {
    if (!companyId) return;
    if (!geminiCompanyServices.isConfigured()) {
      console.warn("[company-report-queue] GEMINI_API_KEY missing, skip", companyId);
      return;
    }
    if (this._processing === companyId) return;
    if (this._pendingSet.has(companyId)) return;
    this._pendingSet.add(companyId);
    this._statusMap.set(companyId, "pending");
    this._tick();
  }

  getStatus(companyId) {
    return this._statusMap.get(companyId) ?? null;
  }

  snapshot() {
    return {
      processing: this._processing,
      pending: [...this._pendingSet],
      size: this._pendingSet.size + (this._processing ? 1 : 0),
    };
  }

  _tick() {
    if (this._running) return;
    this._run().catch((err) =>
      console.error("[company-report-queue] unexpected error", err),
    );
  }

  async _run() {
    this._running = true;
    try {
      while (this._pendingSet.size > 0) {
        const companyId = this._pendingSet.values().next().value;
        this._pendingSet.delete(companyId);
        this._processing = companyId;
        this._statusMap.set(companyId, "processing");
        try {
          await this._process(companyId);
          this._statusMap.set(companyId, "ready");
        } catch (err) {
          this._statusMap.set(companyId, "failed");
          console.error("[company-report-queue] process failed", companyId, err.message ?? err);
        } finally {
          this._processing = null;
        }
      }
    } finally {
      this._running = false;
    }
  }

  async _process(companyId) {
    const model = geminiCompanyServices.getModelName();
    let companyData;
    try {
      companyData = await companyReportServices.aggregateCompanyData(companyId);
    } catch (err) {
      await companyReportServices.saveResult(companyId, {
        result: null, model,
        projectCount: 0,
        status: companyReportServices.STATUS.FAILED,
        errorMessage: `Aggregation failed: ${err?.message ?? err}`,
      });
      throw err;
    }

    const projectCount = companyData.projects?.length ?? 0;
    if (projectCount === 0) {
      await companyReportServices.saveResult(companyId, {
        result: null, model,
        projectCount: 0,
        status: companyReportServices.STATUS.FAILED,
        errorMessage: "No projects found for this company",
      });
      return;
    }

    try {
      const result = await geminiCompanyServices.analyzeCompanyData(companyData);
      await companyReportServices.saveResult(companyId, {
        result, model, projectCount,
        status: companyReportServices.STATUS.READY,
        errorMessage: null,
      });
    } catch (err) {
      await companyReportServices.saveResult(companyId, {
        result: null, model, projectCount,
        status: companyReportServices.STATUS.FAILED,
        errorMessage: err?.message ?? String(err),
      });
      throw err;
    }
  }
}

const companyReportQueue = new CompanyReportQueue();
module.exports = { companyReportQueue };
