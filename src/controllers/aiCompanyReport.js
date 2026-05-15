"use strict";
const { companyReportQueue } = require("../services/ai/companyReportQueue");
const { companyReportServices } = require("../services/ai/companyReport");
const { geminiCompanyServices } = require("../services/ai/geminiCompany");

const aiCompanyReportController = {
  get: {
    byCompanyId: async (req, res) => {
      const { companyId } = req.params;
      if (!companyId)
        return res.status(400).json({ message: "Invalid Parameters" });
      try {
        const queueStatus = companyReportQueue.getStatus(companyId);
        const data = await companyReportServices.getByCompanyId(companyId);
        return res.status(200).json({
          message: "Get company AI report successfully",
          configured: geminiCompanyServices.isConfigured(),
          data: {
            queue_status: queueStatus ?? data?.status ?? "idle",
            report: data,
          },
        });
      } catch (error) {
        return res.status(500).json({ message: error.message });
      }
    },
  },
  generate: async (req, res) => {
    const { companyId } = req.params;
    if (!companyId)
      return res.status(400).json({ message: "Invalid Parameters" });
    try {
      const queueStatus = companyReportQueue.getStatus(companyId);
      if (queueStatus === "processing" || queueStatus === "pending") {
        return res.status(200).json({
          message: "Report generation already in progress",
          configured: geminiCompanyServices.isConfigured(),
          data: { queue_status: queueStatus, report: null },
        });
      }
      const cooldownActive = await companyReportServices.isCooldownActive(companyId);
      if (cooldownActive) {
        const data = await companyReportServices.getByCompanyId(companyId);
        return res.status(200).json({
          message: "Report already generated today. Next generation available tomorrow.",
          configured: geminiCompanyServices.isConfigured(),
          data: { queue_status: "cooldown", report: data },
        });
      }
      companyReportQueue.enqueue(companyId);
      return res.status(202).json({
        message: "Company report generation queued",
        configured: geminiCompanyServices.isConfigured(),
        data: {
          queue_status: companyReportQueue.getStatus(companyId),
          report: null,
        },
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
  status: async (_req, res) => {
    return res.status(200).json({
      message: "Company AI report queue status",
      configured: geminiCompanyServices.isConfigured(),
      model: geminiCompanyServices.getModelName(),
      data: companyReportQueue.snapshot(),
    });
  },
};

module.exports = { aiCompanyReportController };
