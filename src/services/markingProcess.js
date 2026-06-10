"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markingProcessServices = void 0;
const markingProcess_1 = require("../models/markingProcess");
const db_1 = require("../config/db");
const uuid_1 = require("uuid");
exports.markingProcessServices = {
    add: async (markingId, processId, userId, actualDate, connection) => {
        const CONNECTION = connection || (await db_1.PPIC.getConnection());
        try {
            const id = (0, uuid_1.v7)();
            await CONNECTION.query(markingProcess_1.markingProcessQuerys.insert, [
                id,
                markingId,
                processId,
                userId,
                new Date(actualDate),
            ]);
            if (!connection)
                await CONNECTION.commit();
            return id;
        }
        catch (error) {
            throw error;
        }
        finally {
            if (!connection) {
                CONNECTION.release();
            }
        }
    },
    edit: async (rowId, userId, actualDate, connection) => {
        const CONNECTION = connection || (await db_1.PPIC.getConnection());
        try {
            await CONNECTION.query(markingProcess_1.markingProcessQuerys.update, [
                new Date(actualDate),
                userId,
                rowId,
            ]);
            if (!connection)
                await CONNECTION.commit();
        }
        catch (error) {
            throw error;
        }
        finally {
            if (!connection) {
                CONNECTION.release();
            }
        }
    },
    get: {}
};
