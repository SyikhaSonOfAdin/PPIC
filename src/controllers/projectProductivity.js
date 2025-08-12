const { projectProductivityService } = require("../services/projectProductivity");

const projectProductivityController = {
    add: async (req, res) => {
        try {
            const { processId, projectId, periodId, progress, manPower, manHour } = req.body
            if (!processId || !projectId || !periodId) return res.status(400).json({ message: "Invalid Parameters" })
            await projectProductivityService.add(processId, projectId, periodId, req.u?.user.id, progress, manPower, manHour);
            res.status(201).send({ message: "Project productivity data added successfully" });
        } catch (error) {
            res.status(500).send({ error: "An error occurred while adding project productivity data", message: error.message });
        }
    },
    get: {
        by: {
            projectId: async (req, res) => {
                try {
                    const { projectId } = req.params
                    if (!projectId) return res.status(400).json({ message: "Invalid Parameters" })
                    const data = await projectProductivityService.get.by.projectId(projectId)
                    res.status(201).send({ message: "Get Project productivity data successfully", data:data });
                } catch (error) {
                    res.status(500).send({ error: "An error occurred while adding project productivity data", message: error.message });
                }
            }
        }
    }
}

module.exports = { projectProductivityController };