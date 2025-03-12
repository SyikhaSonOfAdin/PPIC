const { actualServices } = require("../services/projectActual")

const projectActualController = {
    add: async (req, res, next) => {
        const { projectId, userId, periodYear, periodMonth, amount } = req.body
        if (!projectId || !userId || !periodYear || !periodMonth || !amount) return res.status(400).json({ message: "Invalid Parameters" })
        try {
            const numberOfRows = await actualServices.get.numberOfRows(projectId)
            const id = await actualServices.add(projectId, userId, periodYear, periodMonth, amount, `Week ${parseInt(numberOfRows[0].NUMBER_OF_ROWS) + 1}`)
            return res.status(200).json({
                message: "Project Actual added successfully",
                data: [{
                    actualId: id,
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
                await actualServices.delete.all(projectId)
                return res.status(200).json({
                    message: "Project Actual deleted successfully",
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
                await actualServices.delete.onlyOne(rowId)
                return res.status(200).json({
                    message: "Project Actual deleted successfully",
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
            await actualServices.edit(rowId, userId, periodYear, periodMonth, amount)
            return res.status(200).json({
                message: "Project Actual edited successfully",
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
            const data = await actualServices.get.all(projectId)
            return res.status(200).json({
                message: "Project Actual Detail get successfully",
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
    projectActualController
}