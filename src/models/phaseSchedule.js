const { departmentTable } = require("./department");
const { userTable } = require("./user");

const table = {
  TABLE: "project_phase_schedule",
  COLUMN: {
    ID: "id",
    PROJECT_ID: "project_id",
    DEPARTMENT_ID: "department_id",
    PHASE: "phase",
    PLAN_START_WEEK: "plan_start_week",
    PLAN_END_WEEK: "plan_end_week",
    ACTUAL_START_WEEK: "actual_start_week",
    ACTUAL_END_WEEK: "actual_end_week",
    ORDER_INDEX: "order_index",
    INPUT_BY: "input_by",
    INPUT_DATE: "input_date",
    UPDATED_DATE: "updated_date",
  }
};

const PHASE_ORDER = {
  'Engineering': 1,
  'Procurement': 2,
  'Fabrication': 3,
  'Installation': 4,
  'Commissioning': 5
};

const QUERY = {
  insert: `INSERT INTO ${table.TABLE} (
    ${table.COLUMN.ID},
    ${table.COLUMN.PROJECT_ID},
    ${table.COLUMN.DEPARTMENT_ID},
    ${table.COLUMN.PHASE},
    ${table.COLUMN.PLAN_START_WEEK},
    ${table.COLUMN.PLAN_END_WEEK},
    ${table.COLUMN.ACTUAL_START_WEEK},
    ${table.COLUMN.ACTUAL_END_WEEK},
    ${table.COLUMN.ORDER_INDEX},
    ${table.COLUMN.INPUT_BY}
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

  update: `UPDATE ${table.TABLE} SET
    ${table.COLUMN.DEPARTMENT_ID} = ?,
    ${table.COLUMN.PHASE} = ?,
    ${table.COLUMN.PLAN_START_WEEK} = ?,
    ${table.COLUMN.PLAN_END_WEEK} = ?,
    ${table.COLUMN.ACTUAL_START_WEEK} = ?,
    ${table.COLUMN.ACTUAL_END_WEEK} = ?,
    ${table.COLUMN.INPUT_BY} = ?
  WHERE ${table.COLUMN.ID} = ?`,

  delete: {
    onlyOne: `DELETE FROM ${table.TABLE} WHERE ${table.COLUMN.ID} = ?`,
    byProject: `DELETE FROM ${table.TABLE} WHERE ${table.COLUMN.PROJECT_ID} = ?`,
  },

  select: {
    byProject: `
      SELECT
        ps.${table.COLUMN.ID} AS ID,
        ps.${table.COLUMN.PROJECT_ID} AS PROJECT_ID,
        ps.${table.COLUMN.DEPARTMENT_ID} AS DEPARTMENT_ID,
        d.${departmentTable.COLUMN.NAME} AS DEPARTMENT_NAME,
        ps.${table.COLUMN.PHASE} AS PHASE,
        ps.${table.COLUMN.PLAN_START_WEEK} AS PLAN_START_WEEK,
        ps.${table.COLUMN.PLAN_END_WEEK} AS PLAN_END_WEEK,
        ps.${table.COLUMN.ACTUAL_START_WEEK} AS ACTUAL_START_WEEK,
        ps.${table.COLUMN.ACTUAL_END_WEEK} AS ACTUAL_END_WEEK,
        ps.${table.COLUMN.ORDER_INDEX} AS ORDER_INDEX,
        u.${userTable.COLUMN.USERNAME} AS INPUT_BY,
        DATE_FORMAT(ps.${table.COLUMN.INPUT_DATE}, '%Y-%m-%dT%H:%i:%sZ') AS INPUT_DATE,
        DATE_FORMAT(ps.${table.COLUMN.UPDATED_DATE}, '%Y-%m-%dT%H:%i:%sZ') AS UPDATED_DATE
      FROM ${table.TABLE} ps
      LEFT JOIN ${departmentTable.TABLE} d ON ps.${table.COLUMN.DEPARTMENT_ID} = d.${departmentTable.COLUMN.ID}
      LEFT JOIN ${userTable.TABLE} u ON ps.${table.COLUMN.INPUT_BY} = u.${userTable.COLUMN.ID}
      WHERE ps.${table.COLUMN.PROJECT_ID} = ?
      ORDER BY ps.${table.COLUMN.ORDER_INDEX} ASC, ps.${table.COLUMN.ID} ASC;
    `,
    
    checkDuplicate: `
      SELECT COUNT(*) as count
      FROM ${table.TABLE}
      WHERE ${table.COLUMN.PROJECT_ID} = ?
        AND ${table.COLUMN.DEPARTMENT_ID} = ?
        AND ${table.COLUMN.PHASE} = ?
        AND ${table.COLUMN.ID} != ?
    `,

    verifyProjectPhases: `
      SELECT ${table.COLUMN.ID}
      FROM ${table.TABLE}
      WHERE ${table.COLUMN.PROJECT_ID} = ?
        AND ${table.COLUMN.ID} IN (?)
    `,

    maxOrderIndex: `
      SELECT COALESCE(MAX(${table.COLUMN.ORDER_INDEX}), -10) AS max_index
      FROM ${table.TABLE}
      WHERE ${table.COLUMN.PROJECT_ID} = ?
    `
  },

  reorder: `
    UPDATE ${table.TABLE}
    SET ${table.COLUMN.ORDER_INDEX} = ?
    WHERE ${table.COLUMN.ID} = ?
      AND ${table.COLUMN.PROJECT_ID} = ?
  `
};

module.exports = {
  phaseScheduleTable: table,
  phaseScheduleQuerys: QUERY,
  PHASE_ORDER
};
