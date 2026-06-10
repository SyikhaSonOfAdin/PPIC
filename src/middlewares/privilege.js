"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.privilege = void 0;
const privilege_1 = require("../services/privilege");
const db_1 = require("../config/db");
exports.privilege = {
    hasPrivilege: (permissionId) => {
        return async (req, res, next) => {
            try {
                const conn = await db_1.PPIC.getConnection();
                try {
                    const userId = req.u?.user?.id;
                    if (!userId) {
                        return res
                            .status(401)
                            .json({ message: "missing userId please login again!" });
                    }
                    const userPrivileges = await privilege_1.privilegeServices.get(userId, conn);
                    const hasPermission = userPrivileges.find((privilege) => privilege.PERMISSION_ID === permissionId);
                    if (!hasPermission || hasPermission.GRANTED === 0) {
                        return res.status(403).json({
                            message: "Your access denied, you don't have the required permission.",
                        });
                    }
                    next();
                }
                catch (error) {
                    conn.rollback();
                    res.status(500).json({
                        message: "Internal Server Error",
                        error: error.message,
                    });
                }
                finally {
                    conn.release();
                }
            }
            catch (error) {
                res.status(500).json({
                    message: "Internal Server Error",
                    error: error.message,
                });
            }
        };
    },
};
