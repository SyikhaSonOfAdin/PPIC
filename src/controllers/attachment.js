const { attachmentServices } = require("../services/attachment")
const path = require("path")
const fs = require('fs');
const { PPIC } = require("../config/db");

const attachmentControllers = {
    add: async (req, res, next) => {
        const fileName = req.file?.filename
        const { projectId, userId, description } = req.body
        if (!projectId || !userId || !fileName) return res.status(400).json({ message: "Invalid Parameter" })

        try {
            const id = await attachmentServices.add(projectId, userId, fileName, description)
            return res.status(200).json({
                message: "Attachment saved successfully",
                data: [{
                    attachmentId: id,
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
                    const fileName = await attachmentServices.get.fileName(rowId, connection)
                    const filePath = path.join(__dirname, '../../../uploads/ppic', fileName[0]["FILE_NAME"]);
                    await attachmentServices.delete.onlyOne(rowId, connection)

                    fs.unlink(filePath, (err) => {
                        if (err) {
                            throw err
                        }
                        return res.status(200).json({
                            message: "Attachment deleted successfully",
                            data: []
                        })
                    });
                } catch (error) {
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
        const { rowId, userId, description } = req.body
        if (!rowId || !userId) return res.status(400).json({ message: "Invalid Parameter" })
        try {
            await attachmentServices.edit(rowId, userId, description)

            return res.status(200).json({
                message: "Attachment edited successfully",
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
            const data = await attachmentServices.get.all(projectId)
            return res.status(200).json({
                message: "Get Attachments data successfully",
                data: data
            })
        } catch (error) {
            res.status(500).json({
                message: error.message
            })
        }
    },
    download: async (req, res, next) => {
        const fileName = req.params.fileName
        if (!fileName) return res.status(400).json({ message: "Invalid Parameter" })
        try {
            const filePath = path.join(__dirname, '../../../uploads/ppic', fileName);
            return res.download(filePath, fileName, (err) => {
                if (err) {
                    return next(err);
                }
            });
        } catch (error) {
            res.status(500).json({
                message: error.message
            })
        }
    }
}

module.exports = {
    attachmentControllers
}