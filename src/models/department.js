const { companyTable } = require("./company")
const { projectTable } = require("./project")
const { userTable } = require("./user")

const table = {
    TABLE: "department",
    COLUMN: {
        ID: "ID",
        COMPANY_ID: "COMPANY_ID",
        INPUT_BY: "INPUT_BY",
        INPUT_DATE: "INPUT_DATE",
        NAME: "NAME",
    }
}

const QUERY = {
    insert: `INSERT INTO ${table.TABLE} (${table.COLUMN.ID}, ${table.COLUMN.COMPANY_ID}, ${table.COLUMN.INPUT_BY}, ${table.COLUMN.NAME}) VALUES (?,?,?,?)`,
    delete: {
        onlyOne: `DELETE FROM ${table.TABLE} WHERE ${table.COLUMN.ID} = ?`
    },
    update: `UPDATE ${table.TABLE} SET ${table.COLUMN.INPUT_BY} = ?, ${table.COLUMN.INPUT_DATE} = NOW(), ${table.COLUMN.NAME} = ? WHERE ${table.COLUMN.ID} = ?`,
    select: {
        all: `SELECT C.${companyTable.COLUMN.NAME} AS COMPANY_NAME, D.${table.COLUMN.ID}, U.${userTable.COLUMN.USERNAME} AS INPUT_BY, DATE_FORMAT(D.${table.COLUMN.INPUT_DATE}, '%Y-%m-%d') AS INPUT_DATE, D.${table.COLUMN.NAME} 
        FROM ${table.TABLE} AS D 
        JOIN ${userTable.TABLE} AS U ON D.${table.COLUMN.INPUT_BY} = U.${userTable.COLUMN.ID}
        JOIN ${companyTable.TABLE} AS C ON D.${table.COLUMN.COMPANY_ID} = C.${companyTable.COLUMN.ID}
        WHERE D.${table.COLUMN.COMPANY_ID} = ?`,
        onlyOne: `SELECT D.${table.COLUMN.ID}, D.${table.COLUMN.NAME}
        FROM ${table.TABLE} AS D WHERE D.${table.COLUMN.ID} = ?`,
        detail: {
            withUser: `SELECT U.${userTable.COLUMN.ID}, U.${userTable.COLUMN.USERNAME}, D.${table.COLUMN.NAME} FROM ${userTable.TABLE} AS U
            JOIN ${table.TABLE} AS D ON U.${userTable.COLUMN.DEPARTMENT_ID} = D.${table.COLUMN.ID}
            WHERE D.${table.COLUMN.ID} = ?`,
        }
    }
}

module.exports = {
    departmentQuerys: QUERY,
    departmentTable: table
}