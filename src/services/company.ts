import { companyQuerys } from "../models/company";
import { PoolConnection } from "mysql2/promise";
import { PPIC } from "../config/db";
import { v7 } from "uuid";

export const companyServices = {
  add: async (name: string, connection?: PoolConnection) => {
    const CONNECTIONS: PoolConnection = connection || (await PPIC.getConnection());
    try {
      const id: string = v7();
      await CONNECTIONS.query(companyQuerys.insert, [id, name]);
      if (!connection) await CONNECTIONS.commit();
      return id
    } catch (error) {
      throw error;
    } finally {
      if (!connection && CONNECTIONS) {
        CONNECTIONS.release();
      }
    }
  },
  edit: {
    name: async (id: string, name: string, connection?: PoolConnection) => {
      const CONNECTION: PoolConnection = connection || await PPIC.getConnection()

      try {
        await CONNECTION.query(companyQuerys.update.name, [name, id])
        if (!connection) await CONNECTION.commit();
      } catch (error) {
        throw error
      } finally {
        if (!connection && CONNECTION) {
          CONNECTION.release();
        }
      }
    },
    status: async (id: string, status: string, connection?: PoolConnection) => {
      const CONNECTION: PoolConnection = connection || await PPIC.getConnection()

      try {
        await CONNECTION.query(companyQuerys.update.status, [status, id])
        if (!connection) await CONNECTION.commit();
      } catch (error) {
        throw error
      } finally {
        if (!connection && CONNECTION) {
          CONNECTION.release();
        }
      }
    }
  },
  delete: async (id: string, connection?: PoolConnection) => {
    const CONNECTIONS: PoolConnection = connection || (await PPIC.getConnection());

    try {
      await CONNECTIONS.query(companyQuerys.delete, [id]);
      if (!connection) await CONNECTIONS.commit();
    } catch (error) {
      throw error;
    } finally {
      if (!connection && CONNECTIONS) {
        CONNECTIONS.release();
      }
    }
  },
};
