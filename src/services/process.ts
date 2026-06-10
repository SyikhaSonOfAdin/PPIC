import { PoolConnection } from "mysql2/promise";
import { PPIC } from "../config/db";
import { v7 } from "uuid";
import { processQuerys } from "../models/process";

export const processServices = {
  add: async (
    companyId: string,
    userId: string,
    name: string,
    description: string,
    connection?: PoolConnection
  ) => {
    const CONNECTION: PoolConnection =
      connection || (await PPIC.getConnection());
    try {
      const id: string = v7();
      await CONNECTION.query(processQuerys.insert, [
        id,
        companyId,
        userId,
        name,
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
  edit: async (
    rowId: string,
    userId: string,
    name: string,
    description: string,
    connection?: PoolConnection
  ) => {
    const CONNECTION: PoolConnection =
      connection || (await PPIC.getConnection());
    try {
      await CONNECTION.query(processQuerys.update, [
        name,
        description,
        userId,
        rowId,
      ]);
      if (!connection) await CONNECTION.commit();
      return;
    } catch (error) {
      throw error;
    } finally {
      if (!connection && CONNECTION) {
        CONNECTION.release();
      }
    }
  },
  delete: {
    onlyOne: async (rowId: string, connection: PoolConnection) => {
      const CONNECTION: PoolConnection =
        connection || (await PPIC.getConnection());
      try {
        await CONNECTION.query(processQuerys.delete.onlyOne, [rowId]);
        if (!connection) await CONNECTION.commit();
        return;
      } catch (error) {
        throw error;
      } finally {
        if (!connection && CONNECTION) {
          CONNECTION.release();
        }
      }
    },
  },
  get: {
    all: async (companyId: string, connection?: PoolConnection) => {
      const CONNECTION: PoolConnection =
        connection || (await PPIC.getConnection());
      try {
        const [rows] = await CONNECTION.query(processQuerys.select["*"], [
          companyId,
        ]);
        return rows;
      } catch (error) {
        throw error;
      } finally {
        if (!connection && CONNECTION) {
          CONNECTION.release();
        }
      }
    },
    by: {
      projectId: async (projectId: string, connection?: PoolConnection) => {
        const CONNECTION: PoolConnection =
          connection || (await PPIC.getConnection());
        try {
          const [rows] = await CONNECTION.query(
            processQuerys.select.where.projectId,
            [projectId]
          );
          return rows;
        } catch (error) {
          throw error;
        } finally {
          if (!connection && CONNECTION) {
            CONNECTION.release();
          }
        }
      },
    },
  },
};
