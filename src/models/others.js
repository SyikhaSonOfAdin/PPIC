const { projectTable } = require("./project")
const { projectDetailTable } = require("./projectDetail")

const QUERY = {
    select: {
        distinct: {
            period: {
                year: `SELECT DISTINCT PERIOD_YEAR 
                        FROM project_plans AS PP
                        JOIN company_projects AS CP ON CP.ID = PP.PROJECT_ID
                        WHERE CP.COMPANY_ID = ?
                        UNION
                        SELECT DISTINCT PERIOD_YEAR 
                        FROM project_actual AS PA
                        JOIN company_projects AS CP ON CP.ID = PA.PROJECT_ID
                        WHERE CP.COMPANY_ID = ? ORDER BY PERIOD_YEAR DESC`
            }
        },
        project: {
            start_date: {
                earliest: `SELECT PD.${projectDetailTable.COLUMN.START_DATE} FROM ${projectTable.TABLE} AS CP
                            JOIN ${projectDetailTable.TABLE} AS PD ON CP.${projectTable.COLUMN.ID} = PD.${projectDetailTable.COLUMN.PROJECT_ID}
                            WHERE CP.${projectTable.COLUMN.COMPANY_ID} = ?
                            ORDER BY PD.${projectDetailTable.COLUMN.START_DATE} ASC LIMIT 1`
            },
            due_date: {
                latest: `SELECT PD.${projectDetailTable.COLUMN.DUE_DATE} FROM ${projectTable.TABLE} AS CP
                            JOIN ${projectDetailTable.TABLE} AS PD ON CP.${projectTable.COLUMN.ID} = PD.${projectDetailTable.COLUMN.PROJECT_ID}
                            WHERE CP.${projectTable.COLUMN.COMPANY_ID} = ?
                            ORDER BY PD.${projectDetailTable.COLUMN.DUE_DATE} DESC LIMIT 1`
            },
        },
        actual: {
            by: {
                period: {
                    month: `SELECT PA.PROJECT_ID, 
	                        CP.PROJECT_NO, 
                            PC.NAME AS CATEGORY, 
	                        SUM(PA.AMOUNT) AS TOTAL_AMOUNT_ACTUAL,
                            PC.UOM,
                            YEAR(PA.PERIOD_YEAR) AS YEAR,
	                        MONTHNAME(PA.PERIOD_MONTH) AS MONTH
                            FROM project_actual AS PA 
                            JOIN company_projects AS CP ON PA.PROJECT_ID = CP.ID
                            JOIN project_category AS PC ON CP.CATEGORY_ID = PC.ID 
                            WHERE 
                            CP.COMPANY_ID = ?
                            AND YEAR(PA.PERIOD_YEAR) = ?
                            AND MONTH(PA.PERIOD_MONTH) BETWEEN ? AND ?
                            GROUP BY 
                            PA.PROJECT_ID,
                            CP.PROJECT_NO,
                            PC.NAME,
                            PC.UOM,
                            YEAR(PA.PERIOD_YEAR),
                            MONTH(PA.PERIOD_MONTH)
                            ORDER BY PA.PROJECT_ID, MONTH(PA.PERIOD_MONTH)`
                }
            }
        },
        plan: {
            by: {
                period: {
                    month: `SELECT PA.PROJECT_ID, 
	                        CP.PROJECT_NO, 
                            PC.NAME AS CATEGORY, 
	                        SUM(PA.AMOUNT) AS TOTAL_AMOUNT_PLAN,
                            PC.UOM,
                            YEAR(PA.PERIOD_YEAR) AS YEAR,
	                        MONTHNAME(PA.PERIOD_MONTH) AS MONTH
                            FROM project_plans AS PA 
                            JOIN company_projects AS CP ON PA.PROJECT_ID = CP.ID
                            JOIN project_category AS PC ON CP.CATEGORY_ID = PC.ID 
                            WHERE 
                            CP.COMPANY_ID = ?
                            AND YEAR(PA.PERIOD_YEAR) = ?
                            AND MONTH(PA.PERIOD_MONTH) BETWEEN ? AND ?
                            GROUP BY 
                            PA.PROJECT_ID,
                            CP.PROJECT_NO,
                            PC.NAME,
                            PC.UOM,
                            YEAR(PA.PERIOD_YEAR),
                            MONTH(PA.PERIOD_MONTH)
                            ORDER BY PA.PROJECT_ID, MONTH(PA.PERIOD_MONTH)`
                }
            }
        },

    }
}

module.exports = {
    othersQuerys: QUERY
}