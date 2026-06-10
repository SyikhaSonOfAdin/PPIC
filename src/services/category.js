"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryServices = void 0;
const category_1 = require("../models/category");
const db_1 = require("../config/db");
const uuid_1 = require("uuid");
exports.categoryServices = {
    add: async (companyId, userId, name, description, unitOfMeasurement, connection) => {
        const CONNECTION = connection || (await db_1.PPIC.getConnection());
        try {
            const id = (0, uuid_1.v7)();
            await CONNECTION.query(category_1.categoryQuerys.insert, [
                id,
                companyId,
                userId,
                name,
                description,
                unitOfMeasurement,
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
    edit: async (categoryId, name, description, unitOfMeasurement, userId, connection) => {
        const CONNECTION = connection || (await db_1.PPIC.getConnection());
        try {
            await CONNECTION.query(category_1.categoryQuerys.update, [
                name,
                description,
                unitOfMeasurement,
                userId,
                categoryId,
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
        onlyOne: async (categoryId, connection) => {
            const CONNECTION = connection || (await db_1.PPIC.getConnection());
            try {
                await CONNECTION.query(category_1.categoryQuerys.delete.onlyOne, [categoryId]);
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
        all: async (companyId, connection) => {
            const CONNECTION = connection || (await db_1.PPIC.getConnection());
            try {
                const [data] = await CONNECTION.query(category_1.categoryQuerys.select.all, [companyId]);
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
        onlyOne: async (rowId, connection) => {
            const CONNECTION = connection || (await db_1.PPIC.getConnection());
            try {
                const [data] = await CONNECTION.query(category_1.categoryQuerys.select.onlyOne, [rowId]);
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
        oneByName: async (name, connection) => {
            const CONNECTION = connection || (await db_1.PPIC.getConnection());
            try {
                const [data] = await CONNECTION.query(category_1.categoryQuerys.select.byName, [`%${name}%`]);
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
