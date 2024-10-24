const { delayedMaterialListServices } = require("../services/delayedMaterialList")

const delayedMaterialListController = {
    add: async (req, res, next) => {
        const { delayId, userId, identCode, description, qty } = req.body
        if (!delayId || !userId || !identCode || !description || !qty) return res.status(400).json({ message: "Invalid Parameters" })
        try {
            const id = await delayedMaterialListServices.add(delayId, userId, identCode, description, qty)
            return res.status(200).json({
                message: "Delayed Material List added successfully",
                data: [{
                    delayListId: id,
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
            const { delayId } = req.body
            if (!delayId) return res.status(400).json({ message: "Invalid Parameters" })
            try {
                await delayedMaterialListServices.delete.all(delayId)
                return res.status(200).json({
                    message: "Delayed Material List deleted successfully",
                    data: []
                })
            } catch (error) {
                res.status(500).json({
                    message: error.message
                })
            }
        },
        onlyOne: async (req, res, next) => {
            const { delayListId } = req.body
            if (!delayListId) return res.status(400).json({ message: "Invalid Parameters" })
            try {
                await delayedMaterialListServices.delete.onlyOne(delayListId)
                return res.status(200).json({
                    message: "Delayed Material List deleted successfully",
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
        const { delayListId, userId, identCode, description, qty } = req.body
        if (!delayListId || !userId || !identCode || !description || !qty) return res.status(400).json({ message: "Invalid Parameters" })
        try {
            const id = await delayedMaterialListServices.edit(userId, identCode, description, qty, delayListId)
            return res.status(200).json({
                message: "Delayed Material List edited successfully",
                data: []
            })
        } catch (error) {
            res.status(500).json({
                message: error.message
            })
        }
    },
    get: async (req, res, next) => {
        const delayId = req.params.delayId
        if (!delayId) return res.status(400).json({ message: "Invalid Parameters" })
        try {
            const data = await delayedMaterialListServices.get(delayId)
            return res.status(200).json({
                message: "Get Delayed Material List successfully",
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
    delayedMaterialListController
}