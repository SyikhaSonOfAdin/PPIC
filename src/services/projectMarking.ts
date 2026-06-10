import { projectMarkingQuerys } from "../models/projectMarking";
import { PoolConnection } from "mysql2/promise";
import { PPIC } from "../config/db";
import { v7 } from "uuid";

export const projectMarkingServices = {
  add: async (
    projectId: string,
    userId: string,
    marking: string,
    connection?: PoolConnection
  ) => {
    const CONNECTION: PoolConnection =
      connection || (await PPIC.getConnection());
    try {
      const id: string = v7();
      await CONNECTION.query(projectMarkingQuerys.insert, [
        id,
        projectId,
        userId,
        marking,
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
  update: {
    by: {
      markingId: async (
        marking: string,
        userId: string,
        rowId: string,
        connection?: PoolConnection
      ) => {
        const CONNECTION: PoolConnection =
          connection || (await PPIC.getConnection());
        try {
          await CONNECTION.query(projectMarkingQuerys.update.by.id, [
            userId,
            marking,
            rowId,
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
    },
  },
  delete: {
    by: {
      markingId: async (rowId: string, connection?: PoolConnection) => {
        const CONNECTION: PoolConnection =
          connection || (await PPIC.getConnection());
        try {
          await CONNECTION.query(projectMarkingQuerys.delete.by.id, [
            rowId,
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
      projectId: async (projectId: string, connection?: PoolConnection) => {
        const CONNECTION: PoolConnection =
          connection || (await PPIC.getConnection());
        try {
          await CONNECTION.query(projectMarkingQuerys.delete.by.projectId, [
            projectId,
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
    },
  },
  get: {
    by: {
      projectId: async (projectId: string, connection?: PoolConnection) => {
        const CONNECTION: PoolConnection =
          connection || (await PPIC.getConnection());
        try {
          const [data] = await CONNECTION.query(
            projectMarkingQuerys.select.by.projectId,
            [projectId]
          );
          return data as {
            ID: string;
            PROJECT_ID: string;
            INPUT_BY: string;
            INPUT_DATE: string;
            MARKING: string;
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
  },
};
