"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delayedMaterialDetailServices = void 0;
const db_1 = require("../config/db");
const uuid_1 = require("uuid");
const delayedMaterialDetail_1 = require("../models/delayedMaterialDetail");
exports.delayedMaterialDetailServices = {
    add: async (delayedListId, userId, identCode, description, connection) => {
        const CONNECTION = connection || await db_1.PPIC.getConnection();
        try {
            const id = (0, uuid_1.v7)();
            await CONNECTION.query(delayedMaterialDetail_1.delayedMaterialDetailQuerys.insert, [id, delayedListId, userId, identCode, description]);
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
        all: async (delayedListId, connection) => {
            const CONNECTION = connection || await db_1.PPIC.getConnection();
            try {
                await CONNECTION.query(delayedMaterialDetail_1.delayedMaterialDetailQuerys.delete.all, [delayedListId]);
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
        onlyOne: async (delayedDetailId, connection) => {
            const CONNECTION = connection || await db_1.PPIC.getConnection();
            try {
                await CONNECTION.query(delayedMaterialDetail_1.delayedMaterialDetailQuerys.delete.onlyOne, [delayedDetailId]);
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
    edit: async (userId, identCode, description, delayedDetailId, connection) => {
        const CONNECTION = connection || await db_1.PPIC.getConnection();
        try {
            await CONNECTION.query(delayedMaterialDetail_1.delayedMaterialDetailQuerys.update, [userId, identCode, description, delayedDetailId]);
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
    get: async (delayedListId, connection) => {
        const CONNECTION = connection || await db_1.PPIC.getConnection();
        try {
            const [data] = await CONNECTION.query(delayedMaterialDetail_1.delayedMaterialDetailQuerys.select, [delayedListId]);
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
