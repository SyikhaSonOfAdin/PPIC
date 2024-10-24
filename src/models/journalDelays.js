const table = {    
    TABLE: "project_delay",
    COLUMN: {
        ID: "ID",
        PROJECT_ID: "PROJECT_ID",
        INPUT_BY: "INPUT_BY",
        INPUT_DATE: "INPUT_DATE",
        DAYS: "DAYS",
        DESCRIPTION: "DESCRIPTION",
    }
}

const QUERY = {
    insert: `INSERT INTO ${table.TABLE} (${table.COLUMN.ID}, ${table.COLUMN.PROJECT_ID}, ${table.COLUMN.INPUT_BY}, ${table.COLUMN.DAYS}, ${table.COLUMN.DESCRIPTION}) VALUES (?,?,?,?,?)`,
    update: `UPDATE ${table.TABLE} SET ${table.COLUMN.INPUT_BY} = ?, ${table.COLUMN.INPUT_DATE} = NOW(), ${table.COLUMN.DAYS} = ?, ${table.COLUMN.DESCRIPTION} = ? WHERE ${table.COLUMN.ID} = ?`,
    delete: {
        all: `DELETE FROM ${table.TABLE} WHERE ${table.COLUMN.PROJECT_ID} = ?`,
        onlyOne: `DELETE FROM ${table.TABLE} WHERE ${table.COLUMN.ID} = ?`,
    },
    select: `SELECT * FROM ${table.TABLE} WHERE ${table.COLUMN.PROJECT_ID} = ?`
}

module.exports = {
    delayQuerys: QUERY,
    delayTable: table
}