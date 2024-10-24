const table = {
    TABLE: "delayed_material_detail",
    COLUMN: {
        ID: "ID",
        MATERIAL_LIST_ID: "MATERIAL_LIST_ID",
        INPUT_BY: "INPUT_BY",
        INPUT_DATE: "INPUT_DATE",
        MARKING: "MARKING",
        DESCRIPTION: "DESCRIPTION",
    }
}

const QUERY = {
    insert: `INSERT INTO ${table.TABLE} (${table.COLUMN.ID}, ${table.COLUMN.MATERIAL_LIST_ID}, ${table.COLUMN.INPUT_BY}, ${table.COLUMN.MARKING}, ${table.COLUMN.DESCRIPTION}) VALUES (?,?,?,?,?)`,
    delete: {
        all: `DELETE FROM ${table.TABLE} WHERE ${table.COLUMN.MATERIAL_LIST_ID} = ?`,
        onlyOne: `DELETE FROM ${table.TABLE} WHERE ${table.COLUMN.ID} = ?`
    },
    update: `UPDATE ${table.TABLE} SET ${table.COLUMN.INPUT_BY} = ?, ${table.COLUMN.INPUT_DATE} = NOW(), ${table.COLUMN.MARKING} = ?, ${table.COLUMN.DESCRIPTION} = ? WHERE ${table.COLUMN.ID} = ?`,
    select: `SELECT * FROM ${table.TABLE} WHERE ${table.COLUMN.MATERIAL_LIST_ID} = ?`
}

module.exports = {
    delayedMaterialDetailQuerys: QUERY,
    delayedMaterialDetailTable: table,
}