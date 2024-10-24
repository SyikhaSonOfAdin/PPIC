const { permissionServices } = require("../services/permission");
const { privilegeServices } = require("../services/privilege");
const { companyServices } = require("../services/company")
const { emailServices } = require("../services/email")
const { userServices } = require("../services/user");
const { PPIC } = require("../config/db");
const jwt = require('jsonwebtoken');

const companyControllers = {
    registration: async (req, res, next) => {
        const { name, email, password } = req.body

        if (!name || !email || !password) return res.status(400).json({ message: "Invalid Parameter" })

        const currentTime = new Date();
        const expirationTime = new Date(currentTime.getTime() + 5 * 60000);
        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '5m' });
        const formattedExpirationTime = `${expirationTime.getHours()}:${expirationTime.getMinutes().toString().padStart(2, '0')}`;

        try {
            const isExist = await userServices.check.email(email)
            if (isExist) return res.status(403).json({ message: "Email already used" })
            const connection = await PPIC.getConnection()
            try {
                await connection.beginTransaction()
                const companyId = await companyServices.add(name, connection) // create company
                const userId = await userServices.add(companyId, "root", name, email, password, connection) // create user
                const permissions = await permissionServices.get(connection) // get permissions
                await Promise.all(permissions.map(async (permission) => {
                    await privilegeServices.add(userId, permission.ID, connection) // assign permission
                }))
                await emailServices.sendEmail(email, "Syikha PPIC Dashboard Activation", "", `Klik this link to finish registration :<br>Company Name: ${name}<br><a href="${process.env.URL}/company/reg/c/${companyId}?token=${token}">Click Here</a><br>This link will be valid until ${formattedExpirationTime}`)
                await connection.commit()
                return res.status(200).json({ message: "Registration Success" })
            } catch (error) {
                connection.rollback()
                return res.status(500).json({
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
    edit: {
        name: async (req, res, next) => {
            const { id, name } = req.body

            if (!id || !name) return res.status(400).json({ message: "Invalid Parameter" })

            try {
                await companyServices.edit.name(id, name)
                res.status(200).json({ message: "Registration Success" })
            } catch (error) {
                res.status(500).json({
                    message: error.message
                })
            }
        },
        setActive: async (req, res, next) => {
            const id = req.params.cId

            if (!id) return res.status(400).json({ message: "Invalid Parameter" })

            try {
                await companyServices.edit.status(id, 'ACTIVE')
                res.status(200).json({ message: "Activation Success" })
            } catch (error) {
                res.status(500).json({
                    message: error.message
                })
            }
        }
    }
}

module.exports = {
    companyControllers
}