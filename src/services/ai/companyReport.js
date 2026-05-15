"use strict";
const { v7: uuidv7 } = require("uuid");
const { PPIC } = require("../../config/db");
const { companyAiReportQuerys, companyAiReportTable } = require("../../models/companyAiReport");
const { projectTable } = require("../../models/project");
const { projectDetailTable } = require("../../models/projectDetail");
const { actualQuerys } = require("../../models/projectActual");
const { plansQuerys } = require("../../models/projectPlans");
const { remarkQuerys } = require("../../models/journalRemark");

const STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  READY: "ready",
  FAILED: "failed",
};

let schemaReady = false;
const ensureSchema = async () => {
  if (schemaReady) return;
  const CONN = await PPIC.getConnection();
  try {
    await CONN.query(companyAiReportQuerys.ddl);
    schemaReady = true;
  } finally {
    CONN.release();
  }
};

const parseJsonSafe = (value) => {
  if (value == null) return null;
  if (typeof value === "object") return value;
  try { return JSON.parse(value); } catch (_) { return null; }
};

const selectAllProjectsSQL = `SELECT
  CP.${projectTable.COLUMN.ID} AS PROJECT_ID,
  CP.${projectTable.COLUMN.PROJECT_NO},
  CP.${projectTable.COLUMN.CLIENT},
  PD.${projectDetailTable.COLUMN.NAME} AS DETAIL_NAME,
  PD.${projectDetailTable.COLUMN.SPK},
  PD.${projectDetailTable.COLUMN.DESCRIPTION},
  PD.${projectDetailTable.COLUMN.PPM},
  PD.${projectDetailTable.COLUMN.CAPACITY},
  PD.${projectDetailTable.COLUMN.WORK_PLACE},
  DATE_FORMAT(PD.${projectDetailTable.COLUMN.START_DATE}, '%Y-%m-%d') AS START_DATE,
  DATE_FORMAT(PD.${projectDetailTable.COLUMN.DUE_DATE}, '%Y-%m-%d') AS DUE_DATE,
  DATE_FORMAT(PD.${projectDetailTable.COLUMN.FINISH_DATE}, '%Y-%m-%d') AS FINISH_DATE,
  PD.${projectDetailTable.COLUMN.DELIVERED},
  DATE_FORMAT(PD.${projectDetailTable.COLUMN.DELIVERY_DATE}, '%Y-%m-%d') AS DELIVERY_DATE,
  PD.${projectDetailTable.COLUMN.BUDGET},
  PD.${projectDetailTable.COLUMN.COST},
  PD.${projectDetailTable.COLUMN.MAN_HOURS},
  PD.${projectDetailTable.COLUMN.PRODUCTIVITY},
  PD.${projectDetailTable.COLUMN.PRODUCTIVITY_COST},
  CASE
    WHEN PD.${projectDetailTable.COLUMN.FINISH_DATE} IS NULL OR PD.${projectDetailTable.COLUMN.FINISH_DATE} = '0000-00-00' THEN 'On Going'
    WHEN DATEDIFF(PD.${projectDetailTable.COLUMN.FINISH_DATE}, PD.${projectDetailTable.COLUMN.DUE_DATE}) < 0 THEN 'Ahead'
    WHEN DATEDIFF(PD.${projectDetailTable.COLUMN.FINISH_DATE}, PD.${projectDetailTable.COLUMN.DUE_DATE}) = 0 THEN 'On Time'
    WHEN DATEDIFF(PD.${projectDetailTable.COLUMN.FINISH_DATE}, PD.${projectDetailTable.COLUMN.DUE_DATE}) > 0 THEN 'Delayed'
  END AS PROJECT_STATUS,
  CASE
    WHEN PD.${projectDetailTable.COLUMN.FINISH_DATE} IS NULL OR PD.${projectDetailTable.COLUMN.FINISH_DATE} = '0000-00-00' THEN NULL
    ELSE DATEDIFF(PD.${projectDetailTable.COLUMN.FINISH_DATE}, PD.${projectDetailTable.COLUMN.DUE_DATE})
  END AS DAYS_DIFF
  FROM ${projectTable.TABLE} AS CP
  LEFT JOIN ${projectDetailTable.TABLE} AS PD
    ON CP.${projectTable.COLUMN.ID} = PD.${projectDetailTable.COLUMN.PROJECT_ID}
  WHERE CP.${projectTable.COLUMN.COMPANY_ID} = ?
  ORDER BY CP.${projectTable.COLUMN.PROJECT_NO} ASC`;

