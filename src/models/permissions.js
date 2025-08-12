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
    get: {
        all: `SELECT * FROM ${table.TABLE} ORDER BY ${table.COLUMN.ID} ASC`,
        single: `SELECT * FROM ${table.TABLE} WHERE ${table.COLUMN.ID} = ? ORDER BY ${table.COLUMN.ID} ASC`,
    },
    add: `INSERT INTO ${table.TABLE} (${table.COLUMN.ID}, ${table.COLUMN.NAME}, ${table.COLUMN.DESCRIPTION}) VALUES (?,?,?)`,
}

const userPermissionsQuery = {
    insert: `INSERT INTO ${userPermissionsTable.TABLE} (${userPermissionsTable.COLUMN.ID}, ${userPermissionsTable.COLUMN.USER_ID}, ${userPermissionsTable.COLUMN.PERMISSION_ID}, ${userPermissionsTable.COLUMN.GRANTED}) VALUES (?,?,?,?) 
    ON DUPLICATE KEY UPDATE ${userPermissionsTable.COLUMN.GRANTED} = VALUES(${userPermissionsTable.COLUMN.GRANTED})`,
    select: {
        single: `SELECT * FROM ${userPermissionsTable.TABLE} WHERE ${userPermissionsTable.COLUMN.PERMISSION_ID} = ?`,
    },
}

module.exports = {
    permissionsQuerys: QUERY,
    permissionsTable: table,
    userPermissionsQuery
}