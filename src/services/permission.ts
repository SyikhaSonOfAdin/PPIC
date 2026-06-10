import { FieldPacket, PoolConnection, RowDataPacket } from "mysql2/promise";
import { permissionsQuerys, userPermissionsQuery } from "../models/permissions";
import { PPIC } from "../config/db";
import { permission } from "../utils/customTypes";
import { v7 } from "uuid";

export const permissionServices = {
  get: async (connection?: PoolConnection) => {
    const CONNECTION: PoolConnection =
      connection || (await PPIC.getConnection());
    try {
      const [data]: [RowDataPacket[], FieldPacket[]] = await CONNECTION.query(
        permissionsQuerys.get.all
      );
      const permissions: permission[] = data as permission[];
      return permissions;
    } catch (error) {
      throw error;
    } finally {
      if (!connection && CONNECTION) {
        CONNECTION.release();
      }
    }
  },
  add: async (
    userId: string,
    permissionId: string,
    granted: boolean,
    connection?: PoolConnection
  ) => {
    const CONNECTION: PoolConnection =
      connection || (await PPIC.getConnection());
    try {
      const id: string = v7();
      await CONNECTION.query(userPermissionsQuery.insert, [
        id,
        userId,
        permissionId,
        granted,
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
  addNewServices: async (
    name: string,
    description: string,
    connection?: PoolConnection
  ) => {
    const CONNECTION: PoolConnection =
      connection || (await PPIC.getConnection());
    try {
      const id: string = v7();
      await CONNECTION.query(permissionsQuerys.add, [id, name, description]);
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
};
