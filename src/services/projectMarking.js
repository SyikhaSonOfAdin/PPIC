"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectMarkingServices = void 0;
const projectMarking_1 = require("../models/projectMarking");
const db_1 = require("../config/db");
const uuid_1 = require("uuid");
exports.projectMarkingServices = {
    add: async (projectId, userId, marking, connection) => {
        const CONNECTION = connection || (await db_1.PPIC.getConnection());
        try {
            const id = (0, uuid_1.v7)();
            await CONNECTION.query(projectMarking_1.projectMarkingQuerys.insert, [
                id,
                projectId,
                userId,
                marking,
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
    update: {
        by: {
            markingId: async (marking, userId, rowId, connection) => {
                const CONNECTION = connection || (await db_1.PPIC.getConnection());
                try {
                    await CONNECTION.query(projectMarking_1.projectMarkingQuerys.update.by.id, [
                        userId,
                        marking,
                        rowId,
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
        },
    },
    delete: {
        by: {
            markingId: async (rowId, connection) => {
                const CONNECTION = connection || (await db_1.PPIC.getConnection());
                try {
                    await CONNECTION.query(projectMarking_1.projectMarkingQuerys.delete.by.id, [
                        rowId,
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
            projectId: async (projectId, connection) => {
                const CONNECTION = connection || (await db_1.PPIC.getConnection());
                try {
                    await CONNECTION.query(projectMarking_1.projectMarkingQuerys.delete.by.projectId, [
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
        },
    },
    get: {
        by: {
            projectId: async (projectId, connection) => {
                const CONNECTION = connection || (await db_1.PPIC.getConnection());
                try {
                    const [data] = await CONNECTION.query(projectMarking_1.projectMarkingQuerys.select.by.projectId, [projectId]);
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
    },
};
