import { remarkQuerys } from "../models/journalRemark";
import { PoolConnection } from "mysql2/promise";
import { PPIC } from "../config/db";
import { v7 } from "uuid";

export const remarkServices = {
  add: async (
    projectId: string,
    userId: string,
    departmentId: string,
    description: string,
    deadline: string,
    status: string,
    solution?: string,
    connection?: PoolConnection
  ) => {
    const CONNECTION: PoolConnection =
      connection || (await PPIC.getConnection());
    try {
      const id: string = v7();
      await CONNECTION.query(remarkQuerys.insert, [
        id,
        projectId,
        userId,
        description,
        solution ?? null,
        deadline,
        departmentId,
        status,
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
  delete: {
    all: async (projectId: string, connection?: PoolConnection) => {
      const CONNECTION: PoolConnection =
        connection || (await PPIC.getConnection());
      try {
        await CONNECTION.query(remarkQuerys.delete.all, [projectId]);
        if (!connection) await CONNECTION.commit();
      } catch (error) {
        throw error;
      } finally {
        if (!connection && CONNECTION) {
          CONNECTION.release();
        }
      }
    },
    onlyOne: async (remarkId: string, connection?: PoolConnection) => {
      const CONNECTION: PoolConnection =
        connection || (await PPIC.getConnection());
      try {
        await CONNECTION.query(remarkQuerys.delete.onlyOne, [remarkId]);
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
  edit: async (
    remarkId: string,
    userId: string,
    description: string,
    deadline: string,
    departmentId: string,
    status: string,
    solution?: string,
    connection?: PoolConnection
  ) => {
    const CONNECTION: PoolConnection =
      connection || (await PPIC.getConnection());
    try {
      await CONNECTION.query(remarkQuerys.update, [
        userId,
        description,
        solution ?? null,
        deadline,
        departmentId,
        status,
        remarkId,
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
    onlyOne: async (projectId: string, connection?: PoolConnection) => {
      const CONNECTION: PoolConnection =
        connection || (await PPIC.getConnection());
      try {
        const [rows] = await CONNECTION.query(remarkQuerys.select.onlyOne, [
          projectId,
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
    all: {
      forReport: async (companyId: string, connection?: PoolConnection) => {
        const CONNECTION: PoolConnection =
          connection || (await PPIC.getConnection());
        try {
          const [rows] = await CONNECTION.query(
            remarkQuerys.select.all.forReport,
            [companyId]
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
      all: async (
        companyId: string,
        searchTerms: string = "",
        connection?: PoolConnection
      ): Promise<
        {
          ID: string;
          STATUS: string;
          NAME: string;
          PROJECT_NO: string;
          PROJECT_STATUS: "On Going" | "Ahead" | "On Time" | "Delayed";
          CLIENT: string;
          DAYS: number;
          INPUT_BY: string;
          DEPARTMENT_NAME: string;
          PIC: string | null;
          INPUT_DATE: string;
          DEADLINE: string;
          DUE_DATE: string;
          SOLUTION: string | null;
          DESCRIPTION: string;
        }[]
      > => {
        const CONNECTION: PoolConnection =
          connection || (await PPIC.getConnection());
        try {
          const pattern = `%${searchTerms}%`;
          const [rows] = await CONNECTION.query(remarkQuerys.select.all.all, [
            companyId,
            pattern,
            pattern,
            pattern,
            pattern,
            pattern,
            pattern,
            pattern,
          ]);
          return rows as {
            ID: string;
            STATUS: string;
            NAME: string;
            PROJECT_NO: string;
            CLIENT: string;
            PROJECT_STATUS: "On Going" | "Ahead" | "On Time" | "Delayed";
            DAYS: number;
            INPUT_BY: string;
            DEPARTMENT_ID: string;
            DEPARTMENT_NAME: string;
            PIC: string | null;
            INPUT_DATE: string;
            DEADLINE: string;
            DUE_DATE: string;
            SOLUTION: string | null;
            DESCRIPTION: string;
          }[];
        } catch (error) {
          throw error;
        } finally {
          if (!connection && CONNECTION) {
            CONNECTION.release();
          }
        }
      },
      byDepId: async (
        companyId: string,
        departmentId: string,
        connection?: PoolConnection
      ): Promise<
        {
          ID: string;
          STATUS: string;
          NAME: string;
          CAPACITY: string;
          PROJECT_NO: string;
          PROJECT_STATUS: "On Going" | "Ahead" | "On Time" | "Delayed";
          DAYS: number;
          INPUT_BY: string;
          DEPARTMENT_NAME: string;
          PIC: string | null;
          INPUT_DATE: string;
          DEADLINE: string;
          SOLUTION: string | null;
          DESCRIPTION: string;
        }[]
      > => {
        const CONNECTION: PoolConnection =
          connection || (await PPIC.getConnection());
        try {
          const [rows] = await CONNECTION.query(remarkQuerys.select.all.byDepId, [
            companyId,
            departmentId,
          ]);
          return rows as {
            ID: string;
            STATUS: string;
            NAME: string;
            CAPACITY: string;
            PROJECT_NO: string;
            PROJECT_STATUS: "On Going" | "Ahead" | "On Time" | "Delayed";
            DAYS: number;
            INPUT_BY: string;
            DEPARTMENT_ID: string;
            DEPARTMENT_NAME: string;
            PIC: string | null;
            INPUT_DATE: string;
            DEADLINE: string;
            SOLUTION: string | null;
            DESCRIPTION: string;
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
