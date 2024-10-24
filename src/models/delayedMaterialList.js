const table = {
    TABLE: "delayed_material_list",
    COLUMN: {
        ID: "ID",
        DELAYED_MATERIAL_ID: "DELAYED_MATERIAL_ID",
        INPUT_BY: "INPUT_BY",
        INPUT_DATE: "INPUT_DATE",
        IDENT_CODE: "IDENT_CODE",
        DESCRIPTION: "DESCRIPTION",
        QTY: "QTY",
    }
}

const QUERY = {
    insert: `INSERT INTO ${table.TABLE} (${table.COLUMN.ID}, ${table.COLUMN.DELAYED_MATERIAL_ID}, ${table.COLUMN.INPUT_BY}, ${table.COLUMN.IDENT_CODE}, ${table.COLUMN.DESCRIPTION}, ${table.COLUMN.QTY}) VALUES (?,?,?,?,?,?)`,
    delete: {
        all: `DELETE FROM ${table.TABLE} WHERE ${table.COLUMN.DELAYED_MATERIAL_ID} = ?`,
        onlyOne: `DELETE FROM ${table.TABLE} WHERE ${table.COLUMN.ID} = ?`
    },
    update: `UPDATE ${table.TABLE} SET ${table.COLUMN.INPUT_BY} = ?, ${table.COLUMN.INPUT_DATE} = NOW(), ${table.COLUMN.IDENT_CODE} = ?, ${table.COLUMN.DESCRIPTION} = ?, ${table.COLUMN.QTY} = ? WHERE ${table.COLUMN.ID} = ?`,
    select: `SELECT * FROM ${table.TABLE} WHERE ${table.COLUMN.DELAYED_MATERIAL_ID} = ?`
}

module.exports = {
    delayedMaterialListQuerys: QUERY,
    delayedMaterialListTable: table,
}