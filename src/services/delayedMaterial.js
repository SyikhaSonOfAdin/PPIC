"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delayedMaterialServices = void 0;
const delayedMaterial_1 = require("../models/delayedMaterial");
const db_1 = require("../config/db");
const uuid_1 = require("uuid");
exports.delayedMaterialServices = {
    add: async (projectId, userId, incomingDate, connection) => {
        const CONNECTION = connection || await db_1.PPIC.getConnection();
        try {
            const id = (0, uuid_1.v7)();
            await CONNECTION.query(delayedMaterial_1.delayedMaterialQuerys.insert, [id, projectId, userId, incomingDate]);
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
                await CONNECTION.query(delayedMaterial_1.delayedMaterialQuerys.delete.all, [projectId]);
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
        onlyOne: async (delayedId, connection) => {
            const CONNECTION = connection || await db_1.PPIC.getConnection();
            try {
                await CONNECTION.query(delayedMaterial_1.delayedMaterialQuerys.delete.onlyOne, [delayedId]);
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
    edit: async (userId, incomingDate, delayedId, connection) => {
        const CONNECTION = connection || await db_1.PPIC.getConnection();
        try {
            await CONNECTION.query(delayedMaterial_1.delayedMaterialQuerys.update, [userId, incomingDate, delayedId]);
            if (!connection)
                await CONNECTION.commit();
        }
        catch (error) {
            throw error;
        }
        finally {
            if (!connection || CONNECTION) {
                CONNECTION.release();
            }
        }
    },
    get: async (projectId, connection) => {
        const CONNECTION = connection || await db_1.PPIC.getConnection();
        try {
            const [data] = await CONNECTION.query(delayedMaterial_1.delayedMaterialQuerys.select, [projectId]);
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
};
