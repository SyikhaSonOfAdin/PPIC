const { permissionsTable } = require("./permissions")

const table = {
    TABLE: "users_permissions",
    COLUMN: {
        ID: "ID",
        USER_ID: "USER_ID",
        PERMISSION_ID: "PERMISSION_ID",
    }
}

const QUERY = {
    get: `SELECT * ${table.TABLE} WHERE ${table.COLUMN.USER_ID} = ?`,
    insert: `INSERT INTO ${table.TABLE} (${table.COLUMN.ID}, ${table.COLUMN.USER_ID}, ${table.COLUMN.PERMISSION_ID}) VALUES (?,?,?)`,
    delete: {
        all: `DELETE FROM ${table.TABLE} WHERE ${table.COLUMN.USER_ID} = ?`,
        onlyOne: `DELETE FROM ${table.TABLE} WHERE ${table.COLUMN.PERMISSION_ID} = ? AND ${table.COLUMN.USER_ID} = ?`,
    }
}

module.exports = {
    privilegeTable: table,
    privilegeQuerys: QUERY
}