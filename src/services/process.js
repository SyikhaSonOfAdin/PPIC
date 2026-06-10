"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processServices = void 0;
const db_1 = require("../config/db");
const uuid_1 = require("uuid");
const process_1 = require("../models/process");
exports.processServices = {
    add: async (companyId, userId, name, description, connection) => {
        const CONNECTION = connection || (await db_1.PPIC.getConnection());
        try {
            const id = (0, uuid_1.v7)();
            await CONNECTION.query(process_1.processQuerys.insert, [
                id,
                companyId,
                userId,
                name,
                description,
            ]);
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
    edit: async (rowId, userId, name, description, connection) => {
        const CONNECTION = connection || (await db_1.PPIC.getConnection());
        try {
            await CONNECTION.query(process_1.processQuerys.update, [
                name,
                description,
                userId,
                rowId,
            ]);
            if (!connection)
                await CONNECTION.commit();
            return;
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
        onlyOne: async (rowId, connection) => {
            const CONNECTION = connection || (await db_1.PPIC.getConnection());
            try {
                await CONNECTION.query(process_1.processQuerys.delete.onlyOne, [rowId]);
                if (!connection)
                    await CONNECTION.commit();
                return;
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
                const [rows] = await CONNECTION.query(process_1.processQuerys.select["*"], [
                    companyId,
                ]);
                return rows;
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
        by: {
            projectId: async (projectId, connection) => {
                const CONNECTION = connection || (await db_1.PPIC.getConnection());
                try {
                    const [rows] = await CONNECTION.query(process_1.processQuerys.select.where.projectId, [projectId]);
                    return rows;
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
    },
};
