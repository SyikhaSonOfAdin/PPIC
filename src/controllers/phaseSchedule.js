const { phaseScheduleServices } = require("../services/phaseSchedule");

const phaseScheduleControllers = {
  add: async (req, res) => {
    const {
      projectId,
      departmentId,
      phase,
      planStartWeek,
      planEndWeek,
      actualStartWeek,
      actualEndWeek,
      userId
    } = req.body;

    if (!projectId || !departmentId || !phase || !planStartWeek || !planEndWeek || !userId) {
      return res.status(400).json({ message: "Invalid Parameter" });
    }

    try {
      const id = await phaseScheduleServices.add(
        projectId,
        departmentId,
        phase,
        planStartWeek,
        planEndWeek,
        actualStartWeek ?? null,
        actualEndWeek ?? null,
        userId
      );
      return res.status(200).json({
        message: "Phase schedule added successfully",
        data: { id }
      });
    } catch (error) {
      if (error.message.includes('Duplicate')) {
        return res.status(409).json({ message: error.message });
      }
      return res.status(500).json({ message: error.message });
    }
  },

  edit: async (req, res) => {
    const {
      rowId,
      projectId,
      departmentId,
      phase,
      planStartWeek,
      planEndWeek,
      actualStartWeek,
      actualEndWeek,
      userId
    } = req.body;

    if (!rowId || !projectId || !departmentId || !phase || !planStartWeek || !planEndWeek || !userId) {
      return res.status(400).json({ message: "Invalid Parameter" });
    }

    try {
      await phaseScheduleServices.edit(
        rowId,
        departmentId,
        phase,
        planStartWeek,
        planEndWeek,
        actualStartWeek ?? null,
        actualEndWeek ?? null,
        userId,
        projectId
      );
      return res.status(200).json({
        message: "Phase schedule updated successfully",
        data: { id: rowId }
      });
    } catch (error) {
      if (error.message.includes('Duplicate')) {
        return res.status(409).json({ message: error.message });
      }
      return res.status(500).json({ message: error.message });
    }
  },

  delete: {
    onlyOne: async (req, res) => {
      const { rowId } = req.body;

      if (!rowId) {
        return res.status(400).json({ message: "Invalid Parameter" });
      }

      try {
        await phaseScheduleServices.delete.onlyOne(rowId);
        return res.status(200).json({
          message: "Phase schedule deleted successfully",
          data: { id: rowId }
        });
      } catch (error) {
        return res.status(500).json({ message: error.message });
      }
    }
  },

  get: {
    byProject: async (req, res) => {
      const { projectId } = req.params;

      if (!projectId) {
        return res.status(400).json({ message: "Invalid Parameter" });
      }

      try {
        const data = await phaseScheduleServices.get.byProject(projectId);
        return res.status(200).json({
          message: "Success",
          data
        });
      } catch (error) {
        return res.status(500).json({ message: error.message });
      }
    }
  }
};

module.exports = { phaseScheduleControllers };
