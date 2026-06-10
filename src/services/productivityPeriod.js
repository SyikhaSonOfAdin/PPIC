"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productivityPeriodServices = void 0;
const productivityPeriod_1 = require("../models/productivityPeriod");
const others_1 = require("../models/others");
const db_1 = require("../config/db");
const uuid_1 = require("uuid");
/**
 * Get the next or same date on/after `date` matching `targetDay` (0=Sunday...6=Saturday).
 */
function getNextOrSame(date, targetDay) {
    const d = new Date(date);
    const current = d.getDay();
    const delta = (targetDay - current + 7) % 7;
    d.setDate(d.getDate() + delta);
    return d;
}
/**
 * Get the previous or same date on/before `date` matching `targetDay` (0=Sunday...6=Saturday).
 */
function getPrevOrSame(date, targetDay) {
    const d = new Date(date);
    const current = d.getDay();
    const delta = (current - targetDay + 7) % 7;
    d.setDate(d.getDate() - delta);
    return d;
}
exports.productivityPeriodServices = {
    add: {
        automatically: async (companyId, startWeekdayValue, // 1=Sunday...7=Saturday (from user)
        finishWeekdayValue, // 1=Sunday...7=Saturday (from user)
        intervalDays, // number >= 1
        connection) => {
            const conn = connection || (await db_1.PPIC.getConnection());
            try {
                // Fetch earliest project start and latest project due dates
                const [earliestRows] = await conn.query(others_1.othersQuerys.select.project.start_date.earliest, [companyId]);
                const [latestRows] = await conn.query(others_1.othersQuerys.select.project.due_date.latest, [companyId]);
                if (!earliestRows.length || !latestRows.length) {
                    throw new Error("No projects found for company");
                }
                const rawStart = new Date(earliestRows[0].START_DATE);
                const rawEnd = new Date(latestRows[0].DUE_DATE);
                const jsStart = startWeekdayValue % 7;
                const jsEnd = finishWeekdayValue % 7;
                // Align to nearest matching weekday
                let periodStart = getPrevOrSame(rawStart, jsStart);
                const lastPossibleEnd = getNextOrSame(rawEnd, jsEnd);
                const periods = [];
                const insertTasks = [];
                while (periodStart <= lastPossibleEnd) {
                    const id = (0, uuid_1.v7)();
                    const actualEnd = new Date(periodStart.getTime() + (intervalDays - 1) * 24 * 60 * 60 * 1000);
                    insertTasks.push(conn.query(productivityPeriod_1.productivityPeriodQuerys.insert, [
                        id,
                        companyId,
                        periodStart.toISOString().slice(0, 10),
                        actualEnd.toISOString().slice(0, 10),
                    ]));
                    // Prepare record
                    const record = {
                        ID: id,
                        COMPANY_ID: companyId,
                        CUTOFF_DATE_START: periodStart.toISOString().slice(0, 10),
                        CUTOFF_DATE_FINISH: actualEnd.toISOString().slice(0, 10),
                    };
                    periods.push(record);
                    periodStart = new Date(actualEnd.getTime() + 1 * 24 * 60 * 60 * 1000);
                }
                await Promise.all(insertTasks);
                if (!connection)
                    await conn.commit();
                return periods;
            }
            catch (error) {
                throw error;
            }
            finally {
                if (!connection) {
                    conn.release();
                }
            }
        },
        single: async (companyId, startDate, finishDate, connection) => {
            const CONNECTION = connection || (await db_1.PPIC.getConnection());
            try {
                const id = (0, uuid_1.v7)();
                await CONNECTION.query(productivityPeriod_1.productivityPeriodQuerys.insert, [
                    id,
                    companyId,
                    new Date(startDate),
                    new Date(finishDate),
                ]);
                if (!connection)
                    await CONNECTION.commit();
                return id;
            }
            catch (error) {
                throw error;
            }
            finally {
                if (!connection) {
                    CONNECTION.release();
                }
            }
        },
    },
    get: {
        by: {
            companyId: async (companyId, connection) => {
                const conn = connection || (await db_1.PPIC.getConnection());
                try {
                    const [rows] = await conn.query(productivityPeriod_1.productivityPeriodQuerys.select.all, [companyId]);
                    return rows.map((row) => ({
                        ID: row.ID,
                        COMPANY_ID: companyId,
                        CUTOFF_DATE_START: row.CUTOFF_DATE_START,
                        CUTOFF_DATE_FINISH: row.CUTOFF_DATE_FINISH,
                    }));
                }
                catch (error) {
                    throw error;
                }
                finally {
                    if (!connection) {
                        conn.release();
                    }
                }
            },
            projectId: async (projectId, connection) => {
                const conn = connection || (await db_1.PPIC.getConnection());
                try {
                    const [rows] = await conn.query(productivityPeriod_1.productivityPeriodQuerys.select.by.projectId, [projectId]);
                    return rows.map((row) => ({
                        ID: row.ID,
                        COMPANY_ID: row.COMPANY_ID,
                        CUTOFF_DATE_START: row.CUTOFF_DATE_START,
                        CUTOFF_DATE_FINISH: row.CUTOFF_DATE_FINISH,
                    }));
                }
                catch (error) {
                    throw error;
                }
                finally {
                    if (!connection) {
                        conn.release();
                    }
                }
            },
            period: async (companyId, startDate, endDate, connection) => {
                const conn = connection || (await db_1.PPIC.getConnection());
                try {
                    const [rows] = await conn.query(productivityPeriod_1.productivityPeriodQuerys.select.period, [endDate, startDate, companyId]);
                    return rows.map((row) => ({
                        ID: row.ID,
                        COMPANY_ID: row.COMPANY_ID,
                        CUTOFF_DATE_START: row.CUTOFF_DATE_START,
                        CUTOFF_DATE_FINISH: row.CUTOFF_DATE_FINISH,
                    }));
                }
                catch (error) {
                    throw error;
                }
                finally {
                    if (!connection) {
                        conn.release();
                    }
                }
            },
        },
    },
};
