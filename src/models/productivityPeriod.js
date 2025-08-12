const table = {
    TABLE: 'productivity_period',
    COLUMN: {
        ID: 'ID',
        COMPANY_ID: 'COMPANY_ID',
        INPUT_DATE: 'INPUT_DATE',
        LABEL: 'LABEL',
        CUTOFF_DATE_START: 'CUTOFF_DATE_START',
        CUTOFF_DATE_FINISH: 'CUTOFF_DATE_FINISH',
    }
}

const QUERY = {
    insert: `INSERT INTO ${table.TABLE} (${table.COLUMN.ID}, ${table.COLUMN.COMPANY_ID}, ${table.COLUMN.CUTOFF_DATE_START}, ${table.COLUMN.CUTOFF_DATE_FINISH}) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE ${table.COLUMN.COMPANY_ID} = VALUES(${table.COLUMN.COMPANY_ID}), ${table.COLUMN.CUTOFF_DATE_START} = VALUES(${table.COLUMN.CUTOFF_DATE_START}), ${table.COLUMN.CUTOFF_DATE_FINISH} = VALUES(${table.COLUMN.CUTOFF_DATE_FINISH})`,
    delete: {
        onlyOne: `DELETE FROM ${table.TABLE} WHERE ${table.COLUMN.ID} = ?`
    },
    update: {
        all: `UPDATE ${table.TABLE} SET ${table.COLUMN.LABEL} = ?, ${table.COLUMN.CUTOFF_DATE_START} = ?, ${table.COLUMN.CUTOFF_DATE_FINISH} = ?, ${table.COLUMN.INPUT_DATE} = NOW() WHERE ${table.COLUMN.ID} = ?`
    },
    select: {
        all: `SELECT * FROM ${table.TABLE} WHERE ${table.COLUMN.COMPANY_ID} = ?`,
        period: `SELECT p.${table.COLUMN.ID}, DATE_FORMAT(p.${table.COLUMN.CUTOFF_DATE_START}, '%Y-%m-%d') AS CUTOFF_DATE_START, DATE_FORMAT(p.${table.COLUMN.CUTOFF_DATE_FINISH}, '%Y-%m-%d') AS CUTOFF_DATE_FINISH FROM ${table.TABLE} AS p WHERE p.${table.COLUMN.CUTOFF_DATE_START} <= ? AND p.${table.COLUMN.CUTOFF_DATE_FINISH} >= ? AND p.${table.COLUMN.COMPANY_ID} = ?`
    }
}

module.exports = {
    productivityPeriodTable: table,
    productivityPeriodQuerys: QUERY
}