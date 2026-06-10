import { projectProductivityQuery } from "../models/projectProductivity";
import { PoolConnection } from "mysql2/promise";
import { PPIC } from "../config/db";
import { v7 } from "uuid";

export const projectProductivityService = {
  add: async (
    processId: string,
    projectId: string,
    periodId: string,
    userId: string,
    progress?: number,
    manPower?: number,
    manHour?: number,
    connection?: PoolConnection
  ) => {
    const CONNECTION: PoolConnection =
      connection || (await PPIC.getConnection());
    try {
      const id: string = v7();
      await CONNECTION.query(projectProductivityQuery.insert, [
        id,
        processId,
        projectId,
        periodId,
        userId,
        progress,
        manPower,
        manHour,
      ]);
      if (!connection) await CONNECTION.commit();
      return id
    } catch (error) {
      throw error;
    } finally {
      if (!connection && CONNECTION) {
        CONNECTION.release();
      }
    }
  },
  get: {
    by: {
      projectId: async (projectId: string, connection?: PoolConnection) => {
        const CONNECTION: PoolConnection =
          connection || (await PPIC.getConnection());
        try {
          const [data] = await CONNECTION.query(projectProductivityQuery.select.by.projectId, [projectId]);
          return data
        } catch (error) {
          throw error;
        } finally {
          if (!connection && CONNECTION) {
            CONNECTION.release();
          }
        }
      },
      companyId: async (companyId: string, connection?: PoolConnection) => {
        const CONNECTION: PoolConnection =
          connection || (await PPIC.getConnection());
        try {
          const [data] = await CONNECTION.query(projectProductivityQuery.select.by.companyId, [companyId]);
          return data
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
