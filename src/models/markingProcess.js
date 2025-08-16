const table = {
    TABLE: "marking_process",
    COLUMN: {
        ID: "ID",
        MARKING_ID: "MARKING_ID",
        PROCESS_ID: "PROCESS_ID",
        INPUT_BY: "INPUT_BY",
        INPUT_DATE: "INPUT_DATE",
        ACTUAL_DATE: "ACTUAL_DATE"
    }
}

const QUERY = {
    insert: `INSERT INTO ${table.TABLE} (${table.COLUMN.ID}, ${table.COLUMN.MARKING_ID}, ${table.COLUMN.PROCESS_ID}, ${table.COLUMN.INPUT_BY}, ${table.COLUMN.ACTUAL_DATE}) VALUES (?,?,?,?,?)`,
    delete: {
        by: {
            id: `DELETE FROM ${table.TABLE} WHERE ${table.COLUMN.ID} = ?`,
        }
    },
    update: `UPDATE ${table.TABLE} SET ${table.COLUMN.ACTUAL_DATE} = ?, ${table.COLUMN.INPUT_BY} = ?, ${table.COLUMN.INPUT_DATE} = NOW() WHERE ${table.COLUMN.ID} = ?`,
    select: {
        by: {
            markingId: `SELECT ${table.COLUMN.MARKING_ID}, ${table.COLUMN.PROCESS_ID}, ${table.COLUMN.ACTUAL_DATE} FROM ${table.TABLE} WHERE ${table.COLUMN.MARKING_ID} = ?`
        },
    }
}

module.exports = {
    markingProcessTable: table,
    markingProcessQuerys: QUERY
}