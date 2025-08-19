const { productivityPeriodServices } = require("../services/productivityPeriod");
const { projectDetailServices } = require("../services/projectDetail");
const { projectServices } = require("../services/project");
const { PPIC } = require("../config/db");

const productivityPeriodControllers = {
    get: {
        by: {
            projectId: async (req, res) => {
                try {
                    const { companyId, projectId } = req.params;

                    const project = await projectDetailServices.get(projectId)

                    if (!project) {
                        return res.status(404).json({ message: "Project not found" });
                    }

                    let data

                    const project_period = await productivityPeriodServices.get.by.projectId(projectId)
                    const default_period = await productivityPeriodServices.get.by.period(companyId, project.START_DATE, project.DUE_DATE);

                    if (project_period.length >= default_period.length) {
                        data = project_period
                    } else {
                        data = default_period
                    }

                    res.status(200).json({ message: "Productivity periods retrieved successfully", data });
                } catch (error) {
                    res.status(500).json({ message: "Error retrieving productivity periods", error: error.message });
                }
            },
            companyId: async (req, res) => {
                const { companyId } = req.params;
                if (!companyId) {
                    return res.status(400).json({ message: "Invalid Parameter" });
                }

                let connection;
                try {
                    connection = await PPIC.getConnection();

                    const periods = await productivityPeriodServices.get.by.companyId(companyId, connection);
                    const projects = await Promise.all(periods.map(period =>
                        projectServices.get.by.periodId(period.ID, connection)
                    ));

                    const data = periods.map((period, index) => ({
                        ...period,
                        PROJECT: projects[index] || []
                    }));

                    res.status(200).json({
                        message: "Productivity periods retrieved successfully",
                        data
                    });
                } catch (error) {
                    console.error("Error retrieving productivity periods:", error);
                    res.status(500).json({
                        message: "Error retrieving productivity periods",
                        error: error.message
                    });
                } finally {
                    if (connection) {
                        connection.release();
                    }
                }
            }
        },
    }
}

module.exports = { productivityPeriodControllers };