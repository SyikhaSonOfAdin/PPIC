const { userTable } = require("./user")

const table = {
    TABLE: "project_plans",
    COLUMN: {
        ID: "ID",
        PROJECT_ID: "PROJECT_ID",
        INPUT_BY: "INPUT_BY",
        INPUT_DATE: "INPUT_DATE",
        PERIOD_YEAR: "PERIOD_YEAR",
        PERIOD_MONTH: "PERIOD_MONTH",
        AMOUNT: "AMOUNT",
    }
}

const QUERY = {
    insert: `INSERT INTO ${table.TABLE} (${table.COLUMN.ID}, ${table.COLUMN.PROJECT_ID}, ${table.COLUMN.INPUT_BY}, ${table.COLUMN.PERIOD_YEAR}, ${table.COLUMN.PERIOD_MONTH}, ${table.COLUMN.AMOUNT}) VALUES (?,?,?,?,?,?)`,
    delete: {
        all: `DELETE FROM ${table.TABLE} WHERE ${table.COLUMN.PROJECT_ID} = ?`,
        onlyOne: `DELETE FROM ${table.TABLE} WHERE ${table.COLUMN.ID} = ?`,
    },
    update: `UPDATE ${table.TABLE} SET ${table.COLUMN.INPUT_BY} = ?, ${table.COLUMN.INPUT_DATE} = NOW(), ${table.COLUMN.PERIOD_YEAR} = ?, ${table.COLUMN.PERIOD_MONTH} = ?, ${table.COLUMN.AMOUNT} = ? WHERE ${table.COLUMN.ID} = ?`,
    select: `SELECT PP.${table.COLUMN.ID}, 
            U.${userTable.COLUMN.USERNAME} AS INPUT_BY,
            DATE_FORMAT(PP.${table.COLUMN.INPUT_DATE}, '%Y-%m-%d') AS INPUT_DATE, 
            PP.${table.COLUMN.PERIOD_YEAR},
            DATE_FORMAT(PP.${table.COLUMN.PERIOD_MONTH}, '%m-%d') AS PERIOD_MONTH,
            PP.${table.COLUMN.AMOUNT} 
            FROM ${table.TABLE} AS PP
            JOIN ${userTable.TABLE} AS U ON PP.${table.COLUMN.INPUT_BY} = U.${userTable.COLUMN.ID} 
            WHERE PP.${table.COLUMN.PROJECT_ID} = ?`
}

module.exports = {
    plansQuerys: QUERY,
    plansTable: table
}