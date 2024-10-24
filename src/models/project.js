const { categoryTable } = require("./category")
const { projectDetailTable } = require("./projectDetail")
const { userTable } = require("./user")

const table = {
    TABLE: "company_projects",
    COLUMN: {
        ID: "ID",
        COMPANY_ID: "COMPANY_ID",
        CATEGORY_ID: "CATEGORY_ID",
        INPUT_BY: "INPUT_BY",
        INPUT_DATE: "INPUT_DATE",
        PROJECT_NO: "PROJECT_NO",
        CLIENT: "CLIENT",
    }
}

const QUERY = {
    insert: `INSERT INTO ${table.TABLE} (${table.COLUMN.ID}, ${table.COLUMN.COMPANY_ID}, ${table.COLUMN.CATEGORY_ID}, ${table.COLUMN.PROJECT_NO}, ${table.COLUMN.CLIENT}, ${table.COLUMN.INPUT_BY}) VALUES (?,?,?,?,?,?)`,
    delete: {
        onlyOne: `DELETE FROM ${table.TABLE} WHERE ${table.COLUMN.ID} = ?`
    },
    update: {
        all: `UPDATE ${table.TABLE} SET ${table.COLUMN.CATEGORY_ID} = ?, ${table.COLUMN.PROJECT_NO} = ?, ${table.COLUMN.CLIENT} = ?, ${table.COLUMN.INPUT_BY} = ?, ${table.COLUMN.INPUT_DATE} = NOW() WHERE ${table.COLUMN.ID} = ?`
    },
    select: {
        all: `SELECT 
    CP.${table.COLUMN.ID}, 
    CP.${table.COLUMN.PROJECT_NO}, 
    CP.${table.COLUMN.CLIENT}, 
    PD.${projectDetailTable.COLUMN.NAME}, 
    PD.${projectDetailTable.COLUMN.DESCRIPTION}, 
    PD.${projectDetailTable.COLUMN.PPM}, 
    C.${categoryTable.COLUMN.UOM}, 
    PD.${projectDetailTable.COLUMN.CAPACITY}, 
    PD.${projectDetailTable.COLUMN.WORK_PLACE}, 
    DATE_FORMAT(PD.${projectDetailTable.COLUMN.START_DATE}, '%Y-%m-%d') AS START_DATE, 
    DATE_FORMAT(PD.${projectDetailTable.COLUMN.DUE_DATE}, '%Y-%m-%d') AS DUE_DATE, 
    DATE_FORMAT(PD.${projectDetailTable.COLUMN.FINISH_DATE}, '%Y-%m-%d') AS FINISH_DATE
FROM 
    ${table.TABLE} AS CP
JOIN  ${categoryTable.TABLE} AS C ON CP.${table.COLUMN.CATEGORY_ID} = C.${categoryTable.COLUMN.ID}
JOIN  ${projectDetailTable.TABLE} AS PD  ON CP.${table.COLUMN.ID} = PD.${projectDetailTable.COLUMN.PROJECT_ID}
JOIN  ${userTable.TABLE} AS U  ON CP.${table.COLUMN.INPUT_BY} = U.${userTable.COLUMN.ID}
WHERE CP.${table.COLUMN.COMPANY_ID} = ? ORDER BY CP.${table.COLUMN.ID} ASC ;
`,
        onlyOne: `SELECT CP.${table.COLUMN.ID}, CP.${table.COLUMN.PROJECT_NO}, CP.${table.COLUMN.CLIENT}, U.${userTable.COLUMN.USERNAME} AS INPUT_BY, DATE_FORMAT(CP.${table.COLUMN.INPUT_DATE}, '%Y-%m-%d') AS INPUT_DATE, C.${categoryTable.COLUMN.UOM}, C.${categoryTable.COLUMN.NAME} AS CATEGORY_NAME FROM ${table.TABLE} AS CP JOIN ${categoryTable.TABLE} AS C ON CP.${table.COLUMN.CATEGORY_ID} = C.${categoryTable.COLUMN.ID} JOIN ${userTable.TABLE} AS U ON CP.${table.COLUMN.INPUT_BY} = U.${userTable.COLUMN.ID} WHERE CP.${table.COLUMN.ID} = ?`,
        byCatgoeryId: `SELECT CP.* FROM ${table.TABLE} AS CP JOIN ${categoryTable.TABLE} AS C ON CP.${table.COLUMN.CATEGORY_ID} = C.${categoryTable.COLUMN.ID} WHERE C.${categoryTable.COLUMN.ID} = ?`
    }
}

module.exports = {
    projectTable: table,
    projectQuerys: QUERY
}