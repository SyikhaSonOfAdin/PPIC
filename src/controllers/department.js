const { PPIC } = require("../config/db")
const { departmentServices } = require("../services/department")
const { userServices } = require("../services/user")

const departmentControllers = {
    add: async (req, res, next) => {
        const { companyId, userId, name } = req.body
        if (!companyId || !userId || !name) return res.status(400).json({ message: "Invalid Parameter" })

        try {
            const id = await departmentServices.add(companyId, userId, name)
            return res.status(200).json({
                message: "Department added successfully",
                data: [{
                    id: id,
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
                const connection = await PPIC.getConnection()
                try {
                    const users = await userServices.get.byDepId(rowId, connection)
                    await departmentServices.delete.onlyOne(rowId, connection)
                    if (users.length > 0) {
                        await Promise.all(users.map(user => userServices.delete.department(user.ID, connection)))
                    }
                    return res.status(200).json({
                        message: "Department deleted successfully",
                        data: []
                    })
                } catch (error) {
                    connection.rollback()
                    res.status(500).json({
                        message: error.message
                    })
                } finally {
                    connection.release()
                }
            } catch (error) {
                res.status(500).json({
                    message: error.message
                })
            }
        },
    },
    edit: async (req, res, next) => {
        const { rowId, userId, name } = req.body
        if (!rowId || !userId || !name) return res.status(400).json({ message: "Invalid Parameter" })
        try {
            await departmentServices.edit(rowId, name, userId)
            return res.status(200).json({
                message: "Department edited successfully",
                data: []
            })
        } catch (error) {
            res.status(500).json({
                message: error.message
            })
        }
    },
    get: {
        all: async (req, res, next) => {
            const companyId = req.params.companyId
            if (!companyId) return res.status(400).json({ message: "Invalid Parameter" })
            try {
                const data = await departmentServices.get.all(companyId)
                return res.status(200).json({
                    message: "Get Department successfully",
                    data: data
                })
            } catch (error) {
                res.status(500).json({
                    message: error.message
                })
            }
        },
        onlyOne: async (req, res, next) => {
            const departmentId = req.params.departmentId
            if (!departmentId) return res.status(400).json({ message: "Invalid Parameter" })
            try {
                const data = await departmentServices.get.onlyOne(departmentId)
                return res.status(200).json({
                    message: "Get Department successfully",
                    data: [data]
                })
            } catch (error) {
                res.status(500).json({
                    message: error.message
                })
            }
        },
    }
}

module.exports = {
    departmentControllers
}