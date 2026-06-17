"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectDetailServices = void 0;
const projectDetail_1 = require("../models/projectDetail");
const db_1 = require("../config/db");
const uuid_1 = require("uuid");
const utils_1 = require("../utils");
exports.projectDetailServices = {
    add: async (data, connection) => {
        const { projectId, userId, name, spk, description, ppm, capacity, workPlace, startDate, dueDate, finishDate, delivery, budget, cost, man_hours, periodInterval, periodType, } = data;
        const CONNECTION = connection || (await db_1.PPIC.getConnection());
        try {
            const id = (0, uuid_1.v7)();
            await CONNECTION.query(projectDetail_1.projectDetailQuerys.insert, [
                id,
                projectId,
                userId,
                name,
                spk,
                description,
                ppm,
                capacity,
                workPlace,
                startDate,
                dueDate,
                finishDate !== "" ? finishDate : null,
                delivery ? true : false,
                delivery !== "" ? delivery : null,
                null,
                budget ?? null,
                cost ?? null,
                man_hours ?? null,
                null,
                periodInterval ?? null,
                periodType ?? null,
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
    delete: async (projectId, connection) => {
        const CONNECTION = connection || (await db_1.PPIC.getConnection());
        try {
            await CONNECTION.query(projectDetail_1.projectDetailQuerys.delete.onlyOne, [projectId]);
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
    edit: {
        all: async (data, connection) => {
            const { userId, name, spk, description, ppm, capacity, workPlace, startDate, dueDate, finishDate, delivery, budget, cost, projectId, man_hours, } = data;
            const CONNECTION = connection || (await db_1.PPIC.getConnection());
            try {
                const { actualProgress } = await (0, utils_1.progressPercentage)(projectId, CONNECTION);
                // prettier-ignore
                const productivity_cost = cost && cost !== 0 && actualProgress !== 0 ? Number(cost) / Number(actualProgress) : null;
                // prettier-ignore
                const productivity = man_hours && man_hours !== 0 && actualProgress !== 0 ? Number(actualProgress) / Number(man_hours) : null;
                await CONNECTION.query(projectDetail_1.projectDetailQuerys.update.all, [
                    userId,
                    name,
                    spk,
                    description,
                    ppm,
                    capacity,
                    workPlace,
                    startDate,
                    dueDate,
                    finishDate,
                    delivery ? true : false,
                    delivery ?? null,
                    productivity,
                    budget ?? null,
                    cost ?? null,
                    // @ts-ignore
                    man_hours && man_hours != "" ? man_hours : null,
                    productivity_cost ?? null,
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
        deliver: async (projectId, connection) => {
            const CONNECTION = connection || (await db_1.PPIC.getConnection());
            try {
                await CONNECTION.query(projectDetail_1.projectDetailQuerys.update.deliver, [projectId]);
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
    get: async (projectId, connection) => {
        const CONNECTION = connection || (await db_1.PPIC.getConnection());
        try {
            const [data] = await CONNECTION.query(projectDetail_1.projectDetailQuerys.select.byProjectId, [projectId]);
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
};
