"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectServices = void 0;
const project_1 = require("../models/project");
const db_1 = require("../config/db");
const uuid_1 = require("uuid");
exports.projectServices = {
    add: async (companyId, categoryId, projectNo, client, userId, connection) => {
        const CONNECTION = connection || (await db_1.PPIC.getConnection());
        try {
            const id = (0, uuid_1.v7)();
            await CONNECTION.query(project_1.projectQuerys.insert, [
                id,
                companyId,
                categoryId,
                projectNo,
                client,
                userId,
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
    addBulk: async (data, connection) => {
        // prettier-ignore
        const CONNECTION = connection || (await db_1.PPIC.getConnection());
        try {
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
        onlyOne: async (projectId, connection) => {
            const CONNECTION = connection || (await db_1.PPIC.getConnection());
            try {
                await CONNECTION.query(project_1.projectQuerys.delete.onlyOne, [projectId]);
                if (!connection)
                    await CONNECTION.commit();
            }
            catch (error) {
                throw error;
            }
            finally {
                CONNECTION.release();
            }
        },
    },
    edit: async (projectId, categoryId, projectNo, client, userId, connection) => {
        const CONNECTION = connection || (await db_1.PPIC.getConnection());
        try {
            await CONNECTION.query(project_1.projectQuerys.update.all, [
                categoryId,
                projectNo,
                client,
                userId,
                projectId,
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
        by: {
            periodId: async (periodId, connection) => {
                const CONNECTION = connection || (await db_1.PPIC.getConnection());
                try {
                    const [data] = await CONNECTION.query(project_1.projectQuerys.select.by.periodId, [
                        periodId,
                    ]);
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
        },
        all: async (companyId, searchPattern = "", connection) => {
            const CONNECTION = connection || (await db_1.PPIC.getConnection());
            try {
                const pattern = `%${searchPattern}%`;
                const [data] = await CONNECTION.query(project_1.projectQuerys.select.all, [
                    companyId,
                    pattern,
                    pattern,
                    pattern,
                    pattern,
                    pattern,
                    pattern,
                    pattern,
                    pattern,
                    pattern,
                    pattern,
                ]);
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
        onlyOne: async (projectId, connection) => {
            const CONNECTION = connection || (await db_1.PPIC.getConnection());
            try {
                const [data] = await CONNECTION.query(project_1.projectQuerys.select.onlyOne, [projectId]);
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
        byCategoryId: async (categoryId, connection) => {
            const CONNECTION = connection || (await db_1.PPIC.getConnection());
            try {
                const [data] = await CONNECTION.query(project_1.projectQuerys.select.byCatgoeryId, [categoryId]);
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
    },
};
