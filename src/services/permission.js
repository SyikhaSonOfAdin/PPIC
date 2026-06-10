"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.permissionServices = void 0;
const permissions_1 = require("../models/permissions");
const db_1 = require("../config/db");
const uuid_1 = require("uuid");
exports.permissionServices = {
    get: async (connection) => {
        const CONNECTION = connection || (await db_1.PPIC.getConnection());
        try {
            const [data] = await CONNECTION.query(permissions_1.permissionsQuerys.get.all);
            const permissions = data;
            return permissions;
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
    add: async (userId, permissionId, granted, connection) => {
        const CONNECTION = connection || (await db_1.PPIC.getConnection());
        try {
            const id = (0, uuid_1.v7)();
            await CONNECTION.query(permissions_1.userPermissionsQuery.insert, [
                id,
                userId,
                permissionId,
                granted,
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
    addNewServices: async (name, description, connection) => {
        const CONNECTION = connection || (await db_1.PPIC.getConnection());
        try {
            const id = (0, uuid_1.v7)();
            await CONNECTION.query(permissions_1.permissionsQuerys.add, [id, name, description]);
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
};
