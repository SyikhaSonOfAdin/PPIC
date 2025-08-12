const { processServices } = require("../services/process");


const processControllers = {
    add: async (req, res, next) => {
        try {
            const { companyId, name, description } = req.body;
            if (!companyId || !name || !description) {
                return res.status(400).json({ message: "Name and Description are required" });
            }
            await processServices.add(companyId, req.u.user.id, name, description);
            return res.status(201).json({
                message: "Add Process Successful",
                data: {}
            });
        } catch (error) {
            res.status(500).json({
                message: error.message
            });
        }
    },
    edit: async (req, res, next) => {
        try {
            const { id, name, description } = req.body;
            if (!id || !name || !description) {
                return res.status(400).json({ message: "ID, Name and Description are required" });
            }
            await processServices.edit(id, req.u.user.id, name, description);
            return res.status(200).json({
                message: "Edit Process Successful",
                data: {}
            });
        } catch (error) {
            res.status(500).json({
                message: error.message
            });
        }
    },
    delete: {
        onlyOne: async (req, res, next) => {
            try {
                const id = req.params.rowId;
                if (!id) return res.status(400).json({ message: "ID is required" });
                await processServices.delete.onlyOne(id);
                return res.status(200).json({
                    message: "Delete Process Successful",
                    data: {}
                });
            } catch (error) {
                res.status(500).json({
                    message: error.message
                });
            }
        }
    },
    get: {
        all: async (req, res, next) => {
            try {
                const companyId = req.params.companyId;
                const data = await processServices.get.all(companyId)
                return res.status(200).json({
                    message: "Get Processes Successful",
                    data: data
                });
            } catch (error) {
                res.status(500).json({
                    message: error.message
                });
            }
        },
        by: {
            projectId: async (req, res) => {
                try {
                    const { companyId, projectId } = req.params;
                    const data = await processServices.get.by.projectId(projectId)
                    return res.status(200).json({
                        message: "Get Processes Successful",
                        data: data
                    });
                } catch (error) {
                    res.status(500).json({
                        message: error.message
                    });
                }
            }
        }
    }
}

module.exports = { processControllers };