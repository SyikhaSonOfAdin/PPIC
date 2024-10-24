const { userTable } = require("./user")

const table = {
    TABLE: "project_category",
    COLUMN: {
        ID: "ID",
        COMPANY_ID: "COMPANY_ID",
        INPUT_BY: "INPUT_BY",
        INPUT_DATE: "INPUT_DATE",
        NAME: "NAME",
        DESCRIPTION: "DESCRIPTION",
        UOM: "UOM",
    }
}

const QUERY = {
    insert: `INSERT INTO ${table.TABLE} (${table.COLUMN.ID}, ${table.COLUMN.COMPANY_ID}, ${table.COLUMN.INPUT_BY}, ${table.COLUMN.NAME}, ${table.COLUMN.DESCRIPTION}, ${table.COLUMN.UOM}) VALUES (?,?,?,?,?,?)`,
    delete: {
        onlyOne: `DELETE FROM ${table.TABLE} WHERE ${table.COLUMN.ID} = ?`
    },
    update: `UPDATE ${table.TABLE} SET ${table.COLUMN.NAME} = ?, ${table.COLUMN.DESCRIPTION} = ?, ${table.COLUMN.UOM} = ?, ${table.COLUMN.INPUT_BY} = ?, ${table.COLUMN.INPUT_DATE} = NOW() WHERE ${table.COLUMN.ID} = ?`,
    select: `SELECT PC.${table.COLUMN.ID}, PC.${table.COLUMN.NAME}, PC.${table.COLUMN.DESCRIPTION}, PC.${table.COLUMN.UOM}, DATE_FORMAT(PC.${table.COLUMN.INPUT_DATE}, '%Y-%m-%d') AS INPUT_DATE, U.${userTable.COLUMN.USERNAME} AS INPUT_BY FROM ${table.TABLE} AS PC JOIN ${userTable.TABLE} AS U ON PC.${table.COLUMN.INPUT_BY} = U.${userTable.COLUMN.ID} WHERE PC.${table.COLUMN.COMPANY_ID} = ?`
}

module.exports = {
    categoryTable: table,
    categoryQuerys: QUERY
}