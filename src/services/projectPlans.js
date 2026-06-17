"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plansServices = void 0;
const projectPlans_1 = require("../models/projectPlans");
const db_1 = require("../config/db");
const uuid_1 = require("uuid");
exports.plansServices = {
    add: async (projectId, userId, periodYear, periodMonth, percentage, amount, week, connection) => {
        const CONNECTION = connection || await db_1.PPIC.getConnection();
        try {
            const id = (0, uuid_1.v7)();
            await CONNECTION.query(projectPlans_1.plansQuerys.insert, [id, projectId, userId, periodYear, periodMonth, week, percentage, amount]);
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
            const CONNECTION = connection || await db_1.PPIC.getConnection();
            try {
                await CONNECTION.query(projectPlans_1.plansQuerys.delete.all, [projectId]);
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
        onlyOne: async (plansId, connection) => {
            const CONNECTION = connection || await db_1.PPIC.getConnection();
            try {
                await CONNECTION.query(projectPlans_1.plansQuerys.delete.onlyOne, [plansId]);
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
    edit: async (plansId, userId, start, end, percentage, amount, connection) => {
        const CONNECTION = connection || await db_1.PPIC.getConnection();
        try {
            await CONNECTION.query(projectPlans_1.plansQuerys.update.single.all, [userId, start, end, percentage, amount, plansId]);
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
    update: {
        percentage: async (projectId, connection) => {
            const CONNECTION = connection || await db_1.PPIC.getConnection();
            try {
                await CONNECTION.query(projectPlans_1.plansQuerys.update.byProjectId.percentage, [projectId]);
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
        all: async (projectId, connection) => {
            const CONNECTION = connection || await db_1.PPIC.getConnection();
            try {
                const [data] = await CONNECTION.query(projectPlans_1.plansQuerys.select.all, [projectId]);
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
        data: async (projectId, year, connection) => {
            const CONNECTION = connection || await db_1.PPIC.getConnection();
            try {
                const [data] = await CONNECTION.query(projectPlans_1.plansQuerys.select.data, [projectId, year]);
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
        numberOfRows: async (projectId, connection) => {
            const CONNECTION = connection || await db_1.PPIC.getConnection();
            try {
                const [data] = await CONNECTION.query(projectPlans_1.plansQuerys.select.rowsData, [projectId]);
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
    }
};
