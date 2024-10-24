const table = {
    TABLE: "list_permissions",
    COLUMN: {
        ID: "ID",
        NAME: "NAME",
        DESCRIPTION: "DESCRIPTION",
    }
}

const userPermissionsTable = {
    TABLE: "users_permissions",
    COLUMN: {
        ID: "ID",
        USER_ID: "USER_ID",
        PERMISSION_ID: "PERMISSION_ID",
        GRANTED: "GRANTED",
    }
}

const QUERY = {
    get: `SELECT * FROM ${table.TABLE} ORDER BY ${table.COLUMN.ID} DESC`
}

const userPermissionsQuery = {
    insert: `INSERT INTO ${userPermissionsTable.TABLE} (${userPermissionsTable.COLUMN.ID}, ${userPermissionsTable.COLUMN.USER_ID}, ${userPermissionsTable.COLUMN.PERMISSION_ID}, ${userPermissionsTable.COLUMN.GRANTED}) VALUES (?,?,?,?)`
}

module.exports = {
    permissionsQuerys: QUERY,
    permissionsTable: table,
    userPermissionsQuery
}