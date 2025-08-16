const { projectTable } = require("./project")

const table = {
    TABLE: 'project_productivity',
    COLUMN: {
        ID: "ID",
        PROCESS_ID: "PROCESS_ID",
        PROJECT_ID: "PROJECT_ID",
        PERIOD_ID: "PERIOD_ID",
        INPUT_BY: "INPUT_BY",
        INPUT_DATE: "INPUT_DATE",
        PROGRESS: "PROGRESS",
        MAN_POWER: "MAN_POWER",
        MAN_HOUR: "MAN_HOUR",
    }
}

const QUERY = {
    insert: `INSERT INTO 
    ${table.TABLE} (${table.COLUMN.ID}, ${table.COLUMN.PROCESS_ID}, ${table.COLUMN.PROJECT_ID}, 
    ${table.COLUMN.PERIOD_ID}, ${table.COLUMN.INPUT_BY}, ${table.COLUMN.PROGRESS}, ${table.COLUMN.MAN_POWER}, ${table.COLUMN.MAN_HOUR})
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
        ${table.COLUMN.PROGRESS} = VALUES(${table.COLUMN.PROGRESS}),
        ${table.COLUMN.MAN_POWER} = VALUES(${table.COLUMN.MAN_POWER}),
        ${table.COLUMN.MAN_HOUR} = VALUES(${table.COLUMN.MAN_HOUR}),
        ${table.COLUMN.INPUT_BY} = VALUES(${table.COLUMN.INPUT_BY}),
        ${table.COLUMN.INPUT_DATE} = NOW()`,
    select: {
        by: {
            companyId: `SELECT PP.${table.COLUMN.PROJECT_ID}, PP.${table.COLUMN.PROCESS_ID}, PP.${table.COLUMN.PERIOD_ID}, DATE_FORMAT(PP.${table.COLUMN.INPUT_DATE}, '%Y-%m-%d') AS INPUT_DATE, PP.${table.COLUMN.PROGRESS}, PP.${table.COLUMN.MAN_POWER}, PP.${table.COLUMN.MAN_HOUR} 
            FROM ${table.TABLE} AS PP 
            JOIN ${projectTable.TABLE} AS P ON PP.${table.COLUMN.PROJECT_ID} = P.${projectTable.COLUMN.ID}
            WHERE P.${projectTable.COLUMN.COMPANY_ID} = ?`,
            projectId: `SELECT PP.${table.COLUMN.PROCESS_ID}, PP.${table.COLUMN.PERIOD_ID}, DATE_FORMAT(PP.${table.COLUMN.INPUT_DATE}, '%Y-%m-%d') AS INPUT_DATE, PP.${table.COLUMN.PROGRESS}, PP.${table.COLUMN.MAN_POWER}, PP.${table.COLUMN.MAN_HOUR} 
            FROM ${table.TABLE} AS PP WHERE PP.${table.COLUMN.PROJECT_ID} = ?`
        }
    }
}

module.exports = {
    projectProductivityTable: table,
    projectProductivityQuery: QUERY
}