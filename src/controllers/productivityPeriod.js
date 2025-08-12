const { productivityPeriodServices } = require("../services/productivityPeriod");
const { projectDetailServices } = require("../services/projectDetail");

const productivityPeriodControllers = {
    get: {
        byProject: async (req, res) => {
            try {
                const { companyId, projectId } = req.params;
                const project = await projectDetailServices.get(projectId)
                if (!project) {
                    return res.status(404).json({ message: "Project not found" });
                }
                const data = await productivityPeriodServices.get.byPeriod(companyId, project.START_DATE, project.DUE_DATE);
                res.status(200).json({ message: "Productivity periods retrieved successfully", data });
            } catch (error) {
                res.status(500).json({ message: "Error retrieving productivity periods", error: error.message });
            }
        }
    }
}

module.exports = { productivityPeriodControllers };