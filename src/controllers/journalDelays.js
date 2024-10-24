const { delayServices } = require("../services/journalDelays")

const journaleDelaysControllers = {
    add: async (req, res, next) => {
        const { projectId, userId, days, description } = req.body
        if (!projectId || !userId || !days) return res.status(400).json({ message: "Invalid Parameter" })
        try {
            const id = await delayServices.add(projectId, userId, days, description)
            return res.status(200).json({
                message: "Delay Journal added successfully",
                data: [{
                    journalDelaysId: id,
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
            if (!projectId) return res.status(400).json({ message: "Invalid Parameter" })
            try {
                await delayServices.delete.all(projectId)
                return res.status(200).json({
                    message: "Delays Journal deleted successfully",
                    data: []
                })
            } catch (error) {
                res.status(500).json({
                    message: error.message
                })
            }
        },
        onlyOne: async (req, res, next) => {
            const { journalDelayId } = req.body
            if (!journalDelayId) return res.status(400).json({ message: "Invalid Parameter" })
            try {
                await delayServices.delete.onlyOne(journalDelayId)
                return res.status(200).json({
                    message: "Delay Journal deleted successfully",
                    data: []
                })
            } catch (error) {
                res.status(500).json({
                    message: error.message
                })
            }
        }
    },
    edit: async (req, res, next) => {
        const { journalDelayId, userId, days, description } = req.body
        if (!journalDelayId || !userId || !days) return res.status(400).json({ message: "Invalid Parameter" })
        try {
            await delayServices.edit(journalDelayId, userId, days, description)
            return res.status(200).json({
                message: "Delay Journal edited successfully",
                data: []
            })
        } catch (error) {
            res.status(500).json({
                message: error.message
            })
        }
    },
    get: async (req, res, next) => {
        const projectId  = req.params.projectId
        if (!projectId) return res.status(400).json({ message: "Invalid Parameter" })
        try {
            const data = await delayServices.get(projectId)
            return res.status(200).json({
                message: "Get Delay Journal successfully",
                data: data
            })
        } catch (error) {
            res.status(500).json({
                message: error.message
            })
        }
    },
}

module.exports = {
    journaleDelaysControllers
}