const table = {
    TABLE: "project_detail",
    COLUMN: {
        ID: "ID",
        PROJECT_ID: "PROJECT_ID",
        INPUT_BY: "INPUT_BY",
        INPUT_DATE: "INPUT_DATE",
        NAME: "NAME",
        DESCRIPTION: "DESCRIPTION",
        PPM: "PPM",
        CAPACITY: "CAPACITY",
        WORK_PLACE: "WORK_PLACE",
        START_DATE: "START_DATE",
        DUE_DATE: "DUE_DATE",
        FINISH_DATE: "FINISH_DATE",
        DELIVERED: "DELIVERED",
    }
}

const QUERY = {
    insert: `INSERT INTO ${table.TABLE} (${table.COLUMN.ID}, ${table.COLUMN.PROJECT_ID}, ${table.COLUMN.INPUT_BY}, ${table.COLUMN.NAME}, ${table.COLUMN.DESCRIPTION}, ${table.COLUMN.PPM}, ${table.COLUMN.CAPACITY}, ${table.COLUMN.WORK_PLACE}, ${table.COLUMN.START_DATE}, ${table.COLUMN.DUE_DATE}, ${table.COLUMN.FINISH_DATE}) VALUES
        (?,?,?,?,?,?,?,?,?,?,?)`,
    update: {
        all: `UPDATE ${table.TABLE} SET 
            ${table.COLUMN.INPUT_BY} = ?, 
            ${table.COLUMN.NAME} = ?, 
            ${table.COLUMN.DESCRIPTION} = ?, 
            ${table.COLUMN.PPM} = ?, 
            ${table.COLUMN.CAPACITY} = ?, 
            ${table.COLUMN.WORK_PLACE} = ?, 
            ${table.COLUMN.START_DATE} = ?, 
            ${table.COLUMN.DUE_DATE} = ?, 
            ${table.COLUMN.FINISH_DATE} = ? 
            WHERE ${table.COLUMN.PROJECT_ID} = ?`,
        deliver: `UPDATE ${table.TABLE} SET ${table.COLUMN.DELIVERED} = TRUE WHERE ${table.COLUMN.PROJECT_ID} = ?`
    },
    delete: {
        onlyOne: `DELETE FROM ${table.TABLE} WHERE ${table.COLUMN.PROJECT_ID} = ?`
    },
    select: {
        byProjectId: `SELECT ${table.COLUMN.NAME}, ${table.COLUMN.DELIVERED}, ${table.COLUMN.DESCRIPTION}, ${table.COLUMN.PPM}, ${table.COLUMN.CAPACITY}, ${table.COLUMN.WORK_PLACE}, 
        DATE_FORMAT(${table.COLUMN.START_DATE}, '%Y-%m-%d') AS START_DATE, 
        DATE_FORMAT(${table.COLUMN.DUE_DATE}, '%Y-%m-%d') AS DUE_DATE,
        DATE_FORMAT(${table.COLUMN.FINISH_DATE}, '%Y-%m-%d') AS FINISH_DATE
        FROM ${table.TABLE} WHERE ${table.COLUMN.PROJECT_ID} = ?`,
        all: `SELECT * FROM ${table.TABLE}`
    }
}


module.exports = {
    projectDetailQuerys: QUERY,
    projectDetailTable: table
}