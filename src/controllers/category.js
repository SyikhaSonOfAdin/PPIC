const { categoryServices } = require("../services/category")

const categoryControllers = {
    add: async (req, res, next) => {
        const { companyId, userId, name, description, uom } = req.body
        if (!companyId || !userId || !name || !uom) return res.status(400).json({ message: "Invalid Parameter" })

        try {
            const id = await categoryServices.add(companyId, userId, name, description, uom)
            return res.status(200).json({
                message: "Category added successfully",
                data: [{
                    categoryId: id,
                }]
            })
        } catch (error) {
            res.status(500).json({
                message: error.message
            })
        }
    },
    delete: {
        onlyOne: async (req, res, next) => {
            const { rowId } = req.body
            if (!rowId) return res.status(400).json({ message: "Invalid Parameter" })
            try {
                await categoryServices.delete.onlyOne(rowId)
                return res.status(200).json({
                    message: "Category deleted successfully",
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
        const { rowId, userId, name, description, uom } = req.body
        if (!rowId || !userId || !name || !uom) return res.status(400).json({ message: "Invalid Parameter" })
        try {
            await categoryServices.edit(rowId, name, description, uom, userId)
            return res.status(200).json({
                message: "Category edited successfully",
                data: []
            })
        } catch (error) {
            res.status(500).json({
                message: error.message
            })
        }
    },
    get: async (req, res, next) => {
        const companyId = req.params.companyId
        if (!companyId) return res.status(400).json({ message: "Invalid Parameter" })
        try {
            const data = await categoryServices.get(companyId)
            return res.status(200).json({
                message: "Get Category successfully",
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
    categoryControllers
}