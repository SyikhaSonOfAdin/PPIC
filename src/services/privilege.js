"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.privilegeServices = void 0;
const db_1 = require("../config/db");
const privilege_1 = require("../models/privilege");
const uuid_1 = require("uuid");
exports.privilegeServices = {
    add: async (userId, permissionId, connection) => {
        const CONNECTION = connection || await db_1.PPIC.getConnection();
        try {
            const id = (0, uuid_1.v7)();
            await CONNECTION.query(privilege_1.privilegeQuerys.insert, [id, userId, permissionId]);
            if (!connection)
                await CONNECTION.commit();
            return id;
        }
        catch (error) {
            throw error;
        }
        finally {
            if (!connection && CONNECTION) {
                CONNECTION.release();
            }
        }
    },
    delete: {
        all: async (userId, connection) => {
            const CONNECTION = connection || await db_1.PPIC.getConnection();
            try {
                await CONNECTION.query(privilege_1.privilegeQuerys.delete.all, [userId]);
                if (!connection)
                    await CONNECTION.commit();
            }
            catch (error) {
                throw error;
            }
            finally {
                if (!connection && CONNECTION) {
                    CONNECTION.release();
                }
            }
        },
        onlyOne: async (userId, permissionId, connection) => {
            const CONNECTION = connection || await db_1.PPIC.getConnection();
            try {
                await CONNECTION.query(privilege_1.privilegeQuerys.delete.onlyOne, [userId, permissionId]);
                if (!connection)
                    await CONNECTION.commit();
            }
            catch (error) {
                throw error;
            }
            finally {
                if (!connection && CONNECTION) {
                    CONNECTION.release();
                }
            }
        },
    },
    get: async (userId, connection) => {
        const CONNECTION = connection || await db_1.PPIC.getConnection();
        try {
            const [data] = await CONNECTION.query(privilege_1.privilegeQuerys.get, [userId]);
            return data;
        }
        catch (error) {
            throw error;
        }
        finally {
            if (!connection && CONNECTION) {
                CONNECTION.release();
            }
        }
    }
};
