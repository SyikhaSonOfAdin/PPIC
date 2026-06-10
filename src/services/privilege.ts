import { PoolConnection } from "mysql2/promise";
import { PPIC } from "../config/db";
import { privilegeQuerys } from "../models/privilege";
import { v7 } from "uuid";

export const privilegeServices = {
    add: async (userId: string, permissionId: string, connection?: PoolConnection) => {
        const CONNECTION: PoolConnection = connection || await PPIC.getConnection()

        try {
            const id: string = v7()
            await CONNECTION.query(privilegeQuerys.insert, [id, userId, permissionId])
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
        all: async (userId: string, connection?: PoolConnection) => {
            const CONNECTION: PoolConnection = connection || await PPIC.getConnection()
    
            try {
                await CONNECTION.query(privilegeQuerys.delete.all, [userId])
                if (!connection) await CONNECTION.commit();
            } catch (error) {
                throw error
            } finally {
                if (!connection && CONNECTION) {
                    CONNECTION.release()
                }
            }
        },
        onlyOne: async (userId: string, permissionId: string, connection?: PoolConnection) => {
            const CONNECTION: PoolConnection = connection || await PPIC.getConnection()
    
            try {
                await CONNECTION.query(privilegeQuerys.delete.onlyOne, [userId, permissionId])
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
    get: async (userId: string, connection?: PoolConnection) => {
        const CONNECTION: PoolConnection = connection || await PPIC.getConnection()

        try {
            const [data] = await CONNECTION.query(privilegeQuerys.get, [userId])
            return data as { ID: string; PERMISSION_ID: string; USER_ID: string; GRANTED: number }[]
        } catch (error) {
            throw error
        } finally {
            if (!connection && CONNECTION) {
                CONNECTION.release()
            }
        }
    }
}