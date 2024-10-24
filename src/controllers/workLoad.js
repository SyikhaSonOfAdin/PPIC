const { workLoadServices } = require("../services/workLoad")

const workLoadControllers = {
    add: async (req, res, next) => {
        const { categoryId, userId, year, workLoad } = req.body
        if (!categoryId || !userId || !year || !workLoad) return res.status(400).json({ message: "Invalid Parameter" })
        try {
            const id = await workLoadServices.add(categoryId, userId, year, workLoad)
            return res.status(200).json({
                message: "Work Load added successfully",
                data: [{
                    workLoad: id,
                }]
            })
        } catch (error) {
            res.status(500).json({
                message: error.message
            })
        }
    },
    edit: async (req, res, next) => {
        const { rowId, userId, year, workLoad } = req.body
        if (!rowId || !userId || !year || !workLoad) return res.status(400).json({ message: "Invalid Parameter" })
        try {
            await workLoadServices.edit(rowId, userId, year, workLoad)
            return res.status(200).json({
                message: "Work Load edited successfully",
                data: []
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
                await workLoadServices.delete.onlyOne(rowId)
                return res.status(200).json({
                    message: "Work Load deleted successfully",
                    data: []
                })
            } catch (error) {
                res.status(500).json({
                    message: error.message
                })
            }
        }
    },
    get: async (req, res, next) => {
        const companyId = req.params.companyId
        if (!companyId) return res.status(400).json({ message: "Invalid Parameter" })
        try {
            const data = await workLoadServices.get.all(companyId)
            return res.status(200).json({
                message: "Get Work Load successfully",
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
    workLoadControllers
}