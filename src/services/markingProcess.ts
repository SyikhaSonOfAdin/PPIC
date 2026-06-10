import { markingProcessQuerys } from "../models/markingProcess";
import { PoolConnection } from "mysql2/promise";
import { PPIC } from "../config/db";
import { v7 } from "uuid";

export const markingProcessServices = {
  add: async (
    markingId: string,
    processId: string,
    userId: string,
    actualDate: Date | string,
    connection?: PoolConnection
  ) => {
    const CONNECTION: PoolConnection =
      connection || (await PPIC.getConnection());
    try {
      const id: string = v7();
      await CONNECTION.query(markingProcessQuerys.insert, [
        id,
        markingId,
        processId,
        userId,
        new Date(actualDate),
      ]);
      if (!connection) await CONNECTION.commit();
      return id;
    } catch (error) {
      throw error;
    } finally {
      if (!connection) {
        CONNECTION.release();
      }
    }
  },
  edit: async (
    rowId: string,
    userId: string,
    actualDate: Date | string,
    connection?: PoolConnection
  ) => {
    const CONNECTION: PoolConnection =
      connection || (await PPIC.getConnection());
    try {
      await CONNECTION.query(markingProcessQuerys.update, [
        new Date(actualDate),
        userId,
        rowId,
      ]);
      if (!connection) await CONNECTION.commit();
    } catch (error) {
      throw error;
    } finally {
      if (!connection) {
        CONNECTION.release();
      }
    }
  },
  get: {
    
  }
};
