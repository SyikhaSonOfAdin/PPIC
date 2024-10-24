const { delayedMaterialDetailServices } = require("../services/delayedMaterialDetail")

const delayedMaterialListDetailController = {
    add: async (req, res, next) => {
        const { delayListId, userId, identCode, description } = req.body
        if (!delayListId || !userId || !identCode || !description) return res.status(400).json({ message: "Invalid Parameters" })
        try {
            const id = await delayedMaterialDetailServices.add(delayListId, userId, identCode, description)
            return res.status(200).json({
                message: "Delayed Material Detail added successfully",
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
            const { delayListId } = req.body
            if (!delayListId) return res.status(400).json({ message: "Invalid Parameters" })
            try {
                await delayedMaterialDetailServices.delete.all(delayListId)
                return res.status(200).json({
                    message: "Delayed Material Detail deleted successfully",
                    data: []
                })
            } catch (error) {
                res.status(500).json({
                    message: error.message
                })
            }
        },
        onlyOne: async (req, res, next) => {
            const { delayDetailId } = req.body
            if (!delayDetailId) return res.status(400).json({ message: "Invalid Parameters" })
            try {
                await delayedMaterialDetailServices.delete.onlyOne(delayDetailId)
                return res.status(200).json({
                    message: "Delayed Material Detail deleted successfully",
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
        const { delayDetailId, userId, identCode, description } = req.body
        if (!delayDetailId || !userId || !identCode || !description) return res.status(400).json({ message: "Invalid Parameters" })
        try {
            await delayedMaterialDetailServices.edit(userId, identCode, description, delayDetailId)
            return res.status(200).json({
                message: "Delayed Material Detail edited successfully",
                data: []
            })
        } catch (error) {
            res.status(500).json({
                message: error.message
            })
        }
    },
    get: async (req, res, next) => {
        const delayListId = req.params.delayedListId
        if (!delayListId) return res.status(400).json({ message: "Invalid Parameters" })
        try {
            const data = await delayedMaterialDetailServices.get(delayListId)
            return res.status(200).json({
                message: "Get Delayed Material Detail successfully",
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
    delayedMaterialListDetailController
}