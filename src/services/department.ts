import { FieldPacket, PoolConnection, RowDataPacket } from "mysql2/promise";
import { departmentQuerys } from "../models/department";
import { PPIC } from "../config/db";
import { v7 } from "uuid";

export const departmentServices = {
  add: async (
    companyId: string,
    userId: string,
    name: string,
    connection?: PoolConnection
  ) => {
    const CONNECTION: PoolConnection =
      connection || (await PPIC.getConnection());
    try {
      const id: string = v7();
      await CONNECTION.query(departmentQuerys.insert, [
        id,
        companyId,
        userId,
        name,
      ]);
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
    name: string,
    userId: string,
    connection?: PoolConnection
  ) => {
    const CONNECTION: PoolConnection =
      connection || (await PPIC.getConnection());
    try {
      await CONNECTION.query(departmentQuerys.update, [userId, name, id]);
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
        await CONNECTION.query(departmentQuerys.delete.onlyOne, [id]);
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
    all: async (
      companyId: string,
      connection?: PoolConnection
    ): Promise<
      { ID: string; COMPANY_NAME: string; INPUT_BY: string; INPUT_DATE: string; NAME: string }[]
    > => {
      const CONNECTION: PoolConnection =
        connection || (await PPIC.getConnection());
      try {
        const [data]: [RowDataPacket[], FieldPacket[]] = await CONNECTION.query(
          departmentQuerys.select.all,
          [companyId]
        );
        return data as {
          ID: string;
          COMPANY_NAME: string;
          INPUT_BY: string;
          INPUT_DATE: string;
          NAME: string;
        }[];
      } catch (error) {
        throw error;
      } finally {
        if (!connection && CONNECTION) {
          CONNECTION.release();
        }
      }
    },
    onlyOne: async (
      id: string,
      connection?: PoolConnection
    ): Promise<{ ID: string; NAME: string }> => {
      const CONNECTION: PoolConnection =
        connection || (await PPIC.getConnection());
      try {
        const [data]: [RowDataPacket[], FieldPacket[]] = await CONNECTION.query(
          departmentQuerys.select.onlyOne,
          [id]
        );
        return data[0] as { ID: string; NAME: string };
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
