import { FieldPacket, PoolConnection, RowDataPacket } from "mysql2/promise";
import { PPIC } from "../config/db";
import { v7 } from "uuid";
import { workLoadQuerys } from "../models/workLoad";

export const workLoadServices = {
  add: async (
    categoryId: string,
    userId: string,
    year: Date,
    workLoad: number,
    connection?: PoolConnection
  ) => {
    const CONNECTION: PoolConnection =
      connection || (await PPIC.getConnection());
    try {
      const id: string = v7();
      await CONNECTION.query(workLoadQuerys.insert, [
        id,
        categoryId,
        userId,
        year,
        workLoad,
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
    id: string,
    userId: string,
    year: Date,
    workLoad: number,
    connection?: PoolConnection
  ) => {
    const CONNECTION: PoolConnection =
      connection || (await PPIC.getConnection());
    try {
      await CONNECTION.query(workLoadQuerys.update, [
        userId,
        year,
        workLoad,
        id,
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
  delete: {
    onlyOne: async (id: string, connection?: PoolConnection) => {
      const CONNECTION: PoolConnection =
        connection || (await PPIC.getConnection());
      try {
        await CONNECTION.query(workLoadQuerys.delete, [id]);
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
  get: {
    onlyOne: {
      byYear: async (
        categoryId: string,
        year: Date,
        connection?: PoolConnection
      ) => {
        const CONNECTION: PoolConnection =
          connection || (await PPIC.getConnection());
        try {
          const [data]: [RowDataPacket[], FieldPacket[]] =
            await CONNECTION.query(workLoadQuerys.select.onlyOne.byYear, [
              categoryId,
              year,
            ]);
          return data;
        } catch (error) {
          throw error;
        } finally {
          if (!connection && CONNECTION) {
            CONNECTION.release();
          }
        }
      },
    },
    all: async (companyId: string, connection?: PoolConnection) => {
      const CONNECTION: PoolConnection =
        connection || (await PPIC.getConnection());
      try {
        const [data]: [RowDataPacket[], FieldPacket[]] = await CONNECTION.query(
          workLoadQuerys.select.all,
          [companyId]
        );
        return data;
      } catch (error) {
        throw error;
      } finally {
        if (!connection && CONNECTION) {
          CONNECTION.release();
        }
      }
    },
  },
};
