const { productivityPeriodServices } = require("../services/productivityPeriod");
const { projectServices } = require("../services/project");
const { projectProductivityService } = require("../services/projectProductivity");

const projectProductivityController = {
    add: async (req, res) => {
        try {
            const { processId, projectId, periodId, startDate, dueDate, progress, manPower, manHour } = req.body
            if (!processId || !projectId) return res.status(400).json({ message: "Invalid Parameters" })

            if (!periodId || periodId == "") {
                if (!startDate || !dueDate) return res.status(400).json({ message: "Invalid Parameters" })
                const project = await projectServices.get.onlyOne(projectId)
                const period = await productivityPeriodServices.get.by.period(project.COMPANY_ID, startDate, dueDate)

                if (period.length > 0) {
                    await projectProductivityService.add(processId, projectId, period[0].ID, req.u?.user.id, progress, manPower, manHour);
                } else {
                    const id = await productivityPeriodServices.add.single(project.COMPANY_ID, startDate, dueDate)
                    await projectProductivityService.add(processId, projectId, id, req.u?.user.id, progress, manPower, manHour);
                }

                return res.status(201).send({ message: "Project productivity data added successfully" });
            } else if (periodId) {
                await projectProductivityService.add(processId, projectId, periodId, req.u?.user.id, progress, manPower, manHour);
            }
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
                    res.status(201).send({ message: "Get Project productivity data successfully", data: data });
                } catch (error) {
                    res.status(500).send({ error: "An error occurred while adding project productivity data", message: error.message });
                }
            },
            companyId: async (req, res) => {
                try {
                    const { companyId } = req.params
                    if (!companyId) return res.status(400).json({ message: "Invalid Parameters" })
                    const data = await projectProductivityService.get.by.companyId(companyId)
                    res.status(201).send({ message: "Get Project productivity data successfully", data: data });
                } catch (error) {
                    res.status(500).send({ error: "An error occurred while adding project productivity data", message: error.message });
                }
            }
        }
    }
}

module.exports = { projectProductivityController };