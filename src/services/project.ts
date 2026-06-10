import { FieldPacket, PoolConnection, RowDataPacket } from "mysql2/promise";
import { projectQuerys } from "../models/project";
import { PPIC } from "../config/db";
import { v7 } from "uuid";

export const projectServices = {
  add: async (
    companyId: string,
    categoryId: string,
    projectNo: string,
    client: string,
    userId: string,
    connection?: PoolConnection,
  ) => {
    const CONNECTION: PoolConnection =
      connection || (await PPIC.getConnection());
    try {
      const id: string = v7();
      await CONNECTION.query(projectQuerys.insert, [
        id,
        companyId,
        categoryId,
        projectNo,
        client,
        userId,
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
  addBulk: async (
    data: {
      PROJECT_NO: string;
      SPK: string;
      CLIENT: string;
      CATEGORY: string;
      CAPACITY: number;
      PPM: string;
      WORK_PLACE: string;
      START_DATE: unknown;
      DUE_DATE: unknown;
      FINISH_DATE: unknown | null;
      DELIVERY_DATE: unknown | null;
      MAN_HOURS: number | null;
      BUDGET: number | null;
      COST: number | null;
      DESCRIPTION: string | null;
    }[],
    connection?: PoolConnection,
  ) => {
    // prettier-ignore
    const CONNECTION: PoolConnection = connection || (await PPIC.getConnection());
    try {
    } catch (error) {
      throw error;
    } finally {
      if (!connection && CONNECTION) {
        CONNECTION.release();
      }
    }
  },
  delete: {
    onlyOne: async (projectId: string, connection?: PoolConnection) => {
      const CONNECTION: PoolConnection =
        connection || (await PPIC.getConnection());

      try {
        await CONNECTION.query(projectQuerys.delete.onlyOne, [projectId]);
        if (!connection) await CONNECTION.commit();
      } catch (error) {
        throw error;
      } finally {
        CONNECTION.release();
      }
    },
  },
  edit: async (
    projectId: string,
    categoryId: string,
    projectNo: string,
    client: string,
    userId: string,
    connection?: PoolConnection,
  ) => {
    const CONNECTION: PoolConnection =
      connection || (await PPIC.getConnection());
    try {
      await CONNECTION.query(projectQuerys.update.all, [
        categoryId,
        projectNo,
        client,
        userId,
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
  get: {
    by: {
      periodId: async (periodId: string, connection: PoolConnection) => {
        const CONNECTION: PoolConnection =
          connection || (await PPIC.getConnection());
        try {
          const [data]: [RowDataPacket[], FieldPacket[]] =
            await CONNECTION.query(projectQuerys.select.by.periodId, [
              periodId,
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
    all: async (
      companyId: string,
      searchPattern: string = "",
      connection?: PoolConnection,
    ) => {
      const CONNECTION: PoolConnection =
        connection || (await PPIC.getConnection());
      try {
        const pattern = `%${searchPattern}%`;
        const [data]: [RowDataPacket[], FieldPacket[]] = await CONNECTION.query(
          projectQuerys.select.all,
          [
            companyId,
            pattern,
            pattern,
            pattern,
            pattern,
            pattern,
            pattern,
            pattern,
            pattern,
            pattern,
            pattern,
          ],
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
    onlyOne: async (projectId: string, connection?: PoolConnection) => {
      const CONNECTION: PoolConnection =
        connection || (await PPIC.getConnection());
      try {
        const [data]: [RowDataPacket[], FieldPacket[]] = await CONNECTION.query(
          projectQuerys.select.onlyOne,
          [projectId],
        );
        return data[0] as {
          ID: string;
          COMPANY_ID: string;
          PROJECT_NO: string;
          CLIENT: string;
          INPUT_BY: string;
          INPUT_DATE: string;
          CATEGORY_ID: string;
          UOM: string;
          CATEGORY_NAME: string;
        };
      } catch (error) {
        throw error;
      } finally {
        if (!connection && CONNECTION) {
          CONNECTION.release();
        }
      }
    },
    byCategoryId: async (categoryId: string, connection?: PoolConnection) => {
      const CONNECTION: PoolConnection =
        connection || (await PPIC.getConnection());
      try {
        const [data]: [RowDataPacket[], FieldPacket[]] = await CONNECTION.query(
          projectQuerys.select.byCatgoeryId,
          [categoryId],
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
