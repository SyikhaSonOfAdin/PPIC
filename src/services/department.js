"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.departmentServices = void 0;
const department_1 = require("../models/department");
const db_1 = require("../config/db");
const uuid_1 = require("uuid");
exports.departmentServices = {
    add: async (companyId, userId, name, connection) => {
        const CONNECTION = connection || (await db_1.PPIC.getConnection());
        try {
            const id = (0, uuid_1.v7)();
            await CONNECTION.query(department_1.departmentQuerys.insert, [
                id,
                companyId,
                userId,
                name,
            ]);
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
    edit: async (id, name, userId, connection) => {
        const CONNECTION = connection || (await db_1.PPIC.getConnection());
        try {
            await CONNECTION.query(department_1.departmentQuerys.update, [userId, name, id]);
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
        onlyOne: async (id, connection) => {
            const CONNECTION = connection || (await db_1.PPIC.getConnection());
            try {
                await CONNECTION.query(department_1.departmentQuerys.delete.onlyOne, [id]);
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
    get: {
        all: async (companyId, connection) => {
            const CONNECTION = connection || (await db_1.PPIC.getConnection());
            try {
                const [data] = await CONNECTION.query(department_1.departmentQuerys.select.all, [companyId]);
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
        },
        onlyOne: async (id, connection) => {
            const CONNECTION = connection || (await db_1.PPIC.getConnection());
            try {
                const [data] = await CONNECTION.query(department_1.departmentQuerys.select.onlyOne, [id]);
                return data[0];
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
};
