const { remarkServices } = require("../services/journalRemark")

const journalRemarkController = {
    add: async (req, res, next) => {
        const { projectId, userId, description } = req.body
        if (!projectId || !userId || !description) return res.status(400).json({ message: "Invalid Parameters" })
        try {
            const id = await remarkServices.add(projectId, userId, description)
            return res.status(200).json({
                message: "Remark Journal added successfully",
                data: [{
                    journalRemarkId: id,
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
                await remarkServices.delete.all(projectId)
                return res.status(200).json({
                    message: "Remarks Journal deleted successfully",
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
                await remarkServices.delete.onlyOne(rowId)
                return res.status(200).json({
                    message: "Remark Journal deleted successfully",
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
        const { remarkId, userId, description } = req.body
        if (!remarkId || !userId || !description) return res.status(400).json({ message: "Invalid Parameters" })
        try {
            await remarkServices.edit(remarkId, userId, description)
            return res.status(200).json({
                message: "Remark Journal edited successfully",
                data: []
            })
        } catch (error) {
            res.status(500).json({
                message: error.message
            })
        }
    },
    get: {
        onlyOne: async (req, res, next) => {
            const projectId = req.params.projectId
            if (!projectId) return res.status(400).json({ message: "Invalid Parameters" })
            try {
                const data = await remarkServices.get.onlyOne(projectId)
                return res.status(200).json({
                    message: "Get Remark Journal successfully",
                    data: data
                })
            } catch (error) {
                res.status(500).json({
                    message: error.message
                })
            }
        },
        all: async (req, res, next) => {
            const companyId = req.params.companyId
            if (!companyId) return res.status(400).json({ message: "Invalid Parameters" })
            try {
                const data = await remarkServices.get.all(companyId)
                return res.status(200).json({
                    message: "Get Remark Journal successfully",
                    data: data
                })
            } catch (error) {
                res.status(500).json({
                    message: error.message
                })
            }
        },
    }
}

module.exports = { journalRemarkController }