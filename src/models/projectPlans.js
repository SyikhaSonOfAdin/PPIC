const { projectDetailTable } = require("./projectDetail")
const { userTable } = require("./user")

const table = {
    TABLE: "project_plans",
    COLUMN: {
        ID: "ID",
        PROJECT_ID: "PROJECT_ID",
        INPUT_BY: "INPUT_BY",
        INPUT_DATE: "INPUT_DATE",
        PERIOD_YEAR: "PERIOD_YEAR",
        PERIOD_MONTH: "PERIOD_MONTH",
        WEEK: "WEEK",
        PERCENTAGE: "PERCENTAGE",
        AMOUNT: "AMOUNT",
    }
}

const QUERY = {
    insert: `INSERT INTO ${table.TABLE} (${table.COLUMN.ID}, ${table.COLUMN.PROJECT_ID}, ${table.COLUMN.INPUT_BY}, 
    ${table.COLUMN.PERIOD_YEAR}, ${table.COLUMN.PERIOD_MONTH}, ${table.COLUMN.WEEK}, ${table.COLUMN.PERCENTAGE}, ${table.COLUMN.AMOUNT}) VALUES (?,?,?,?,?,?,?,?)`,
    delete: {
        all: `DELETE FROM ${table.TABLE} WHERE ${table.COLUMN.PROJECT_ID} = ?`,
        onlyOne: `DELETE FROM ${table.TABLE} WHERE ${table.COLUMN.ID} = ?`,
    },
    update: {
        single: {
            all: `UPDATE ${table.TABLE} SET ${table.COLUMN.INPUT_BY} = ?, ${table.COLUMN.INPUT_DATE} = NOW(), ${table.COLUMN.PERIOD_YEAR} = ?, ${table.COLUMN.PERIOD_MONTH} = ?, ${table.COLUMN.PERCENTAGE} = ?, ${table.COLUMN.AMOUNT} = ? WHERE ${table.COLUMN.ID} = ?`
        },
        byProjectId: {
            percentage: `UPDATE ${table.TABLE} pp
            JOIN ${projectDetailTable.TABLE} p ON pp.${table.COLUMN.PROJECT_ID} = p.${projectDetailTable.COLUMN.PROJECT_ID}
            SET pp.${table.COLUMN.AMOUNT} = (pp.${table.COLUMN.PERCENTAGE} / 100) * p.${projectDetailTable.COLUMN.CAPACITY} WHERE p.${projectDetailTable.COLUMN.PROJECT_ID} = ?`
        }
    },
    select: {
        all: `SELECT PP.${table.COLUMN.ID}, 
            U.${userTable.COLUMN.USERNAME} AS INPUT_BY,
            DATE_FORMAT(PP.${table.COLUMN.INPUT_DATE}, '%Y-%m-%d') AS INPUT_DATE, 
            PP.${table.COLUMN.PERIOD_YEAR},
            DATE_FORMAT(PP.${table.COLUMN.PERIOD_MONTH}, '%m-%d') AS PERIOD_MONTH,
            PP.${table.COLUMN.WEEK},
            PP.${table.COLUMN.PERCENTAGE},
            PP.${table.COLUMN.AMOUNT} 
            FROM ${table.TABLE} AS PP
            JOIN ${userTable.TABLE} AS U ON PP.${table.COLUMN.INPUT_BY} = U.${userTable.COLUMN.ID} 
            WHERE PP.${table.COLUMN.PROJECT_ID} = ?`,        
        data: `SELECT DATE_FORMAT(${table.COLUMN.PERIOD_MONTH}, '%Y-%m-%d') AS PERIOD_MONTH, ${table.COLUMN.AMOUNT} FROM ${table.TABLE} WHERE ${table.COLUMN.PROJECT_ID} = ? AND YEAR(${table.COLUMN.PERIOD_MONTH}) = ?  ORDER BY ${table.COLUMN.PERIOD_MONTH} ASC`,
        rowsData: `SELECT COUNT(p.${table.COLUMN.ID}) AS NUMBER_OF_ROWS FROM ${table.TABLE} AS p WHERE p.${table.COLUMN.PROJECT_ID} = ?`
    }
}

module.exports = {
    plansQuerys: QUERY,
    plansTable: table
}