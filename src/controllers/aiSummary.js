"use strict";
const { summaryQueue } = require("../services/ai/queue");
const { aiSummaryServices } = require("../services/ai/summary");
const { geminiServices } = require("../services/ai/gemini");

const aiSummaryController = {
  get: {
    byProjectId: async (req, res) => {
      const { projectId } = req.params;
      if (!projectId)
        return res.status(400).json({ message: "Invalid Parameters" });
      try {
        const data = await aiSummaryServices.getByProjectId(projectId);
        return res.status(200).json({
          message: "Get AI summary successfully",
          configured: geminiServices.isConfigured(),
          data,
        });
      } catch (error) {
        return res.status(500).json({ message: error.message });
      }
    },
  },
  enqueue: async (req, res) => {
    const { projectId } = req.body ?? {};
    // prettier-ignore
    if (!projectId) return res.status(400).json({ message: "Invalid Parameters" });
    console.log("enqueue");
    try {
      // summaryQueue.enqueue(projectId);
      return res.status(202).json({
        message: "Project enqueued for AI summary",
        data: summaryQueue.snapshot(),
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
  regenerate: async (req, res) => {
    const { projectId } = req.params;
    if (!projectId)
      return res.status(400).json({ message: "Invalid Parameters" });

    try {
      const queueStatus = summaryQueue.getStatus(projectId);
      const saved = await aiSummaryServices.getByProjectId(projectId);
      const currentStatus = queueStatus ?? saved?.status ?? "idle"; 
      if (currentStatus === "processing") {
        return res.status(200).json({
          message: "Summary is currently being processed",
          configured: geminiServices.isConfigured(),
          data: {
            project_id: projectId,
            queue_status: currentStatus,
            in_queue: summaryQueue.snapshot().pending.includes(projectId),
            is_processing: summaryQueue.snapshot().processing === projectId,
            is_dirty: summaryQueue.snapshot().dirty.includes(projectId),
            summary: saved,
          },
        });
      }
      if (summaryQueue.getStatus(projectId) !== "ready") summaryQueue.enqueue(projectId);
      return res.status(202).json({
        message: "Regeneration queued",
        configured: geminiServices.isConfigured(),
        data: {
          project_id: projectId,
          queue_status: summaryQueue.getStatus(projectId),
          in_queue: summaryQueue.snapshot().pending.includes(projectId),
          is_processing: summaryQueue.snapshot().processing === projectId,
          is_dirty: summaryQueue.snapshot().dirty.includes(projectId),
          summary: saved,
        },
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
  status: async (_req, res) => {
    return res.status(200).json({
      message: "AI summary queue status",
      configured: geminiServices.isConfigured(),
      model: geminiServices.getModelName(),
      data: summaryQueue.snapshot(),
    });
  },
  statusByProject: async (req, res) => {
    const { projectId } = req.params;
    if (!projectId)
      return res.status(400).json({ message: "Invalid Parameters" });
    try {
      const queueStatus = summaryQueue.getStatus(projectId);
      const saved = await aiSummaryServices.getByProjectId(projectId);
      return res.status(200).json({
        message: "AI summary status for project",
        configured: geminiServices.isConfigured(),
        data: {
          project_id: projectId,
          queue_status: queueStatus ?? saved?.status ?? "idle",
          in_queue: summaryQueue.snapshot().pending.includes(projectId),
          is_processing: summaryQueue.snapshot().processing === projectId,
          is_dirty: summaryQueue.snapshot().dirty.includes(projectId),
          summary: saved,
        },
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
};

module.exports = { aiSummaryController };
