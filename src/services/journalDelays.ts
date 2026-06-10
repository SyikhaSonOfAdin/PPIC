import { FieldPacket, PoolConnection, RowDataPacket } from "mysql2/promise";
import { delayQuerys } from "../models/journalDelays";
import { PPIC } from "../config/db";
import { v7 } from "uuid";

export const delayServices = {
  add: async (
    projectId: string,
    userId: string,
    days: number,
    description: string,
    connection?: PoolConnection
  ) => {
    const CONNECTION: PoolConnection =
      connection || (await PPIC.getConnection());
    try {
      const id: string = v7();
      await CONNECTION.query(delayQuerys.insert, [
        id,
        projectId,
        userId,
        days,
        description,
      ]);
      if (!connection) await CONNECTION.commit();
      return id;
    } catch (error) {
      throw error;
    } finally {
      if (!connection && CONNECTION) {
        CONNECTION.release();
      }
    }
  },
  delete: {
    all: async (projectId: string, connection?: PoolConnection) => {
      const CONNECTION: PoolConnection =
        connection || (await PPIC.getConnection());
      try {
        await CONNECTION.query(delayQuerys.delete.all, [projectId]);
        if (!connection) await CONNECTION.commit();
      } catch (error) {
        throw error;
      } finally {
        if (!connection && CONNECTION) {
          CONNECTION.release();
        }
      }
    },
    onlyOne: async (delayId: string, connection?: PoolConnection) => {
      const CONNECTION: PoolConnection =
        connection || (await PPIC.getConnection());
      try {
        await CONNECTION.query(delayQuerys.delete.onlyOne, [delayId]);
        if (!connection) await CONNECTION.commit();
      } catch (error) {
        throw error;
      } finally {
        if (!connection && CONNECTION) {
          CONNECTION.release();
        }
      }
    },
  },
  edit: async (
    delayId: string,
    userId: string,
    days: number,
    description: string,
    connection?: PoolConnection
  ) => {
    const CONNECTION: PoolConnection =
      connection || (await PPIC.getConnection());
    try {
      await CONNECTION.query(delayQuerys.update, [
        userId,
        days,
        description,
        delayId,
      ]);
      if (!connection) await CONNECTION.commit();
    } catch (error) {
      throw error;
    } finally {
      if (!connection && CONNECTION) {
        CONNECTION.release();
      }
    }
  },
  get: async (projectId: string, connection?: PoolConnection) => {
    const CONNECTION: PoolConnection =
      connection || (await PPIC.getConnection());
    try {
      const [data]: [RowDataPacket[], FieldPacket[]] = await CONNECTION.query(
        delayQuerys.select,
        [projectId]
      );
      return data[0];
    } catch (error) {
      throw error;
    } finally {
      if (!connection && CONNECTION) {
        CONNECTION.release();
      }
    }
  },
};
