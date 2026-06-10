"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.phaseScheduleServices = void 0;
const db_1 = require("../config/db");
const uuid_1 = require("uuid");
const phaseSchedule_1 = require("../models/phaseSchedule");
exports.phaseScheduleServices = {
    add: async (projectId, departmentId, phase, planStartWeek, planEndWeek, actualStartWeek, actualEndWeek, userId, connection) => {
        const CONNECTION = connection || await db_1.PPIC.getConnection();
        try {
            const [duplicate] = await CONNECTION.query(phaseSchedule_1.phaseScheduleQuerys.select.checkDuplicate, [projectId, departmentId, phase, '']);
            if (duplicate[0].count > 0) {
                throw new Error('Duplicate phase schedule for this department');
            }
            const id = (0, uuid_1.v7)();
            await CONNECTION.query(phaseSchedule_1.phaseScheduleQuerys.insert, [
                id,
                projectId,
                departmentId,
                phase,
                planStartWeek,
                planEndWeek,
                actualStartWeek,
                actualEndWeek,
                userId
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
    edit: async (rowId, departmentId, phase, planStartWeek, planEndWeek, actualStartWeek, actualEndWeek, userId, projectId, connection) => {
        const CONNECTION = connection || await db_1.PPIC.getConnection();
        try {
            const [duplicate] = await CONNECTION.query(phaseSchedule_1.phaseScheduleQuerys.select.checkDuplicate, [projectId, departmentId, phase, rowId]);
            if (duplicate[0].count > 0) {
                throw new Error('Duplicate phase schedule for this department');
            }
            await CONNECTION.query(phaseSchedule_1.phaseScheduleQuerys.update, [
                departmentId,
                phase,
                planStartWeek,
                planEndWeek,
                actualStartWeek,
                actualEndWeek,
                userId,
                rowId
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
    delete: {
        onlyOne: async (rowId, connection) => {
            const CONNECTION = connection || await db_1.PPIC.getConnection();
            try {
                await CONNECTION.query(phaseSchedule_1.phaseScheduleQuerys.delete.onlyOne, [rowId]);
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
        byProject: async (projectId, connection) => {
            const CONNECTION = connection || await db_1.PPIC.getConnection();
            try {
                await CONNECTION.query(phaseSchedule_1.phaseScheduleQuerys.delete.byProject, [projectId]);
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
        }
    },
    get: {
        byProject: async (projectId, connection) => {
            const CONNECTION = connection || await db_1.PPIC.getConnection();
            try {
                const [data] = await CONNECTION.query(phaseSchedule_1.phaseScheduleQuerys.select.byProject, [projectId]);
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
    }
};
