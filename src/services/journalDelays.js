"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delayServices = void 0;
const journalDelays_1 = require("../models/journalDelays");
const db_1 = require("../config/db");
const uuid_1 = require("uuid");
exports.delayServices = {
    add: async (projectId, userId, days, description, connection) => {
        const CONNECTION = connection || (await db_1.PPIC.getConnection());
        try {
            const id = (0, uuid_1.v7)();
            await CONNECTION.query(journalDelays_1.delayQuerys.insert, [
                id,
                projectId,
                userId,
                days,
                description,
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
    delete: {
        all: async (projectId, connection) => {
            const CONNECTION = connection || (await db_1.PPIC.getConnection());
            try {
                await CONNECTION.query(journalDelays_1.delayQuerys.delete.all, [projectId]);
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
        onlyOne: async (delayId, connection) => {
            const CONNECTION = connection || (await db_1.PPIC.getConnection());
            try {
                await CONNECTION.query(journalDelays_1.delayQuerys.delete.onlyOne, [delayId]);
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
    edit: async (delayId, userId, days, description, connection) => {
        const CONNECTION = connection || (await db_1.PPIC.getConnection());
        try {
            await CONNECTION.query(journalDelays_1.delayQuerys.update, [
                userId,
                days,
                description,
                delayId,
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
    get: async (projectId, connection) => {
        const CONNECTION = connection || (await db_1.PPIC.getConnection());
        try {
            const [data] = await CONNECTION.query(journalDelays_1.delayQuerys.select, [projectId]);
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
