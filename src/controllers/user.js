const { permissionServices } = require("../services/permission");
const { userServices } = require("../services/user")
const { PPIC } = require("../config/db");
const jwt = require('jsonwebtoken');
const { privilegeServices } = require("../services/privilege");
const user = require("../models/user");

const userControllers = {
    add: async (req, res, next) => {
        const { companyId, username, email, password, permissions } = req.body;

        if (!companyId || !username || !email || !password || !permissions) {
            return res.status(400).json({ message: "Invalid Parameter" });
        }

        try {
            const connection = await PPIC.getConnection();

            try {
                await connection.beginTransaction();

                const id = await userServices.add(companyId, username, email, password, connection);

                for (const key of Object.keys(permissions)) {
                    await permissionServices.add(id, key, permissions[key], connection);
                }

                await connection.commit();

                return res.status(200).json({
                    message: `User added successfully`,
                    data: [{ userId: id }],
                });
            } catch (error) {
                await connection.rollback();
                return res.status(500).json({
                    message: "Failed to add user",
                    error: error.message,
                });
            } finally {
                connection.release();
            }
        } catch (error) {
            return res.status(500).json({
                message: "Failed to connect to database",
                error: error.message,
            });
        }

    },
    delete: {
        user: async (req, res, next) => {
            const { userId } = req.body

            if (!userId) return res.status(400).json({ message: "Invalid Parameter" })

            try {
                await userServices.delete.user(userId)
                return res.status(200).json({
                    message: `User deleted successfully`,
                    data: []
                })
            } catch (error) {
                res.status(500).json({
                    message: error.message
                })
            }
        },
        department: async (req, res, next) => {
            const { userId } = req.body

            if (!userId) return res.status(400).json({ message: "Invalid Parameter" })

            try {
                await userServices.delete.department(userId)
                return res.status(200).json({
                    message: `User deleted successfully`,
                    data: []
                })
            } catch (error) {
                res.status(500).json({
                    message: error.message
                })
            }
        },
    },
    update: {
        single: async (req, res, next) => {
            const { userId, username, email, permissions } = req.body

            if (!userId || !username || !email || !permissions) return res.status(400).json({ message: "Invalid Parameter" })

            try {
                const connection = await PPIC.getConnection();

                try {
                    await connection.beginTransaction();

                    const id = await userServices.edit.single(userId, username, email)

                    for (const key of Object.keys(permissions)) {
                        await permissionServices.add(id, key, permissions[key], connection);
                    }

                    await connection.commit();

                    return res.status(200).json({
                        message: `User edited successfully`,
                        data: [{ userId: id }],
                    });
                } catch (error) {
                    await connection.rollback();
                    return res.status(500).json({
                        message: "Failed to add user",
                        error: error.message,
                    });
                } finally {
                    connection.release();
                }
            } catch (error) {
                return res.status(500).json({
                    message: "Failed to connect to database",
                    error: error.message,
                });
            }
        },
        department: async (req, res, next) => {
            const { userId, departmentId } = req.body

            if (!userId || !departmentId) return res.status(400).json({ message: "Invalid Parameter" })

            try {
                await userServices.edit.department(departmentId, userId)
                return res.status(200).json({
                    message: `User updated successfully`,
                    data: []
                })
            } catch (error) {
                res.status(500).json({
                    message: error.message
                })
            }
        },
    },
    get: {
        all: async (req, res, next) => {
            const companyId = req.params.companyId
            if (!companyId) return res.status(400).json({ message: "Invalid Parameter" })
            try {
                const data = await userServices.get.all(companyId)
                return res.status(200).json({
                    message: "Get User successfully",
                    data: data
                })
            } catch (error) {
                res.status(500).json({
                    message: error.message
                })
            }
        },
        single: async (req, res, next) => {
            const userId = req.params.userId
            if (!userId) return res.status(400).json({ message: "Invalid Parameter" })
            try {
                const data = await userServices.get.single(userId)
                const privileges = await privilegeServices.get(userId)
                return res.status(200).json({
                    message: "Get User successfully",
                    data: {
                        user: data,
                        privileges: privileges
                    }
                })
            } catch (error) {
                res.status(500).json({
                    message: error.message
                })
            }
        },
        withoutDep: async (req, res, next) => {
            const companyId = req.params.companyId
            if (!companyId) return res.status(400).json({ message: "Invalid Parameter" })
            try {
                const data = await userServices.get.withoutDep(companyId)
                return res.status(200).json({
                    message: "Get User successfully",
                    data: data
                })
            } catch (error) {
                res.status(500).json({
                    message: error.message
                })
            }
        },
        byDepId: async (req, res, next) => {
            const companyId = req.params.companyId
            const departmentId = req.params.departmentId
            if (!companyId || !departmentId) return res.status(400).json({ message: "Invalid Parameter" })
            try {
                const data = await userServices.get.byDepId(departmentId)
                return res.status(200).json({
                    message: "Get User successfully",
                    data: data
                })
            } catch (error) {
                res.status(500).json({
                    message: error.message
                })
            }
        },
    },
    login: async (req, res, next) => {
        const { email, password } = req.body
        if (!email || !password) return res.status(400).json({ message: "Invalid Parameter" })
        try {
            const user = await userServices.login(email, password)
            if (typeof user !== 'string') {
                return res.status(200).json({
                    message: "Login Success",
                    data: [{
                        uId: user.ID,
                        uName: user.USERNAME,
                        cId: user.COMPANY_ID,
                        cName: user.COMPANY_NAME,
                        pId: user.PROJECT_ID,
                        eAddr: user.EMAIL,
                        t: jwt.sign({ email, user: {id: user.ID} }, process.env.JWT_SECRET, { expiresIn: '7d' }),
                        version: "1.4.7"
                    }]
                })
            }
            return res.status(401).json({ message: user })
        } catch (error) {
            res.status(500).json({
                message: error.message
            })
        }
    }
}

module.exports = {
    userControllers
}