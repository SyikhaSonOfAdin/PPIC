import { productivityPeriodQuerys } from "../models/productivityPeriod";
import { PoolConnection } from "mysql2/promise";
import { othersQuerys } from "../models/others";
import { PPIC } from "../config/db";
import { v7 as uuidv7, v7 } from "uuid";

/**
 * Get the next or same date on/after `date` matching `targetDay` (0=Sunday...6=Saturday).
 */
function getNextOrSame(date: Date | string, targetDay: number): Date {
  const d = new Date(date);
  const current = d.getDay();
  const delta = (targetDay - current + 7) % 7;
  d.setDate(d.getDate() + delta);
  return d;
}

/**
 * Get the previous or same date on/before `date` matching `targetDay` (0=Sunday...6=Saturday).
 */
function getPrevOrSame(date: Date | string, targetDay: number): Date {
  const d = new Date(date);
  const current = d.getDay();
  const delta = (current - targetDay + 7) % 7;
  d.setDate(d.getDate() - delta);
  return d;
}

interface ProductivityPeriod {
  ID: string;
  COMPANY_ID: string;
  CUTOFF_DATE_START: string; // YYYY-MM-DD
  CUTOFF_DATE_FINISH: string; // YYYY-MM-DD
}

export const productivityPeriodServices = {
  add: {
    automatically: async (
      companyId: string,
      startWeekdayValue: number, // 1=Sunday...7=Saturday (from user)
      finishWeekdayValue: number, // 1=Sunday...7=Saturday (from user)
      intervalDays: number, // number >= 1
      connection?: PoolConnection
    ): Promise<ProductivityPeriod[]> => {
      const conn: PoolConnection = connection || (await PPIC.getConnection());

      try {
        // Fetch earliest project start and latest project due dates
        const [earliestRows]: any[] = await conn.query(
          othersQuerys.select.project.start_date.earliest,
          [companyId]
        );
        const [latestRows]: any[] = await conn.query(
          othersQuerys.select.project.due_date.latest,
          [companyId]
        );

        if (!earliestRows.length || !latestRows.length) {
          throw new Error("No projects found for company");
        }

        const rawStart: Date = new Date(earliestRows[0].START_DATE);
        const rawEnd: Date = new Date(latestRows[0].DUE_DATE);

        const jsStart: number = startWeekdayValue % 7;
        const jsEnd: number = finishWeekdayValue % 7;

        // Align to nearest matching weekday
        let periodStart: Date = getPrevOrSame(rawStart, jsStart);
        const lastPossibleEnd: Date = getNextOrSame(rawEnd, jsEnd);

        const periods: ProductivityPeriod[] = [];
        const insertTasks: Promise<any>[] = [];

        while (periodStart <= lastPossibleEnd) {
          const id: string = uuidv7();
          const actualEnd: Date = new Date(
            periodStart.getTime() + (intervalDays - 1) * 24 * 60 * 60 * 1000
          );

          insertTasks.push(
            conn.query(productivityPeriodQuerys.insert, [
              id,
              companyId,
              periodStart.toISOString().slice(0, 10),
              actualEnd.toISOString().slice(0, 10),
            ])
          );
          // Prepare record
          const record: ProductivityPeriod = {
            ID: id,
            COMPANY_ID: companyId,
            CUTOFF_DATE_START: periodStart.toISOString().slice(0, 10),
            CUTOFF_DATE_FINISH: actualEnd.toISOString().slice(0, 10),
          };
          periods.push(record);

          periodStart = new Date(actualEnd.getTime() + 1 * 24 * 60 * 60 * 1000);
        }

        await Promise.all(insertTasks);
        if (!connection) await conn.commit();
        return periods;
      } catch (error) {
        throw error;
      } finally {
        if (!connection) {
          conn.release();
        }
      }
    },
    single: async (
      companyId: string,
      startDate: any,
      finishDate: any,
      connection?: PoolConnection
    ) => {
      const CONNECTION: PoolConnection =
        connection || (await PPIC.getConnection());
      try {
        const id = v7();
        await CONNECTION.query(productivityPeriodQuerys.insert, [
          id,
          companyId,
          new Date(startDate),
          new Date(finishDate),
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
  },
  get: {
    by: {
      companyId: async (
        companyId: string,
        connection?: PoolConnection
      ): Promise<ProductivityPeriod[]> => {
        const conn: PoolConnection = connection || (await PPIC.getConnection());

        try {
          const [rows]: any[] = await conn.query(
            productivityPeriodQuerys.select.all,
            [companyId]
          );
          return rows.map((row: any) => ({
            ID: row.ID,
            COMPANY_ID: companyId,
            CUTOFF_DATE_START: row.CUTOFF_DATE_START,
            CUTOFF_DATE_FINISH: row.CUTOFF_DATE_FINISH,
          }));
        } catch (error) {
          throw error;
        } finally {
          if (!connection) {
            conn.release();
          }
        }
      },
      projectId: async (
        projectId: string,
        connection?: PoolConnection
      ): Promise<ProductivityPeriod[]> => {
        const conn: PoolConnection = connection || (await PPIC.getConnection());

        try {
          const [rows]: any[] = await conn.query(
            productivityPeriodQuerys.select.by.projectId,
            [projectId]
          );
          return rows.map((row: any) => ({
            ID: row.ID,
            COMPANY_ID: row.COMPANY_ID,
            CUTOFF_DATE_START: row.CUTOFF_DATE_START,
            CUTOFF_DATE_FINISH: row.CUTOFF_DATE_FINISH,
          }));
        } catch (error) {
          throw error;
        } finally {
          if (!connection) {
            conn.release();
          }
        }
      },
      period: async (
        companyId: string,
        startDate: string,
        endDate: string,
        connection?: PoolConnection
      ): Promise<ProductivityPeriod[]> => {
        const conn: PoolConnection = connection || (await PPIC.getConnection());

        try {
          const [rows]: any[] = await conn.query(
            productivityPeriodQuerys.select.period,
            [endDate, startDate, companyId]
          );
          return rows.map((row: any) => ({
            ID: row.ID,
            COMPANY_ID: row.COMPANY_ID,
            CUTOFF_DATE_START: row.CUTOFF_DATE_START,
            CUTOFF_DATE_FINISH: row.CUTOFF_DATE_FINISH,
          }));
        } catch (error) {
          throw error;
        } finally {
          if (!connection) {
            conn.release();
          }
        }
      },
    },
  },
};
