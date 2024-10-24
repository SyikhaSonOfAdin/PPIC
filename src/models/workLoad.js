const { categoryTable } = require("./category")
const { userTable } = require("./user")

const table = {
    TABLE: "company_work_load",
    COLUMN: {
        ID: "ID",
        CATEGORY_ID: "CATEGORY_ID",
        INPUT_BY: "INPUT_BY",
        INPUT_DATE: "INPUT_DATE",
        PERIOD_YEAR: "PERIOD_YEAR",
        WORK_LOAD: "WORK_LOAD",
    }
}

const QUERY = {
    insert: `INSERT INTO ${table.TABLE} (${table.COLUMN.ID}, ${table.COLUMN.CATEGORY_ID}, ${table.COLUMN.INPUT_BY}, ${table.COLUMN.PERIOD_YEAR}, ${table.COLUMN.WORK_LOAD}) VALUES (?,?,?,?,?)`,
    update: `UPDATE ${table.TABLE} SET ${table.COLUMN.INPUT_BY} = ?, ${table.COLUMN.PERIOD_YEAR} = ?, ${table.COLUMN.WORK_LOAD} = ? WHERE ${table.COLUMN.ID} = ?`,
    delete: `DELETE FROM ${table.TABLE} WHERE ${table.COLUMN.ID} = ?`,
    select: {
        all: `SELECT
            CWL.${table.COLUMN.ID},
            C.${categoryTable.COLUMN.ID} AS CATEGORY_ID,
            C.${categoryTable.COLUMN.NAME} AS CATEGORY,
            C.${categoryTable.COLUMN.UOM} AS UOM,
            DATE_FORMAT(CWL.${table.COLUMN.INPUT_DATE}, "%Y-%m-%d") AS INPUT_DATE,
            U.${userTable.COLUMN.USERNAME} AS INPUT_BY,
            DATE_FORMAT(CWL.${table.COLUMN.PERIOD_YEAR}, "%Y-%m-%d") AS PERIOD_YEAR,
            CWL.${table.COLUMN.WORK_LOAD}
            FROM ${table.TABLE} AS CWL 
            JOIN ${categoryTable.TABLE} AS C ON CWL.${table.COLUMN.CATEGORY_ID} = C.${categoryTable.COLUMN.ID} 
            JOIN ${userTable.TABLE} AS U ON CWL.${table.COLUMN.INPUT_BY} = U.${userTable.COLUMN.ID} 
            WHERE C.${categoryTable.COLUMN.COMPANY_ID} = ?`,
        onlyOne: {
            byYear: `SELECT * FROM ${table.TABLE} WHERE ${table.COLUMN.CATEGORY_ID} = ? AND YEAR(${table.COLUMN.PERIOD_YEAR}) = ?`
        }
    }
}

module.exports = {
    workLoadQuerys: QUERY,
    workLoadTable: table
}