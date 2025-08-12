const { permissionServices } = require("../services/permission")

const permissionController = {
    get: async (req, res, next) => {
        try {
            const data = await permissionServices.get()
            return res.status(200).json({
                message: "Get Permission Successful",
                data: data
            })
        } catch (error) {
            res.status(500).json({
                message: error.message
            })
        }
    },
    add: async (req, res, next) => {
        try {
            const { name, description } = req.body
            if (!name || !description) return res.status(400).json({ message: "Name and Description are required" })
            await permissionServices.addNewServices(name, description)
            return res.status(201).json({
                message: "Add Permission Successful",
                data: {}
            })
        } catch (error) {
            res.status(500).json({
                message: error.message
            })
        }
    }
}

module.exports = {
    permissionController
}