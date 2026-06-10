"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectProductivityService = void 0;
const projectProductivity_1 = require("../models/projectProductivity");
const db_1 = require("../config/db");
const uuid_1 = require("uuid");
exports.projectProductivityService = {
    add: async (processId, projectId, periodId, userId, progress, manPower, manHour, connection) => {
        const CONNECTION = connection || (await db_1.PPIC.getConnection());
        try {
            const id = (0, uuid_1.v7)();
            await CONNECTION.query(projectProductivity_1.projectProductivityQuery.insert, [
                id,
                processId,
                projectId,
                periodId,
                userId,
                progress,
                manPower,
                manHour,
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
    get: {
        by: {
            projectId: async (projectId, connection) => {
                const CONNECTION = connection || (await db_1.PPIC.getConnection());
                try {
                    const [data] = await CONNECTION.query(projectProductivity_1.projectProductivityQuery.select.by.projectId, [projectId]);
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
            companyId: async (companyId, connection) => {
                const CONNECTION = connection || (await db_1.PPIC.getConnection());
                try {
                    const [data] = await CONNECTION.query(projectProductivity_1.projectProductivityQuery.select.by.companyId, [companyId]);
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
