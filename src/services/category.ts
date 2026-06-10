import { categoryQuerys } from "../models/category";
import { FieldPacket, PoolConnection, RowDataPacket } from "mysql2/promise";
import { PPIC } from "../config/db";
import { v7 } from "uuid";

export const categoryServices = {
  add: async (
    companyId: string,
    userId: string,
    name: string,
    description: string,
    unitOfMeasurement: string,
    connection?: PoolConnection,
  ) => {
    const CONNECTION: PoolConnection =
      connection || (await PPIC.getConnection());
    try {
      const id: string = v7();
      await CONNECTION.query(categoryQuerys.insert, [
        id,
        companyId,
        userId,
        name,
        description,
        unitOfMeasurement,
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
    categoryId: string,
    name: string,
    description: string,
    unitOfMeasurement: string,
    userId: string,
    connection?: PoolConnection,
  ) => {
    const CONNECTION: PoolConnection =
      connection || (await PPIC.getConnection());
    try {
      await CONNECTION.query(categoryQuerys.update, [
        name,
        description,
        unitOfMeasurement,
        userId,
        categoryId,
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
    onlyOne: async (categoryId: string, connection?: PoolConnection) => {
      const CONNECTION: PoolConnection =
        connection || (await PPIC.getConnection());
      try {
        await CONNECTION.query(categoryQuerys.delete.onlyOne, [categoryId]);
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
    all: async (companyId: string, connection?: PoolConnection) => {
      const CONNECTION: PoolConnection =
        connection || (await PPIC.getConnection());
      try {
        const [data]: [RowDataPacket[], FieldPacket[]] = await CONNECTION.query(
          categoryQuerys.select.all,
          [companyId],
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
    onlyOne: async (rowId: string, connection?: PoolConnection) => {
      const CONNECTION: PoolConnection =
        connection || (await PPIC.getConnection());
      try {
        const [data]: [RowDataPacket[], FieldPacket[]] = await CONNECTION.query(
          categoryQuerys.select.onlyOne,
          [rowId],
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
    oneByName: async (name: string, connection?: PoolConnection) => {
      const CONNECTION: PoolConnection =
        connection || (await PPIC.getConnection());
      try {
        const [data]: [RowDataPacket[], FieldPacket[]] = await CONNECTION.query(
          categoryQuerys.select.byName,
          [`%${name}%`],
        );
        return data as {
          ID: string;
          NAME: string;
          DESCRIPTION: string;
          UOM: string;
          INPUT_DATE: string;
          INPUT_BY: string;
        }[];
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
