const table = {
    TABLE: "project_marking",
    COLUMN: {
        ID: "ID",
        PROJECT_ID: "PROJECT_ID",
        INPUT_BY: "INPUT_BY",
        INPUT_DATE: "INPUT_DATE",
        MARKING: "MARKING"
    }
}

const QUERY = {
    insert: `INSERT INTO ${table.TABLE} (${table.COLUMN.ID}, ${table.COLUMN.PROJECT_ID}, ${table.COLUMN.INPUT_BY}, ${table.COLUMN.MARKING}) VALUES (?,?,?,?)`,
    update: {
        by: {
            id: `UPDATE ${table.TABLE} SET ${table.COLUMN.INPUT_BY} = ?, ${table.COLUMN.INPUT_DATE} = NOW(), ${table.COLUMN.MARKING} = ? WHERE ${table.COLUMN.ID} = ?`,
        }
    },
    delete: {
        by: {
            id: `DELETE FROM ${table.TABLE} WHERE ${table.COLUMN.ID} = ?`,
            projectId: `DELETE FROM ${table.TABLE} WHERE ${table.COLUMN.PROJECT_ID} = ?`,
        }
    },
    select: {
        by: {
            projectId: `SELECT * FROM ${table.TABLE} WHERE ${table.COLUMN.PROJECT_ID} = ?`
        },
    }
}

module.exports = {
    projectMarkingTable: table,
    projectMarkingQuerys: QUERY
}