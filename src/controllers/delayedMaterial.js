const { delayedMaterialServices } = require("../services/delayedMaterial")

const delayedMaterialController = {
    add: async (req, res, next) => {
        const { projectId, userId, incomingDate } = req.body
        if (!projectId || !userId || !incomingDate) return res.status(400).json({ message: "Invalid Parameters" })
        try {
            const id = await delayedMaterialServices.add(projectId, userId, incomingDate)
            return res.status(200).json({
                message: "Delayed Material added successfully",
                data: [{
                    materialDelayId: id,
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
                await delayedMaterialServices.delete.all(projectId)
                return res.status(200).json({
                    message: "Delayed Material deleted successfully",
                    data: []
                })
            } catch (error) {
                res.status(500).json({
                    message: error.message
                })
            }
        },
        onlyOne: async (req, res, next) => {
            const { materialDelayId } = req.body
            if (!materialDelayId) return res.status(400).json({ message: "Invalid Parameters" })
            try {
                await delayedMaterialServices.delete.onlyOne(materialDelayId)
                return res.status(200).json({
                    message: "Delayed Material deleted successfully",
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
        const { materialDelayId, userId, incomingDate } = req.body
        if (!materialDelayId || !userId || !incomingDate) return res.status(400).json({ message: "Invalid Parameters" })
        try {
            await delayedMaterialServices.edit(userId, incomingDate, materialDelayId)
            return res.status(200).json({
                message: "Delayed Material edited successfully",
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
        if (!projectId) return res.status(400).json({ message: "Invalid Parameter" })
        try {
            const data = await delayedMaterialServices.get(projectId)
            return res.status(200).json({
                message: "Get Delayed Material successfully",
                data: data
            })
        } catch (error) {
            res.status(500).json({
                message: error.message
            })
        }
    },
}

module.exports = { delayedMaterialController }