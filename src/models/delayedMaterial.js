const table = {
    TABLE: "delayed_material",
    COLUMN: {
        ID: "ID",
        PROJECT_ID: "PROJECT_ID",
        INPUT_BY: "INPUT_BY",
        INPUT_DATE: "INPUT_DATE",
        INCOMING_DATE: "INCOMING_DATE",
    }
}

const QUERY = {
    insert: `INSERT INTO ${table.TABLE} (${table.COLUMN.ID}, ${table.COLUMN.PROJECT_ID}, ${table.COLUMN.INPUT_BY}, ${table.COLUMN.INCOMING_DATE}) VALUES (?,?,?,?)`,
    delete: {
        all: `DELETE FROM ${table.TABLE} WHERE ${table.COLUMN.PROJECT_ID} = ?`,
        onlyOne: `DELETE FROM ${table.TABLE} WHERE ${table.COLUMN.ID} = ?`,
    },
    update: `UPDATE ${table.TABLE} SET ${table.COLUMN.INPUT_BY} = ?, ${table.COLUMN.INPUT_DATE} = NOW(), ${table.COLUMN.INCOMING_DATE} = ? WHERE ${table.COLUMN.ID} = ?`,
    select: `SELECT * FROM ${table.TABLE} WHERE ${table.COLUMN.PROJECT_ID} = ?`
}

module.exports = {
    delayedMaterialQuerys: QUERY,
    delayedMaterialTable: table,
}