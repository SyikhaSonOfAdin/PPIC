const table = {
    TABLE: "project_attachment",
    COLUMN: {
        ID: "ID",
        PROJECT_ID: "PROJECT_ID",
        INPUT_BY: "INPUT_BY",
        INPUT_DATE: "INPUT_DATE",
        FILE_NAME: "FILE_NAME",
        DESCRIPTION: "DESCRIPTION",
    }
}

const QUERY = {
    insert: `INSERT INTO ${table.TABLE} (${table.COLUMN.ID}, ${table.COLUMN.PROJECT_ID}, ${table.COLUMN.INPUT_BY}, ${table.COLUMN.FILE_NAME}, ${table.COLUMN.DESCRIPTION}) VALUES (?,?,?,?,?)`,
    select: {
        byProjectId: `SELECT * FROM ${table.TABLE} WHERE ${table.COLUMN.PROJECT_ID} = ?`
    },
    update: `UPDATE ${table.TABLE} SET ${table.COLUMN.DESCRIPTION} = ?, ${table.COLUMN.INPUT_BY} = ?, ${table.COLUMN.INPUT_BY} = NOW() WHERE ${table.COLUMN.ID} = ?`,
    delete: {
        onlyOne: `DELETE FROM ${table.TABLE} WHERE ${table.COLUMN.ID} = ?`
    }
}

module.exports = {
    projectAttachmentTable: table,
    projectAttachmentQuerys: QUERY,
}