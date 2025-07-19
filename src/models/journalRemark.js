const { companyTable } = require("./company")
const { departmentTable } = require("./department")
const { projectTable } = require("./project")
const { projectDetailTable } = require("./projectDetail")
const { userTable } = require("./user")

const table = {
    TABLE: "project_remark",
    COLUMN: {
        ID: "ID",
        PROJECT_ID: "PROJECT_ID",
        INPUT_BY: "INPUT_BY",
        DEPARTMENT_ID: "DEPARTMENT_ID",
        INPUT_DATE: "INPUT_DATE",
        DEADLINE: "DEADLINE",
        DESCRIPTION: "DESCRIPTION",
        SOLUTION: "SOLUTION",
        STATUS: "STATUS",
    }
}

const QUERY = {
    insert: `INSERT INTO ${table.TABLE} (${table.COLUMN.ID}, ${table.COLUMN.PROJECT_ID}, ${table.COLUMN.INPUT_BY}, 
    ${table.COLUMN.DESCRIPTION}, ${table.COLUMN.SOLUTION}, ${table.COLUMN.DEADLINE}, ${table.COLUMN.DEPARTMENT_ID}
    , ${table.COLUMN.STATUS}) 
    VALUES (?,?,?,?,?,?,?,?)`,
    delete: {
        all: `DELETE FROM ${table.TABLE} WHERE ${table.COLUMN.PROJECT_ID} = ?`,
        onlyOne: `DELETE FROM ${table.TABLE} WHERE ${table.COLUMN.ID} = ?`
    },
    update: `UPDATE ${table.TABLE} 
    SET ${table.COLUMN.INPUT_BY} = ?, ${table.COLUMN.INPUT_DATE} = NOW(), ${table.COLUMN.DESCRIPTION} = ?, ${table.COLUMN.SOLUTION} = ? 
    , ${table.COLUMN.DEADLINE} = ?, ${table.COLUMN.DEPARTMENT_ID} = ?, ${table.COLUMN.STATUS} = ?
    WHERE ${table.COLUMN.ID} = ?`,
    select: {
        onlyOne: `SELECT 
        PR.${table.COLUMN.ID}, 
        PR.${table.COLUMN.STATUS},
        U.${userTable.COLUMN.USERNAME} AS INPUT_BY, 
        D.${departmentTable.COLUMN.NAME} AS DEPARTMENT_NAME, 
        D.${departmentTable.COLUMN.ID} AS DEPARTMENT_ID, 
        (
            SELECT
            GROUP_CONCAT(${userTable.COLUMN.USERNAME}
            ORDER BY ${userTable.COLUMN.ID}
            SEPARATOR ', '
            )
            FROM ${userTable.TABLE}
            WHERE ${userTable.COLUMN.DEPARTMENT_ID} = PR.${table.COLUMN.DEPARTMENT_ID}
        ) AS PIC,
        DATE_FORMAT(PR.${table.COLUMN.INPUT_DATE}, '%Y-%m-%d') AS INPUT_DATE, 
        DATE_FORMAT(PR.${table.COLUMN.DEADLINE}, '%Y-%m-%d') AS DEADLINE, 
        PR.${table.COLUMN.SOLUTION},
        PR.${table.COLUMN.DESCRIPTION} 
        FROM ${table.TABLE} AS PR 
        JOIN ${userTable.TABLE} AS U ON PR.${table.COLUMN.INPUT_BY} = U.${userTable.COLUMN.ID} 
        LEFT JOIN ${departmentTable.TABLE} AS D ON PR.${table.COLUMN.DEPARTMENT_ID} = D.${departmentTable.COLUMN.ID}
        WHERE PR.${table.COLUMN.PROJECT_ID} = ?`,
        all: {
            forReport: `SELECT 
            PR.${table.COLUMN.ID}, 
            PR.${table.COLUMN.PROJECT_ID},
            U.${userTable.COLUMN.USERNAME} AS INPUT_BY, 
            DATE_FORMAT(PR.${table.COLUMN.INPUT_DATE}, '%Y-%m-%d') AS INPUT_DATE, 
            PR.${table.COLUMN.DESCRIPTION} 
            FROM ${table.TABLE} AS PR 
            JOIN ${projectTable.TABLE} AS P ON PR.${table.COLUMN.PROJECT_ID} = P.${projectTable.COLUMN.ID}
            JOIN ${companyTable.TABLE} AS C ON P.${projectTable.COLUMN.COMPANY_ID} = C.${companyTable.COLUMN.ID}
            JOIN ${userTable.TABLE} AS U ON PR.${table.COLUMN.INPUT_BY} = U.${userTable.COLUMN.ID}
            WHERE C.${companyTable.COLUMN.ID} = ?`,
            all: `SELECT 
            P.${table.COLUMN.ID}, 
            PR.${table.COLUMN.STATUS},
            PD.${projectDetailTable.COLUMN.NAME},
            P.${projectTable.COLUMN.PROJECT_NO},
            U.${userTable.COLUMN.USERNAME} AS INPUT_BY, 
            D.${departmentTable.COLUMN.NAME} AS DEPARTMENT_NAME,
            (
                SELECT
                GROUP_CONCAT(${userTable.COLUMN.USERNAME}
                ORDER BY ${userTable.COLUMN.ID}
                SEPARATOR ', '
                )
                FROM ${userTable.TABLE}
                WHERE ${userTable.COLUMN.DEPARTMENT_ID} = PR.${table.COLUMN.DEPARTMENT_ID}
            ) AS PIC,
             CASE 
            WHEN PD.${projectDetailTable.COLUMN.FINISH_DATE} IS NULL OR PD.${projectDetailTable.COLUMN.FINISH_DATE} = "0000-00-00" THEN 'On Going'
            WHEN DATEDIFF(PD.${projectDetailTable.COLUMN.FINISH_DATE}, PD.${projectDetailTable.COLUMN.DUE_DATE}) < 0 THEN 'Ahead'
            WHEN DATEDIFF(PD.${projectDetailTable.COLUMN.FINISH_DATE}, PD.${projectDetailTable.COLUMN.DUE_DATE}) = 0 THEN 'On Time'
            WHEN DATEDIFF(PD.${projectDetailTable.COLUMN.FINISH_DATE}, PD.${projectDetailTable.COLUMN.DUE_DATE}) > 0 THEN 'Delayed'
            END AS PROJECT_STATUS,
            CASE 
            WHEN PD.${projectDetailTable.COLUMN.FINISH_DATE}  IS NULL OR PD.${projectDetailTable.COLUMN.FINISH_DATE}  = '0000-00-00' THEN NULL
            ELSE DATEDIFF(PD.${projectDetailTable.COLUMN.FINISH_DATE}, PD.${projectDetailTable.COLUMN.DUE_DATE})
            END AS DAYS,
            DATE_FORMAT(PR.${table.COLUMN.INPUT_DATE}, '%Y-%m-%d') AS INPUT_DATE, 
            DATE_FORMAT(PR.${table.COLUMN.DEADLINE}, '%Y-%m-%d') AS DEADLINE, 
            PR.${table.COLUMN.SOLUTION},
            PR.${table.COLUMN.DESCRIPTION} 
            FROM ${table.TABLE} AS PR 
            JOIN ${projectTable.TABLE} AS P ON PR.${table.COLUMN.PROJECT_ID} = P.${projectTable.COLUMN.ID}
            JOIN ${projectDetailTable.TABLE} AS PD ON P.${projectTable.COLUMN.ID} = PD.${projectDetailTable.COLUMN.PROJECT_ID}
            JOIN ${userTable.TABLE} AS U ON PR.${table.COLUMN.INPUT_BY} = U.${userTable.COLUMN.ID} 
            LEFT JOIN ${departmentTable.TABLE} AS D ON PR.${table.COLUMN.DEPARTMENT_ID} = D.${departmentTable.COLUMN.ID}
            WHERE P.${projectTable.COLUMN.COMPANY_ID} = ?            
            AND (
                P.${projectTable.COLUMN.PROJECT_NO} LIKE ?
                OR P.${projectTable.COLUMN.CLIENT} LIKE ?
                OR PD.${projectDetailTable.COLUMN.DESCRIPTION} LIKE ?
                OR PD.${projectDetailTable.COLUMN.NAME} LIKE ?
                OR PD.${projectDetailTable.COLUMN.PPM} LIKE ?
                OR PD.${projectDetailTable.COLUMN.WORK_PLACE} LIKE ?
                OR D.${departmentTable.COLUMN.NAME} LIKE ?
                ) 
            ORDER BY P.${projectTable.COLUMN.ID} ASC
            `,
        },
    }
}

module.exports = {
    remarkQuerys: QUERY,
    remarkTable: table
}