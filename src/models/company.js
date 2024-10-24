const table = {
    TABLE: "company",
    COLUMN: {
        ID: "ID",
        NAME: "NAME",
        SINCE: "SINCE",
        STATUS: "STATUS",
    }
}

const QUERY = {
    insert: `INSERT INTO ${table.TABLE} (${table.COLUMN.ID}, ${table.COLUMN.NAME}) VALUES (?,?)`,
    update: {
        all: `UPDATE ${table.TABLE} SET ${table.COLUMN.NAME} = ?, ${table.COLUMN.STATUS} = ? WHERE ${table.COLUMN.ID} = ?`,
        name: `UPDATE ${table.TABLE} SET ${table.COLUMN.NAME} = ? WHERE ${table.COLUMN.ID} = ?`,
        status: `UPDATE ${table.TABLE} SET ${table.COLUMN.STATUS} = ? WHERE ${table.COLUMN.ID} = ?`,
    },
    delete: `DELETE FROM ${table.TABLE} WHERE ${table.COLUMN.ID} = ?`
}

module.exports = {
    companyTable: table,
    companyQuerys: QUERY
}