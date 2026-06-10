"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remarkServices = void 0;
const journalRemark_1 = require("../models/journalRemark");
const db_1 = require("../config/db");
const uuid_1 = require("uuid");
exports.remarkServices = {
    add: async (projectId, userId, departmentId, description, deadline, status, solution, connection) => {
        const CONNECTION = connection || (await db_1.PPIC.getConnection());
        try {
            const id = (0, uuid_1.v7)();
            await CONNECTION.query(journalRemark_1.remarkQuerys.insert, [
                id,
                projectId,
                userId,
                description,
                solution ?? null,
                deadline,
                departmentId,
                status,
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
    delete: {
        all: async (projectId, connection) => {
            const CONNECTION = connection || (await db_1.PPIC.getConnection());
            try {
                await CONNECTION.query(journalRemark_1.remarkQuerys.delete.all, [projectId]);
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
        onlyOne: async (remarkId, connection) => {
            const CONNECTION = connection || (await db_1.PPIC.getConnection());
            try {
                await CONNECTION.query(journalRemark_1.remarkQuerys.delete.onlyOne, [remarkId]);
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
    edit: async (remarkId, userId, description, deadline, departmentId, status, solution, connection) => {
        const CONNECTION = connection || (await db_1.PPIC.getConnection());
        try {
            await CONNECTION.query(journalRemark_1.remarkQuerys.update, [
                userId,
                description,
                solution ?? null,
                deadline,
                departmentId,
                status,
                remarkId,
            ]);
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
    get: {
        onlyOne: async (projectId, connection) => {
            const CONNECTION = connection || (await db_1.PPIC.getConnection());
            try {
                const [rows] = await CONNECTION.query(journalRemark_1.remarkQuerys.select.onlyOne, [
                    projectId,
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
        all: {
            forReport: async (companyId, connection) => {
                const CONNECTION = connection || (await db_1.PPIC.getConnection());
                try {
                    const [rows] = await CONNECTION.query(journalRemark_1.remarkQuerys.select.all.forReport, [companyId]);
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
            all: async (companyId, searchTerms = "", connection) => {
                const CONNECTION = connection || (await db_1.PPIC.getConnection());
                try {
                    const pattern = `%${searchTerms}%`;
                    const [rows] = await CONNECTION.query(journalRemark_1.remarkQuerys.select.all.all, [
                        companyId,
                        pattern,
                        pattern,
                        pattern,
                        pattern,
                        pattern,
                        pattern,
                        pattern,
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
            byDepId: async (companyId, departmentId, connection) => {
                const CONNECTION = connection || (await db_1.PPIC.getConnection());
                try {
                    const [rows] = await CONNECTION.query(journalRemark_1.remarkQuerys.select.all.byDepId, [
                        companyId,
                        departmentId,
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
        },
    },
};
