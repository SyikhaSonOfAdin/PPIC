import { PoolConnection } from "mysql2/promise";
import { PPIC } from "../config/db";
import { v7 } from "uuid";
import { delayedMaterialDetailQuerys } from "../models/delayedMaterialDetail";

export const delayedMaterialDetailServices = {
    add: async (delayedListId: string, userId: string, identCode: string, description: string, connection?: PoolConnection) => {
        const CONNECTION: PoolConnection = connection || await PPIC.getConnection()
        try {
            const id: string = v7()
            await CONNECTION.query(delayedMaterialDetailQuerys.insert, [id, delayedListId, userId, identCode, description])
            if (!connection) await CONNECTION.commit();
            return id
        } catch (error) {
            throw error
        } finally {
            if (!connection && CONNECTION) {
                CONNECTION.release()
            }
        }
    },
    delete: {
        all: async (delayedListId: string, connection?: PoolConnection) => {
            const CONNECTION: PoolConnection = connection || await PPIC.getConnection()
            try {
                await CONNECTION.query(delayedMaterialDetailQuerys.delete.all, [delayedListId])   
                if (!connection) await CONNECTION.commit();
            } catch (error) {
                throw error
            } finally {
                if (!connection && CONNECTION) {
                    CONNECTION.release()
                }
            }
        },
        onlyOne: async (delayedDetailId: string, connection?: PoolConnection) => {
            const CONNECTION: PoolConnection = connection || await PPIC.getConnection()
            try {
                await CONNECTION.query(delayedMaterialDetailQuerys.delete.onlyOne, [delayedDetailId])   
                if (!connection) await CONNECTION.commit();
            } catch (error) {
                throw error
            } finally {
                if (!connection && CONNECTION) {
                    CONNECTION.release()
                }
            }
        },
    },
    edit: async (userId: string, identCode: string, description: string, delayedDetailId: string, connection?: PoolConnection) => {
        const CONNECTION: PoolConnection = connection || await PPIC.getConnection()
        try {
            await CONNECTION.query(delayedMaterialDetailQuerys.update, [userId, identCode, description, delayedDetailId])
            if (!connection) await CONNECTION.commit();
        } catch (error) {
            throw error
        } finally {
            if (!connection && CONNECTION) {
                CONNECTION.release()
            }
        }
    },
    get: async (delayedListId: string, connection?: PoolConnection) => {
        const CONNECTION: PoolConnection = connection || await PPIC.getConnection()
        try {
            const [data] = await CONNECTION.query(delayedMaterialDetailQuerys.select, [delayedListId])
            return data
        } catch (error) {
            throw error
        } finally {
            if (!connection && CONNECTION) {
                CONNECTION.release()
            }
        }
    }
}