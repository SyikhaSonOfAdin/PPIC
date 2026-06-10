"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delayedMaterialListServices = void 0;
const delayedMaterialList_1 = require("../models/delayedMaterialList");
const db_1 = require("../config/db");
const uuid_1 = require("uuid");
exports.delayedMaterialListServices = {
    add: async (delayedId, userId, identCode, description, qty, connection) => {
        const CONNECTION = connection || await db_1.PPIC.getConnection();
        try {
            const id = (0, uuid_1.v7)();
            await CONNECTION.query(delayedMaterialList_1.delayedMaterialListQuerys.insert, [id, delayedId, userId, identCode, description, qty]);
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
        all: async (delayedId, connection) => {
            const CONNECTION = connection || await db_1.PPIC.getConnection();
            try {
                await CONNECTION.query(delayedMaterialList_1.delayedMaterialListQuerys.delete.all, [delayedId]);
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
        onlyOne: async (delayedListId, connection) => {
            const CONNECTION = connection || await db_1.PPIC.getConnection();
            try {
                await CONNECTION.query(delayedMaterialList_1.delayedMaterialListQuerys.delete.onlyOne, [delayedListId]);
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
    edit: async (userId, identCode, description, qty, delayedListId, connection) => {
        const CONNECTION = connection || await db_1.PPIC.getConnection();
        try {
            await CONNECTION.query(delayedMaterialList_1.delayedMaterialListQuerys.update, [userId, identCode, description, qty, delayedListId]);
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
    get: async (delayedId, connection) => {
        const CONNECTION = connection || await db_1.PPIC.getConnection();
        try {
            const [data] = await CONNECTION.query(delayedMaterialList_1.delayedMaterialListQuerys.select, [delayedId]);
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
