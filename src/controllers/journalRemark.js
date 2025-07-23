const { render } = require("@react-email/render")
const React = require('react');
const { emailServices } = require("../services/email")
const { remarkServices } = require("../services/journalRemark");
const { departmentServices } = require("../services/department");
const { userServices } = require("../services/user");
const { PPIC } = require("../config/db");
const ProjectRemark = require("../../dist/templates/email/ProjectRemark").default;

const journalRemarkController = {
    add: async (req, res, next) => {
        const { projectId, userId, description, solution, deadline, departmentId, status } = req.body
        if (!projectId || !userId || !description || !deadline || !departmentId || !status) return res.status(400).json({ message: "Invalid Parameters" })
        try {
            const id = await remarkServices.add(projectId, userId, departmentId, description, deadline, status, solution)
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
        const { remarkId, userId, description, solution, deadline, departmentId, status } = req.body
        if (!remarkId || !userId || !description || !deadline || !departmentId || !status) return res.status(400).json({ message: "Invalid Parameters" })
        try {
            await remarkServices.edit(remarkId, userId, description, deadline, departmentId, status, solution)
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
        all: {
            forReport: async (req, res, next) => {
                const companyId = req.params.companyId
                if (!companyId) return res.status(400).json({ message: "Invalid Parameters" })
                try {
                    const data = await remarkServices.get.all.forReport(companyId)
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
                const s = req.query.s
                if (!companyId) return res.status(400).json({ message: "Invalid Parameters" })
                try {
                    const data = await remarkServices.get.all.all(companyId, s)
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
    },
    sendEmail: async (req, res) => {
        const companyId = req.params.companyId
        if (!companyId) return res.status(400).json({ message: "Invalid Parameters" })
        try {
            const connection = await PPIC.getConnection()
            try {
                const departments = await departmentServices.get.all(companyId, connection)
                departments.forEach(async dep => {
                    const data = await remarkServices.get.all.byDepId(companyId, dep.ID, connection)
                    const users = await userServices.get.byDepId(dep.ID, connection)
                    if (data.length > 0) {
                        const htmlStatic = emailServices.template.projectRemark(dep.COMPANY_NAME, dep.NAME, data)
                        const emails = users.length > 1 ? users.map(u => (u.EMAIL)).join(", ") : users.map(u => (u.EMAIL))[0]
                        await emailServices.sendEmail(
                            emails,
                            "Remarks Reminder",
                            "",
                            htmlStatic
                        );
                    }
                })
                return res.status(200).json({
                    message: "Send Email Remark Journal successfully",
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
}

module.exports = { journalRemarkController }