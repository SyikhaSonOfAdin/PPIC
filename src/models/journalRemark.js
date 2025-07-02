const { companyTable } = require("./company")
const { projectTable } = require("./project")
const { userTable } = require("./user")

const table = {
    TABLE: "project_remark",
    COLUMN: {
        ID: "ID",
        PROJECT_ID: "PROJECT_ID",
        INPUT_BY: "INPUT_BY",
        INPUT_DATE: "INPUT_DATE",
        DESCRIPTION: "DESCRIPTION",
    }
}

const QUERY = {
    insert: `INSERT INTO ${table.TABLE} (${table.COLUMN.ID}, ${table.COLUMN.PROJECT_ID}, ${table.COLUMN.INPUT_BY}, ${table.COLUMN.DESCRIPTION}) VALUES (?,?,?,?)`,
    delete: {
        all: `DELETE FROM ${table.TABLE} WHERE ${table.COLUMN.PROJECT_ID} = ?`,
        onlyOne: `DELETE FROM ${table.TABLE} WHERE ${table.COLUMN.ID} = ?`
    },
    update: `UPDATE ${table.TABLE} SET ${table.COLUMN.INPUT_BY} = ?, ${table.COLUMN.INPUT_DATE} = NOW(), ${table.COLUMN.DESCRIPTION} = ? WHERE ${table.COLUMN.ID} = ?`,
    select: {
        onlyOne: `SELECT PR.${table.COLUMN.ID}, 
        U.${userTable.COLUMN.USERNAME} AS INPUT_BY, DATE_FORMAT(PR.${table.COLUMN.INPUT_DATE}, '%Y-%m-%d') AS INPUT_DATE, PR.${table.COLUMN.DESCRIPTION} FROM ${table.TABLE} AS PR JOIN ${userTable.TABLE} AS U ON PR.${table.COLUMN.INPUT_BY} = U.${userTable.COLUMN.ID} WHERE PR.${table.COLUMN.PROJECT_ID} = ?`,
        all: `SELECT PR.${table.COLUMN.ID}, 
        PR.${table.COLUMN.PROJECT_ID},
        U.${userTable.COLUMN.USERNAME} AS INPUT_BY, 
        DATE_FORMAT(PR.${table.COLUMN.INPUT_DATE}, '%Y-%m-%d') AS INPUT_DATE, 
        PR.${table.COLUMN.DESCRIPTION} 
        FROM ${table.TABLE} AS PR 
        JOIN ${projectTable.TABLE} AS P ON PR.${table.COLUMN.PROJECT_ID} = P.${projectTable.COLUMN.ID}
        JOIN ${companyTable.TABLE} AS C ON P.${projectTable.COLUMN.COMPANY_ID} = C.${companyTable.COLUMN.ID}
        JOIN ${userTable.TABLE} AS U ON PR.${table.COLUMN.INPUT_BY} = U.${userTable.COLUMN.ID}
        WHERE C.${companyTable.COLUMN.ID} = ?`,
    }
}

module.exports = {
    remarkQuerys: QUERY,
    remarkTable: table
}