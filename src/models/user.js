const { companyTable } = require("./company")

const table = {
    TABLE: "users",
    COLUMN: {
        ID: "ID",
        COMPANY_ID: "COMPANY_ID",
        DEPARTMENT_ID: "DEPARTMENT_ID",
        USERNAME: "USERNAME",
        EMAIL: "EMAIL",
        PASSWORD: "PASSWORD",
        SINCE: "SINCE",
    }
}

const QUERY = {
    get: {
        all: {
            all: `SELECT U.${table.COLUMN.ID}, U.${table.COLUMN.USERNAME}, U.${table.COLUMN.EMAIL}, DATE_FORMAT(U.${table.COLUMN.SINCE}, "%Y-%m-%d") AS INPUT_DATE FROM ${table.TABLE} AS U WHERE U.${table.COLUMN.COMPANY_ID} = ?`,
            withoutDepartment: `SELECT U.${table.COLUMN.ID}, U.${table.COLUMN.USERNAME} FROM ${table.TABLE} AS U WHERE U.${table.COLUMN.COMPANY_ID} = ? AND U.${table.COLUMN.DEPARTMENT_ID} IS NULL`,
            byDepId: `SELECT U.${table.COLUMN.ID}, U.${table.COLUMN.USERNAME}, U.${table.COLUMN.EMAIL} FROM ${table.TABLE} AS U WHERE U.${table.COLUMN.DEPARTMENT_ID} = ?`,
        },
        onlyOne: {
            all: {
                byEmail: `SELECT U.*, C.${companyTable.COLUMN.NAME} AS COMPANY_NAME FROM ${table.TABLE} AS U JOIN ${companyTable.TABLE} AS C ON U.${table.COLUMN.COMPANY_ID} = C.${companyTable.COLUMN.ID} WHERE U.${table.COLUMN.EMAIL} = ?`
            },
            email: {
                byEmail: `SELECT ${table.COLUMN.EMAIL} FROM ${table.TABLE} WHERE ${table.COLUMN.EMAIL} = ?`
            }
        },
    },
    update : {
        department: `UPDATE ${table.TABLE} SET ${table.COLUMN.DEPARTMENT_ID} = ? WHERE ${table.COLUMN.ID} = ?`,
    },
    insert : `INSERT INTO ${table.TABLE} (${table.COLUMN.ID}, ${table.COLUMN.COMPANY_ID}, ${table.COLUMN.USERNAME}, ${table.COLUMN.EMAIL}, ${table.COLUMN.PASSWORD}) VALUES (?,?,?,?,?)`,
    delete: {
        user: `DELETE FROM ${table.TABLE} WHERE ${table.COLUMN.ID} = ?`,
        department: {
            onlyOne: `UPDATE ${table.TABLE} SET ${table.COLUMN.DEPARTMENT_ID} = NULL WHERE ${table.COLUMN.ID} = ?`,
            all: `UPDATE ${table.TABLE} SET ${table.COLUMN.DEPARTMENT_ID} = NULL WHERE ${table.COLUMN.DEPARTMENT_ID} = ?`,
        }
    }
}

module.exports = {
    userTable: table,
    userQuerys: QUERY,
}