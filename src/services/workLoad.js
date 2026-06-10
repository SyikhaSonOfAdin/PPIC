"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workLoadServices = void 0;
const db_1 = require("../config/db");
const uuid_1 = require("uuid");
const workLoad_1 = require("../models/workLoad");
exports.workLoadServices = {
    add: async (categoryId, userId, year, workLoad, connection) => {
        const CONNECTION = connection || (await db_1.PPIC.getConnection());
        try {
            const id = (0, uuid_1.v7)();
            await CONNECTION.query(workLoad_1.workLoadQuerys.insert, [
                id,
                categoryId,
                userId,
                year,
                workLoad,
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
    edit: async (id, userId, year, workLoad, connection) => {
        const CONNECTION = connection || (await db_1.PPIC.getConnection());
        try {
            await CONNECTION.query(workLoad_1.workLoadQuerys.update, [
                userId,
                year,
                workLoad,
                id,
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
        onlyOne: async (id, connection) => {
            const CONNECTION = connection || (await db_1.PPIC.getConnection());
            try {
                await CONNECTION.query(workLoad_1.workLoadQuerys.delete, [id]);
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
    get: {
        onlyOne: {
            byYear: async (categoryId, year, connection) => {
                const CONNECTION = connection || (await db_1.PPIC.getConnection());
                try {
                    const [data] = await CONNECTION.query(workLoad_1.workLoadQuerys.select.onlyOne.byYear, [
                        categoryId,
                        year,
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
        all: async (companyId, connection) => {
            const CONNECTION = connection || (await db_1.PPIC.getConnection());
            try {
                const [data] = await CONNECTION.query(workLoad_1.workLoadQuerys.select.all, [companyId]);
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
