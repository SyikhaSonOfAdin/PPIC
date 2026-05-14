const { projectTable } = require("./project");

const table = {
  TABLE: "project_ai_summary",
  COLUMN: {
    ID: "ID",
    PROJECT_ID: "PROJECT_ID",
    OVERVIEW: "OVERVIEW",
    HEALTH_SCORE: "HEALTH_SCORE",
    RISK_LEVEL: "RISK_LEVEL",
    TREND: "TREND",
    KEY_ISSUES: "KEY_ISSUES",
    PROBLEM_PATTERNS: "PROBLEM_PATTERNS",
    LESSONS_LEARNED: "LESSONS_LEARNED",
    ACTION_ITEMS: "ACTION_ITEMS",
    REMARK_COUNT: "REMARK_COUNT",
    MODEL: "MODEL",
    STATUS: "STATUS",
    ERROR_MESSAGE: "ERROR_MESSAGE",
    GENERATED_AT: "GENERATED_AT",
    UPDATED_AT: "UPDATED_AT",
  },
};

const DDL = `CREATE TABLE IF NOT EXISTS ${table.TABLE} (
  ${table.COLUMN.ID} CHAR(36) NOT NULL,
  ${table.COLUMN.PROJECT_ID} CHAR(36) NOT NULL,
  ${table.COLUMN.OVERVIEW} TEXT NULL,
  ${table.COLUMN.HEALTH_SCORE} TINYINT NULL,
  ${table.COLUMN.RISK_LEVEL} VARCHAR(20) NULL,
  ${table.COLUMN.TREND} VARCHAR(40) NULL,
  ${table.COLUMN.KEY_ISSUES} LONGTEXT NULL,
  ${table.COLUMN.PROBLEM_PATTERNS} LONGTEXT NULL,
  ${table.COLUMN.LESSONS_LEARNED} LONGTEXT NULL,
  ${table.COLUMN.ACTION_ITEMS} LONGTEXT NULL,
  ${table.COLUMN.REMARK_COUNT} INT NOT NULL DEFAULT 0,
  ${table.COLUMN.MODEL} VARCHAR(100) NULL,
  ${table.COLUMN.STATUS} VARCHAR(20) NOT NULL DEFAULT 'pending',
  ${table.COLUMN.ERROR_MESSAGE} TEXT NULL,
  ${table.COLUMN.GENERATED_AT} DATETIME NULL,
  ${table.COLUMN.UPDATED_AT} DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (${table.COLUMN.ID}),
  UNIQUE KEY uq_${table.TABLE}_project (${table.COLUMN.PROJECT_ID})
) ENGINE=InnoDB`;

const QUERY = {
  ddl: DDL,
  upsertStatus: `INSERT INTO ${table.TABLE}
    (${table.COLUMN.ID}, ${table.COLUMN.PROJECT_ID}, ${table.COLUMN.STATUS})
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE
     ${table.COLUMN.STATUS} = ?`,
  updateStatus: `UPDATE ${table.TABLE}
    SET ${table.COLUMN.STATUS} = ?
    WHERE ${table.COLUMN.PROJECT_ID} = ?`,
  existsByProjectId: `SELECT ${table.COLUMN.ID} FROM ${table.TABLE}
    WHERE ${table.COLUMN.PROJECT_ID} = ? LIMIT 1`,
  insertResult: `INSERT INTO ${table.TABLE}
    (${table.COLUMN.ID}, ${table.COLUMN.PROJECT_ID}, ${table.COLUMN.OVERVIEW},
     ${table.COLUMN.HEALTH_SCORE}, ${table.COLUMN.RISK_LEVEL}, ${table.COLUMN.TREND},
     ${table.COLUMN.KEY_ISSUES}, ${table.COLUMN.PROBLEM_PATTERNS}, ${table.COLUMN.LESSONS_LEARNED},
     ${table.COLUMN.ACTION_ITEMS}, ${table.COLUMN.REMARK_COUNT},
     ${table.COLUMN.MODEL}, ${table.COLUMN.STATUS}, ${table.COLUMN.ERROR_MESSAGE},
     ${table.COLUMN.GENERATED_AT})
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
  updateResult: `UPDATE ${table.TABLE} SET
     ${table.COLUMN.OVERVIEW} = ?,
     ${table.COLUMN.HEALTH_SCORE} = ?,
     ${table.COLUMN.RISK_LEVEL} = ?,
     ${table.COLUMN.TREND} = ?,
     ${table.COLUMN.KEY_ISSUES} = ?,
     ${table.COLUMN.PROBLEM_PATTERNS} = ?,
     ${table.COLUMN.LESSONS_LEARNED} = ?,
     ${table.COLUMN.ACTION_ITEMS} = ?,
     ${table.COLUMN.REMARK_COUNT} = ?,
     ${table.COLUMN.MODEL} = ?,
     ${table.COLUMN.STATUS} = ?,
     ${table.COLUMN.ERROR_MESSAGE} = ?,
     ${table.COLUMN.GENERATED_AT} = NOW()
    WHERE ${table.COLUMN.PROJECT_ID} = ?`,
  selectByProjectId: `SELECT
     ${table.COLUMN.ID},
     ${table.COLUMN.PROJECT_ID},
     ${table.COLUMN.OVERVIEW},
     ${table.COLUMN.HEALTH_SCORE},
     ${table.COLUMN.RISK_LEVEL},
     ${table.COLUMN.TREND},
     ${table.COLUMN.KEY_ISSUES},
     ${table.COLUMN.PROBLEM_PATTERNS},
     ${table.COLUMN.LESSONS_LEARNED},
     ${table.COLUMN.ACTION_ITEMS},
     ${table.COLUMN.REMARK_COUNT},
     ${table.COLUMN.MODEL},
     ${table.COLUMN.STATUS},
     ${table.COLUMN.ERROR_MESSAGE},
     DATE_FORMAT(${table.COLUMN.GENERATED_AT}, '%Y-%m-%dT%H:%i:%sZ') AS ${table.COLUMN.GENERATED_AT},
     DATE_FORMAT(${table.COLUMN.UPDATED_AT}, '%Y-%m-%dT%H:%i:%sZ') AS ${table.COLUMN.UPDATED_AT}
    FROM ${table.TABLE}
    WHERE ${table.COLUMN.PROJECT_ID} = ?
    LIMIT 1`,
};

module.exports = {
  projectAiSummaryQuerys: QUERY,
  projectAiSummaryTable: table,
};
