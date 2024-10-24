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
    }
}

module.exports = {
    permissionController
}