const table = {
  TABLE: "extensions",
  COLUMN: {
    ID: "ID",
    COMPANY_ID: "COMPANY_ID",
    NAME: "NAME",
    DESCRIPTION: "DESCRIPTION",
    ENABLED: "ENABLED",
    ENDPOINT_URL: "ENDPOINT_URL",
    HTTP_METHOD: "HTTP_METHOD",
    AUTH_TYPE: "AUTH_TYPE",
    AUTH_CONFIG: "AUTH_CONFIG",
    REQUEST_HEADERS: "REQUEST_HEADERS",
    REQUEST_BODY_TEMPLATE: "REQUEST_BODY_TEMPLATE",
    QUERY_PARAMS_CONFIG: "QUERY_PARAMS_CONFIG",
    RESPONSE_PATH: "RESPONSE_PATH",
    SCHEMA_MAPPING: "SCHEMA_MAPPING",
    DISPLAY_TYPE: "DISPLAY_TYPE",
    DISPLAY_CONFIG: "DISPLAY_CONFIG",
    REFRESH_INTERVAL: "REFRESH_INTERVAL",
    LAST_SYNC: "LAST_SYNC",
    CREATED_BY: "CREATED_BY",
    CREATED_AT: "CREATED_AT",
    UPDATED_AT: "UPDATED_AT",
  }
};

const QUERY = {
  insert: `INSERT INTO ${table.TABLE} (
    ${table.COLUMN.ID},
    ${table.COLUMN.COMPANY_ID},
    ${table.COLUMN.NAME},
    ${table.COLUMN.DESCRIPTION},
    ${table.COLUMN.ENDPOINT_URL},
    ${table.COLUMN.HTTP_METHOD},
    ${table.COLUMN.AUTH_TYPE},
    ${table.COLUMN.AUTH_CONFIG},
    ${table.COLUMN.REQUEST_HEADERS},
    ${table.COLUMN.DISPLAY_TYPE},
    ${table.COLUMN.DISPLAY_CONFIG},
    ${table.COLUMN.REFRESH_INTERVAL},
    ${table.COLUMN.CREATED_BY}
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

  update: `UPDATE ${table.TABLE} SET
    ${table.COLUMN.NAME} = ?,
    ${table.COLUMN.DESCRIPTION} = ?,
    ${table.COLUMN.ENDPOINT_URL} = ?,
    ${table.COLUMN.HTTP_METHOD} = ?,
    ${table.COLUMN.AUTH_TYPE} = ?,
    ${table.COLUMN.AUTH_CONFIG} = ?,
    ${table.COLUMN.REQUEST_HEADERS} = ?,
    ${table.COLUMN.DISPLAY_TYPE} = ?,
    ${table.COLUMN.DISPLAY_CONFIG} = ?,
    ${table.COLUMN.REFRESH_INTERVAL} = ?
  WHERE ${table.COLUMN.ID} = ? AND ${table.COLUMN.COMPANY_ID} = ?`,

  updateSync: `UPDATE ${table.TABLE} SET
    ${table.COLUMN.LAST_SYNC} = NOW()
  WHERE ${table.COLUMN.ID} = ?`,

  delete: `DELETE FROM ${table.TABLE} WHERE ${table.COLUMN.ID} = ? AND ${table.COLUMN.COMPANY_ID} = ?`,

  select: {
    all: `SELECT * FROM ${table.TABLE} WHERE ${table.COLUMN.COMPANY_ID} = ? ORDER BY ${table.COLUMN.CREATED_AT} DESC`,
    byId: `SELECT * FROM ${table.TABLE} WHERE ${table.COLUMN.ID} = ? AND ${table.COLUMN.COMPANY_ID} = ?`,
    enabled: `SELECT * FROM ${table.TABLE} WHERE ${table.COLUMN.COMPANY_ID} = ? AND ${table.COLUMN.ENABLED} = 1 ORDER BY ${table.COLUMN.CREATED_AT} DESC`,
    byType: `SELECT * FROM ${table.TABLE} WHERE ${table.COLUMN.COMPANY_ID} = ? AND ${table.COLUMN.DISPLAY_TYPE} = ? AND ${table.COLUMN.ENABLED} = 1 ORDER BY ${table.COLUMN.NAME} ASC`,
  }
};

const dataTable = {
  TABLE: "extension_data",
  COLUMN: {
    ID: "ID",
    EXTENSION_ID: "EXTENSION_ID",
    PROJECT_ID: "PROJECT_ID",
    RAW_DATA: "RAW_DATA",
    TRANSFORMED_DATA: "TRANSFORMED_DATA",
    FETCHED_AT: "FETCHED_AT",
  }
};

const DATA_QUERY = {
  insert: `INSERT INTO ${dataTable.TABLE} (
    ${dataTable.COLUMN.ID},
    ${dataTable.COLUMN.EXTENSION_ID},
    ${dataTable.COLUMN.PROJECT_ID},
    ${dataTable.COLUMN.RAW_DATA},
    ${dataTable.COLUMN.TRANSFORMED_DATA}
  ) VALUES (?, ?, ?, ?, ?)`,

  select: {
    latest: `SELECT * FROM ${dataTable.TABLE} 
      WHERE ${dataTable.COLUMN.EXTENSION_ID} = ? 
      AND (${dataTable.COLUMN.PROJECT_ID} = ? OR ${dataTable.COLUMN.PROJECT_ID} IS NULL)
      ORDER BY ${dataTable.COLUMN.FETCHED_AT} DESC LIMIT 1`,
  },

  deleteByExtension: `DELETE FROM ${dataTable.TABLE} WHERE ${dataTable.COLUMN.EXTENSION_ID} = ?`,
};

module.exports = {
  extensionsTable: table,
  extensionsQuerys: QUERY,
  extensionDataTable: dataTable,
  extensionDataQuerys: DATA_QUERY,
};
