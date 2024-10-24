const { plansServices } = require("../services/projectPlans")

const projectPlansController = {
    add: async (req, res, next) => {
        const { projectId, userId, periodYear, periodMonth, amount } = req.body
        if (!projectId || !userId || !periodYear || !periodMonth || !amount) return res.status(400).json({ message: "Invalid Parameters" })
        try {
            const id = await plansServices.add(projectId, userId, periodYear, periodMonth, amount)
            return res.status(200).json({
                message: "Project Plans added successfully",
                data: [{
                    plansId: id,
                }]
            })
        } catch (error) {
            res.status(500).json({
                message: error.message
            })
        }
    },
    delete: {
        all: async (req, res, next) => {
            const { projectId } = req.body
            if (!projectId) return res.status(400).json({ message: "Invalid Parameters" })
            try {
                await plansServices.delete.all(projectId)
                return res.status(200).json({
                    message: "Project Plans deleted successfully",
                    data: []
                })
            } catch (error) {
                res.status(500).json({
                    message: error.message
                })
            }
        },
        onlyOne: async (req, res, next) => {
            const { rowId } = req.body
            if (!rowId) return res.status(400).json({ message: "Invalid Parameters" })
            try {
                await plansServices.delete.onlyOne(rowId)
                return res.status(200).json({
                    message: "Project Plan deleted successfully",
                    data: []
                })
            } catch (error) {
                res.status(500).json({
                    message: error.message
                })
            }
        },
    },
    edit: async (req, res, next) => {
        const { rowId, userId, periodYear, periodMonth, amount } = req.body
        if (!rowId || !userId || !periodYear || !periodMonth || !amount) return res.status(400).json({ message: "Invalid Parameters" })
        try {
            await plansServices.edit(rowId, userId, periodYear, periodMonth, amount)
            return res.status(200).json({
                message: "Project Plan edited successfully",
                data: []
            })
        } catch (error) {
            res.status(500).json({
                message: error.message
            })
        }
    },
    get: async (req, res, next) => {
        const projectId = req.params.projectId
        if (!projectId) return res.status(400).json({ message: "Invalid Parameters" })
        try {
            const data = await plansServices.get(projectId)
            return res.status(200).json({
                message: "Project Plans Detail get successfully",
                data: data
            })
        } catch (error) {
            res.status(500).json({
                message: error.message
            })
        }
    }
}

module.exports = {
    projectPlansController
}