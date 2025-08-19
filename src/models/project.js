const { productivityPeriodTable } = require("./productivityPeriod")
const { projectDetailTable } = require("./projectDetail")
const { categoryTable } = require("./category")
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
            PD.${projectDetailTable.COLUMN.DELIVERED}, 
            PD.${projectDetailTable.COLUMN.DESCRIPTION}, 
            PD.${projectDetailTable.COLUMN.PPM}, 
            C.${categoryTable.COLUMN.ID} AS CATEGORY_ID,  
            C.${categoryTable.COLUMN.UOM}, 
            PD.${projectDetailTable.COLUMN.CAPACITY}, 
            PD.${projectDetailTable.COLUMN.WORK_PLACE}, 
            DATE_FORMAT(PD.${projectDetailTable.COLUMN.START_DATE}, '%Y-%m-%d') AS START_DATE, 
            DATE_FORMAT(PD.${projectDetailTable.COLUMN.DUE_DATE}, '%Y-%m-%d') AS DUE_DATE, 
            DATE_FORMAT(PD.${projectDetailTable.COLUMN.FINISH_DATE}, '%Y-%m-%d') AS FINISH_DATE,
            CASE 
            WHEN ${projectDetailTable.COLUMN.FINISH_DATE} IS NULL OR ${projectDetailTable.COLUMN.FINISH_DATE} = "0000-00-00" THEN 'On Going'
            WHEN DATEDIFF(${projectDetailTable.COLUMN.FINISH_DATE}, ${projectDetailTable.COLUMN.DUE_DATE}) < 0 THEN 'Ahead'
            WHEN DATEDIFF(${projectDetailTable.COLUMN.FINISH_DATE}, ${projectDetailTable.COLUMN.DUE_DATE}) = 0 THEN 'On Time'
            WHEN DATEDIFF(${projectDetailTable.COLUMN.FINISH_DATE}, ${projectDetailTable.COLUMN.DUE_DATE}) > 0 THEN 'Delayed'
            END AS STATUS,
            CASE 
            WHEN ${projectDetailTable.COLUMN.FINISH_DATE}  IS NULL OR ${projectDetailTable.COLUMN.FINISH_DATE}  = '0000-00-00' THEN NULL
            ELSE DATEDIFF(${projectDetailTable.COLUMN.FINISH_DATE}, ${projectDetailTable.COLUMN.DUE_DATE})
            END AS DAYS
            FROM ${table.TABLE} AS CP
            JOIN  ${categoryTable.TABLE} AS C ON CP.${table.COLUMN.CATEGORY_ID} = C.${categoryTable.COLUMN.ID}
            JOIN  ${projectDetailTable.TABLE} AS PD  ON CP.${table.COLUMN.ID} = PD.${projectDetailTable.COLUMN.PROJECT_ID}
            JOIN  ${userTable.TABLE} AS U  ON CP.${table.COLUMN.INPUT_BY} = U.${userTable.COLUMN.ID}
            WHERE CP.${table.COLUMN.COMPANY_ID} = ?
            AND (
            CP.${table.COLUMN.PROJECT_NO} LIKE ?
            OR CP.${table.COLUMN.CLIENT} LIKE ?
            OR PD.${projectDetailTable.COLUMN.DESCRIPTION} LIKE ?
            OR PD.${projectDetailTable.COLUMN.NAME} LIKE ?
            OR PD.${projectDetailTable.COLUMN.PPM} LIKE ?
            OR PD.${projectDetailTable.COLUMN.WORK_PLACE} LIKE ?
            OR PD.${projectDetailTable.COLUMN.CAPACITY} LIKE ?
            OR PD.${projectDetailTable.COLUMN.START_DATE} LIKE ?
            OR PD.${projectDetailTable.COLUMN.DUE_DATE} LIKE ?
            OR PD.${projectDetailTable.COLUMN.FINISH_DATE} LIKE ?
            ) 
            ORDER BY CP.${table.COLUMN.ID} ASC`,
        onlyOne: `SELECT CP.${table.COLUMN.ID}, CP.${table.COLUMN.COMPANY_ID}, CP.${table.COLUMN.PROJECT_NO}, CP.${table.COLUMN.CLIENT}, U.${userTable.COLUMN.USERNAME} AS INPUT_BY, DATE_FORMAT(CP.${table.COLUMN.INPUT_DATE}, '%Y-%m-%d') AS INPUT_DATE, C.${categoryTable.COLUMN.ID} AS CATEGORY_ID, C.${categoryTable.COLUMN.UOM}, C.${categoryTable.COLUMN.NAME} AS CATEGORY_NAME FROM ${table.TABLE} AS CP JOIN ${categoryTable.TABLE} AS C ON CP.${table.COLUMN.CATEGORY_ID} = C.${categoryTable.COLUMN.ID} JOIN ${userTable.TABLE} AS U ON CP.${table.COLUMN.INPUT_BY} = U.${userTable.COLUMN.ID} WHERE CP.${table.COLUMN.ID} = ?`,
        byCatgoeryId: `SELECT CP.* FROM ${table.TABLE} AS CP JOIN ${categoryTable.TABLE} AS C ON CP.${table.COLUMN.CATEGORY_ID} = C.${categoryTable.COLUMN.ID} WHERE C.${categoryTable.COLUMN.ID} = ?`,
        by: {
            periodId: `SELECT DISTINCT CP.* FROM ${table.TABLE} AS CP
            JOIN project_productivity AS PP ON CP.${table.COLUMN.ID} = PP.PROJECT_ID
            JOIN ${productivityPeriodTable.TABLE} AS P ON PP.PERIOD_ID = P.${productivityPeriodTable.COLUMN.ID}
            WHERE P.${productivityPeriodTable.COLUMN.ID} = ?`,
        }
    }
}

module.exports = {
    projectTable: table,
    projectQuerys: QUERY
}