const companyReportServices = {
  STATUS,
  ensureSchema,
  getByCompanyId: async (companyId) => {
    await ensureSchema();
    const CONN = await PPIC.getConnection();
    try {
      const [rows] = await CONN.query(companyAiReportQuerys.selectByCompanyId, [companyId]);
      const row = rows?.[0];
      if (!row) return null;
      return {
        id: row[companyAiReportTable.COLUMN.ID],
        company_id: row[companyAiReportTable.COLUMN.COMPANY_ID],
        executive_summary: row[companyAiReportTable.COLUMN.EXECUTIVE_SUMMARY],
        key_findings: parseJsonSafe(row[companyAiReportTable.COLUMN.KEY_FINDINGS]) ?? [],
        recommendations: parseJsonSafe(row[companyAiReportTable.COLUMN.RECOMMENDATIONS]) ?? [],
        risk_alerts: parseJsonSafe(row[companyAiReportTable.COLUMN.RISK_ALERTS]) ?? [],
        charts: parseJsonSafe(row[companyAiReportTable.COLUMN.CHARTS]) ?? [],
        project_count: row[companyAiReportTable.COLUMN.PROJECT_COUNT],
        model: row[companyAiReportTable.COLUMN.MODEL],
        status: row[companyAiReportTable.COLUMN.STATUS],
        error_message: row[companyAiReportTable.COLUMN.ERROR_MESSAGE],
        generated_at: row[companyAiReportTable.COLUMN.GENERATED_AT],
        updated_at: row[companyAiReportTable.COLUMN.UPDATED_AT],
      };
    } finally {
      CONN.release();
    }
  },
  isCooldownActive: async (companyId) => {
    await ensureSchema();
    const CONN = await PPIC.getConnection();
    try {
      const [rows] = await CONN.query(companyAiReportQuerys.existsByCompanyId, [companyId]);
      const row = rows?.[0];
      if (!row) return false;
      const today = new Date().toISOString().slice(0, 10);
      return row.GENERATED_DATE === today;
    } finally {
      CONN.release();
    }
  },
  aggregateCompanyData: async (companyId) => {
    const CONN = await PPIC.getConnection();
    try {
      const [projects] = await CONN.query(selectAllProjectsSQL, [companyId]);
      if (!projects?.length) return { projects: [], company_id: companyId };

      const enriched = await Promise.all(
        projects.map(async (p) => {
          const projectId = p.PROJECT_ID;
          const [[plansRows], [actualRows], [remarkRows]] = await Promise.all([
            CONN.query(plansQuerys.select.all, [projectId]),
            CONN.query(actualQuerys.select.all, [projectId]),
            CONN.query(remarkQuerys.select.onlyOne, [projectId]),
          ]);

          const capacity = parseFloat(p.CAPACITY) || 0;
          const totalPlan = (plansRows ?? []).reduce((s, r) => s + (parseFloat(r.AMOUNT) || 0), 0);
          const totalActual = (actualRows ?? []).reduce((s, r) => s + (parseFloat(r.AMOUNT) || 0), 0);
          const deviationPct = capacity > 0 ? +((totalActual - totalPlan) / capacity * 100).toFixed(2) : null;
          const isProblematic = p.PROJECT_STATUS === "Delayed" || (deviationPct !== null && deviationPct < -10);

          return {
            project_id: projectId,
            project_no: p.PROJECT_NO,
            client: p.CLIENT,
            detail: {
              name: p.DETAIL_NAME,
              spk: p.SPK,
              description: p.DESCRIPTION,
              ppm: p.PPM,
              capacity,
              work_place: p.WORK_PLACE,
              start_date: p.START_DATE,
              due_date: p.DUE_DATE,
              finish_date: p.FINISH_DATE,
              delivered: !!p.DELIVERED,
              delivery_date: p.DELIVERY_DATE,
              budget: p.BUDGET != null ? parseFloat(p.BUDGET) : null,
              cost: p.COST != null ? parseFloat(p.COST) : null,
              man_hours: p.MAN_HOURS != null ? parseFloat(p.MAN_HOURS) : null,
              productivity: p.PRODUCTIVITY != null ? parseFloat(p.PRODUCTIVITY) : null,
              productivity_cost: p.PRODUCTIVITY_COST != null ? parseFloat(p.PRODUCTIVITY_COST) : null,
              status: p.PROJECT_STATUS,
              days_diff: p.DAYS_DIFF,
            },
            progress: {
              total_plan: totalPlan,
              total_actual: totalActual,
              deviation_pct: deviationPct,
              plans: (plansRows ?? []).map((r) => ({
                year: r.PERIOD_YEAR,
                month: r.PERIOD_MONTH,
                week: r.WEEK,
                percentage: r.PERCENTAGE,
                amount: parseFloat(r.AMOUNT) || 0,
              })),
              actual: (actualRows ?? []).map((r) => ({
                year: r.PERIOD_YEAR,
                month: r.PERIOD_MONTH,
                week: r.WEEK,
                percentage: r.PERCENTAGE,
                amount: parseFloat(r.AMOUNT) || 0,
              })),
            },
            remarks: isProblematic
              ? (remarkRows ?? []).map((r) => ({
                  date: r.INPUT_DATE,
                  deadline: r.DEADLINE,
                  status: r.STATUS,
                  department: r.DEPARTMENT_NAME,
                  pic: r.PIC,
                  description: r.DESCRIPTION,
                  solution: r.SOLUTION,
                }))
              : [],
          };
        }),
      );

      return { company_id: companyId, generated_at: new Date().toISOString(), projects: enriched };
    } finally {
      CONN.release();
    }
  },
  saveResult: async (companyId, { result, model, projectCount, status, errorMessage }) => {
    await ensureSchema();
    const CONN = await PPIC.getConnection();
    try {
      const [existing] = await CONN.query(companyAiReportQuerys.existsByCompanyId, [companyId]);
      const execSummary = result?.executive_summary ?? null;
      const keyFindings = result?.key_findings ? JSON.stringify(result.key_findings) : null;
      const recommendations = result?.recommendations ? JSON.stringify(result.recommendations) : null;
      const riskAlerts = result?.risk_alerts ? JSON.stringify(result.risk_alerts) : null;
      const charts = result?.charts ? JSON.stringify(result.charts) : null;
      const cnt = projectCount ?? 0;
      const mdl = model ?? null;
      const st = status ?? STATUS.READY;
      const errMsg = errorMessage ?? null;

      if (existing?.length > 0) {
        await CONN.query(companyAiReportQuerys.updateResult, [
          execSummary, keyFindings, recommendations, riskAlerts,
          charts, cnt, mdl, st, errMsg, companyId,
        ]);
      } else {
        await CONN.query(companyAiReportQuerys.insertResult, [
          uuidv7(), companyId, execSummary, keyFindings, recommendations,
          riskAlerts, charts, cnt, mdl, st, errMsg,
        ]);
      }
    } finally {
      CONN.release();
    }
  },
};

module.exports = { companyReportServices };
