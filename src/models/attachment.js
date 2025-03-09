const { userTable } = require("./user")

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
    insert: `INSERT INTO ${table.TABLE} (${table.COLUMN.ID}, ${table.COLUMN.PROJECT_ID}, ${table.COLUMN.INPUT_BY}, ${table.COLUMN.FILE_NAME}, ${table.COLUMN.DESCRIPTION}, ${table.COLUMN.INPUT_DATE}) VALUES (?,?,?,?,?, NOW())`,
    select: {
        byProjectId: `
            SELECT 
                a.${table.COLUMN.ID}, 
                a.${table.COLUMN.PROJECT_ID},
                DATE_FORMAT(a.${table.COLUMN.INPUT_DATE}, '%Y-%m-%d') AS ${table.COLUMN.INPUT_DATE}, 
                a.${table.COLUMN.FILE_NAME}, 
                a.${table.COLUMN.DESCRIPTION}, 
                u.${userTable.COLUMN.USERNAME} AS INPUT_BY
            FROM ${table.TABLE} a
            JOIN ${userTable.TABLE} u ON a.${table.COLUMN.INPUT_BY} = u.${userTable.COLUMN.ID}
            WHERE a.${table.COLUMN.PROJECT_ID} = ?
        `,
        byRowId: `SELECT ${table.COLUMN.FILE_NAME} FROM ${table.TABLE} WHERE ${table.COLUMN.ID} = ?`
    },
    update: `UPDATE ${table.TABLE} SET ${table.COLUMN.DESCRIPTION} = ?, ${table.COLUMN.INPUT_BY} = ?, ${table.COLUMN.INPUT_DATE} = NOW() WHERE ${table.COLUMN.ID} = ?`,
    delete: {
        onlyOne: `DELETE FROM ${table.TABLE} WHERE ${table.COLUMN.ID} = ?`
    }
}

module.exports = {
    projectAttachmentTable: table,
    projectAttachmentQuerys: QUERY,
}