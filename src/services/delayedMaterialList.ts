import { delayedMaterialListQuerys } from "../models/delayedMaterialList";
import { PoolConnection } from "mysql2/promise";
import { PPIC } from "../config/db";
import { v7 } from "uuid";

export const delayedMaterialListServices = {
    add: async (delayedId: string, userId: string, identCode: string, description: string, qty: number, connection?: PoolConnection) => {
        const CONNECTION: PoolConnection = connection || await PPIC.getConnection()
        try {
            const id: string = v7()
            await CONNECTION.query(delayedMaterialListQuerys.insert, [id, delayedId, userId, identCode, description, qty])
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
        all: async (delayedId: string, connection?: PoolConnection) => {
            const CONNECTION: PoolConnection = connection || await PPIC.getConnection()
            try {
                await CONNECTION.query(delayedMaterialListQuerys.delete.all, [delayedId])   
                if (!connection) await CONNECTION.commit();
            } catch (error) {
                throw error
            } finally {
                if (!connection && CONNECTION) {
                    CONNECTION.release()
                }
            }
        },
        onlyOne: async (delayedListId: string, connection?: PoolConnection) => {
            const CONNECTION: PoolConnection = connection || await PPIC.getConnection()
            try {
                await CONNECTION.query(delayedMaterialListQuerys.delete.onlyOne, [delayedListId])   
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
    edit: async (userId: string, identCode: string, description: string, qty: number, delayedListId: string, connection?: PoolConnection) => {
        const CONNECTION: PoolConnection = connection || await PPIC.getConnection()
        try {
            await CONNECTION.query(delayedMaterialListQuerys.update, [userId, identCode, description, qty, delayedListId])
            if (!connection) await CONNECTION.commit();
        } catch (error) {
            throw error
        } finally {
            if (!connection && CONNECTION) {
                CONNECTION.release()
            }
        }
    },
    get: async (delayedId: string, connection?: PoolConnection) => {
        const CONNECTION: PoolConnection = connection || await PPIC.getConnection()
        try {
            const [data] = await CONNECTION.query(delayedMaterialListQuerys.select, [delayedId])
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