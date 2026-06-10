import { FieldPacket, PoolConnection, RowDataPacket } from "mysql2/promise";
import { delayedMaterialQuerys } from "../models/delayedMaterial";
import { PPIC } from "../config/db";
import { v7 } from "uuid";

export const delayedMaterialServices = {
    add: async (projectId: string, userId: string, incomingDate: Date, connection?: PoolConnection) => {
        const CONNECTION: PoolConnection = connection || await PPIC.getConnection()
        try {
            const id: string = v7()
            await CONNECTION.query(delayedMaterialQuerys.insert, [id, projectId, userId, incomingDate])   
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
        all: async (projectId: string, connection?: PoolConnection) => {
            const CONNECTION: PoolConnection = connection || await PPIC.getConnection()
            try {
                await CONNECTION.query(delayedMaterialQuerys.delete.all, [projectId])
                if (!connection) await CONNECTION.commit();
            } catch (error) {
                throw error
            } finally {
                if (!connection && CONNECTION) {
                    CONNECTION.release()
                }
            }
        },
        onlyOne: async (delayedId: string, connection?: PoolConnection) => {
            const CONNECTION: PoolConnection = connection || await PPIC.getConnection()
            try {
                await CONNECTION.query(delayedMaterialQuerys.delete.onlyOne, [delayedId])
                if (!connection) await CONNECTION.commit();
            } catch (error) {
                throw error
            } finally {
                if (!connection && CONNECTION) {
                    CONNECTION.release()
                }
            }
        }
    },
    edit: async (userId: string, incomingDate: Date, delayedId: string, connection?: PoolConnection) => {
        const CONNECTION: PoolConnection = connection || await PPIC.getConnection()
        try {
            await CONNECTION.query(delayedMaterialQuerys.update, [userId, incomingDate, delayedId])
            if (!connection) await CONNECTION.commit();
        } catch (error) {
            throw error
        } finally {
            if (!connection || CONNECTION) {
                CONNECTION.release()
            }
        }
    },
    get: async (projectId: string, connection?: PoolConnection) => {
        const CONNECTION: PoolConnection = connection || await PPIC.getConnection()
        try {
            const [data] = await CONNECTION.query(delayedMaterialQuerys.select, [projectId])
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