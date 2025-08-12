const table = {
    TABLE: "company_preference",
    COLUMN: {
        ID: "ID",
        COMPANY_ID: "COMPANY_ID",
        CUTOFF_LABEL: "CUTOFF_LABEL",
        CUTOFF_DAY_START: "CUTOFF_DAY_START",
        CUTOFF_DAY_FINISH: "CUTOFF_DAY_FINISH",
        CUTOFF_INTERVAL: "CUTOFF_INTERVAL",
    }
}

const QUERY = {
    insert: `INSERT INTO ${table.TABLE} (${table.COLUMN.ID}, ${table.COLUMN.COMPANY_ID}, ${table.COLUMN.CUTOFF_DAY_START}, ${table.COLUMN.CUTOFF_DAY_FINISH}, ${table.COLUMN.CUTOFF_INTERVAL}) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE ${table.COLUMN.CUTOFF_DAY_START} = VALUES(${table.COLUMN.CUTOFF_DAY_START}), ${table.COLUMN.CUTOFF_DAY_FINISH} = VALUES(${table.COLUMN.CUTOFF_DAY_FINISH}), ${table.COLUMN.CUTOFF_INTERVAL} = VALUES(${table.COLUMN.CUTOFF_INTERVAL})`,
    delete: {
        onlyOne: `DELETE FROM ${table.TABLE} WHERE ${table.COLUMN.ID} = ?`
    },
    select: {
        onlyOne: `SELECT * FROM ${table.TABLE} WHERE ${table.COLUMN.COMPANY_ID} = ?`,
    }
}

module.exports = {
    companyPreferenceTable: table,
    companyPreferenceQuerys: QUERY
}