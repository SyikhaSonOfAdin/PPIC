import { FieldPacket, PoolConnection, RowDataPacket } from "mysql2/promise";
import { actualQuerys } from "../models/projectActual";
import { PPIC } from "../config/db";
import { v7 } from "uuid";

export const actualServices = {
    add: async (projectId: string, userId: string, start: Date, end: Date, percentage: number, amount: number, week: string, connection?: PoolConnection) => {
        const CONNECTION: PoolConnection = connection || await PPIC.getConnection()
        try {
            const id: string = v7()
            await CONNECTION.query(actualQuerys.insert, [id, projectId, userId, start, end, week, percentage, amount])
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
                await CONNECTION.query(actualQuerys.delete.all, [projectId])
                if (!connection) await CONNECTION.commit();
            } catch (error) {
                throw error
            } finally {
                if (!connection && CONNECTION) {
                    CONNECTION.release()
                }
            }
        },
        onlyOne: async (plansId: string, connection?: PoolConnection) => {
            const CONNECTION: PoolConnection = connection || await PPIC.getConnection()
            try {
                await CONNECTION.query(actualQuerys.delete.onlyOne, [plansId])
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
    edit: async (plansId: string, userId: string, start: Date, end: Date, percentage: number, amount: number, connection?: PoolConnection) => {
        const CONNECTION: PoolConnection = connection || await PPIC.getConnection()
        try {
            await CONNECTION.query(actualQuerys.update.single.all, [userId, start, end, percentage, amount, plansId])
            if (!connection) await CONNECTION.commit();
        } catch (error) {
            throw error
        } finally {
            if (!connection && CONNECTION) {
                CONNECTION.release()
            }
        }
    },
    update: {
        percentage: async (projectId: string, connection?: PoolConnection) => {
            const CONNECTION: PoolConnection = connection || await PPIC.getConnection()
            try {
                await CONNECTION.query(actualQuerys.update.byProjectId.percentage, [projectId])
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
    get: {
        all: async (projectId: string, connection?: PoolConnection) => {
            const CONNECTION: PoolConnection = connection || await PPIC.getConnection()
            try {
                const [data] = await CONNECTION.query(actualQuerys.select.all, [projectId])
                return data as {
                    ID: string,
                    INPUT_BY: string,
                    INPUT_DATE: string,
                    PERIOD_YEAR: number,
                    PERIOD_MONTH: string,
                    WEEK: string,
                    PERCENTAGE: number,
                    AMOUNT: number
                }[]
            } catch (error) {
                throw error
            } finally {
                if (!connection && CONNECTION) {
                    CONNECTION.release()
                }
            }
        },
        data: async (projectId: string, year: number, connection?: PoolConnection) => {
            const CONNECTION: PoolConnection = connection || await PPIC.getConnection()
            try {
                const [data] = await CONNECTION.query(actualQuerys.select.data, [projectId, year])
                return data
            } catch (error) {
                throw error
            } finally {
                if (!connection && CONNECTION) {
                    CONNECTION.release()
                }
            }
        },
        numberOfRows: async (projectId: string, connection?: PoolConnection) => {
            const CONNECTION: PoolConnection = connection || await PPIC.getConnection()
            try {
                const [data] = await CONNECTION.query(actualQuerys.select.rowsData, [projectId])
                return data
            } catch (error) {
                throw error
            } finally {
                if (!connection && CONNECTION) {
                    CONNECTION.release()
                }
            }
        },
    }
}