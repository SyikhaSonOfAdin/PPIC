import { PoolConnection } from "mysql2/promise";
import { PPIC } from "../config/db";
import { v7 } from "uuid";
import { extensionsQuerys, extensionDataQuerys } from "../models/extensions";
import { encrypt, decrypt } from "../utils/crypto";

const VALID_HTTP_METHODS = ["GET", "POST"];
const VALID_AUTH_TYPES = ["none", "bearer", "api-key", "basic"];
const VALID_DISPLAY_TYPES = ["page", "project-tab", "dashboard-widget"];

export const extensionsServices = {
  getProjectContext: async (projectId: string, connection?: PoolConnection) => {
    const CONNECTION: PoolConnection = connection || await PPIC.getConnection();
    try {
      const [rows]: any = await CONNECTION.query(
        `SELECT 
          CP.PROJECT_NO, 
          PD.NAME AS PROJECT_NAME, 
          PD.SPK 
        FROM company_projects CP
        LEFT JOIN project_detail PD ON CP.ID = PD.PROJECT_ID
        WHERE CP.ID = ?`,
        [projectId]
      );
      if (rows.length === 0) return null;
      return rows[0];
    } catch (error) {
      throw error;
    } finally {
      if (!connection && CONNECTION) {
        CONNECTION.release();
      }
    }
  },

  getCompanyContext: async (companyId: string, connection?: PoolConnection) => {
    const CONNECTION: PoolConnection = connection || await PPIC.getConnection();
    try {
      const [rows]: any = await CONNECTION.query(
        `SELECT NAME FROM company WHERE ID = ?`,
        [companyId]
      );
      if (rows.length === 0) return null;
      return rows[0];
    } catch (error) {
      throw error;
    } finally {
      if (!connection && CONNECTION) {
        CONNECTION.release();
      }
    }
  },

  create: async (
    companyId: string,
    name: string,
    description: string,
    endpointUrl: string,
    httpMethod: string,
    authType: string,
    authConfig: any,
    requestHeaders: any,
    displayType: string,
    displayConfig: any,
    refreshInterval: number | null,
    createdBy: string,
    responsePath?: string,
    schemaMapping?: any,
    queryParamsConfig?: any,
    connection?: PoolConnection,
  ) => {
    const CONNECTION: PoolConnection =
      connection || (await PPIC.getConnection());
    try {
      if (!VALID_HTTP_METHODS.includes(httpMethod)) {
        throw new Error("Invalid HTTP method");
      }
      if (!VALID_AUTH_TYPES.includes(authType)) {
        throw new Error("Invalid auth type");
      }
      if (!VALID_DISPLAY_TYPES.includes(displayType)) {
        throw new Error("Invalid display type");
      }

      const id = v7();
      const encryptedAuth = authConfig
        ? encrypt(JSON.stringify(authConfig))
        : null;

      const insertQuery = `INSERT INTO extensions (
        ID, COMPANY_ID, NAME, DESCRIPTION, ENDPOINT_URL, HTTP_METHOD,
        AUTH_TYPE, AUTH_CONFIG, REQUEST_HEADERS, QUERY_PARAMS_CONFIG,
        RESPONSE_PATH, SCHEMA_MAPPING, DISPLAY_TYPE, DISPLAY_CONFIG, 
        REFRESH_INTERVAL, CREATED_BY
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      await CONNECTION.query(insertQuery, [
        id,
        companyId,
        name,
        description,
        endpointUrl,
        httpMethod,
        authType,
        encryptedAuth,
        JSON.stringify(requestHeaders || {}),
        JSON.stringify(queryParamsConfig || {}),
        responsePath || "$",
        JSON.stringify(schemaMapping || {}),
        displayType,
        JSON.stringify(displayConfig),
        refreshInterval,
        createdBy,
      ]);

      if (!connection) await CONNECTION.commit();
      return id;
    } catch (error) {
      throw error;
    } finally {
      if (!connection && CONNECTION) {
        CONNECTION.release();
      }
    }
  },

  update: async (
    extensionId: string,
    companyId: string,
    name: string,
    description: string,
    endpointUrl: string,
    httpMethod: string,
    authType: string,
    authConfig: any,
    requestHeaders: any,
    displayType: string,
    displayConfig: any,
    refreshInterval: number | null,
    responsePath?: string,
    schemaMapping?: any,
    queryParamsConfig?: any,
    connection?: PoolConnection,
  ) => {
    const CONNECTION: PoolConnection =
      connection || (await PPIC.getConnection());
    try {
      const encryptedAuth = authConfig
        ? encrypt(JSON.stringify(authConfig))
        : null;

      const updateQuery = `UPDATE extensions SET
        NAME = ?, DESCRIPTION = ?, ENDPOINT_URL = ?, HTTP_METHOD = ?,
        AUTH_TYPE = ?, AUTH_CONFIG = ?, REQUEST_HEADERS = ?,
        QUERY_PARAMS_CONFIG = ?, RESPONSE_PATH = ?, SCHEMA_MAPPING = ?,
        DISPLAY_TYPE = ?, DISPLAY_CONFIG = ?, REFRESH_INTERVAL = ?
      WHERE ID = ? AND COMPANY_ID = ?`;

      await CONNECTION.query(updateQuery, [
        name,
        description,
        endpointUrl,
        httpMethod,
        authType,
        encryptedAuth,
        JSON.stringify(requestHeaders || {}),
        JSON.stringify(queryParamsConfig || {}),
        responsePath || "$",
        JSON.stringify(schemaMapping || {}),
        displayType,
        JSON.stringify(displayConfig),
        refreshInterval,
        extensionId,
        companyId,
      ]);

      if (!connection) await CONNECTION.commit();
    } catch (error) {
      throw error;
    } finally {
      if (!connection && CONNECTION) {
        CONNECTION.release();
      }
    }
  },

  delete: async (
    extensionId: string,
    companyId: string,
    connection?: PoolConnection,
  ) => {
    const CONNECTION: PoolConnection =
      connection || (await PPIC.getConnection());
    try {
      await CONNECTION.query(extensionsQuerys.delete, [extensionId, companyId]);
      if (!connection) await CONNECTION.commit();
    } catch (error) {
      throw error;
    } finally {
      if (!connection && CONNECTION) {
        CONNECTION.release();
      }
    }
  },

  get: {
    all: async (companyId: string, connection?: PoolConnection) => {
      const CONNECTION: PoolConnection =
        connection || (await PPIC.getConnection());
      try {
        const [rows]: any = await CONNECTION.query(
          extensionsQuerys.select.all,
          [companyId],
        );
        return rows.map((row: any) => ({
          ...row,
          AUTH_CONFIG: undefined,
          REQUEST_HEADERS: row.REQUEST_HEADERS
            ? JSON.parse(row.REQUEST_HEADERS)
            : {},
          QUERY_PARAMS_CONFIG: row.QUERY_PARAMS_CONFIG
            ? JSON.parse(row.QUERY_PARAMS_CONFIG)
            : {},
          DISPLAY_CONFIG: row.DISPLAY_CONFIG
            ? JSON.parse(row.DISPLAY_CONFIG)
            : {},
          SCHEMA_MAPPING: row.SCHEMA_MAPPING
            ? JSON.parse(row.SCHEMA_MAPPING)
            : null,
        }));
      } catch (error) {
        throw error;
      } finally {
        if (!connection && CONNECTION) {
          CONNECTION.release();
        }
      }
    },

    byId: async (
      extensionId: string,
      companyId: string,
      connection?: PoolConnection,
    ) => {
      const CONNECTION: PoolConnection =
        connection || (await PPIC.getConnection());
      try {
        const [rows]: any = await CONNECTION.query(
          extensionsQuerys.select.byId,
          [extensionId, companyId],
        );
        if (rows.length === 0) return null;

        const row = rows[0];
        return {
          ...row,
          AUTH_CONFIG: undefined,
          REQUEST_HEADERS: row.REQUEST_HEADERS
            ? JSON.parse(row.REQUEST_HEADERS)
            : {},
          QUERY_PARAMS_CONFIG: row.QUERY_PARAMS_CONFIG
            ? JSON.parse(row.QUERY_PARAMS_CONFIG)
            : {},
          DISPLAY_CONFIG: row.DISPLAY_CONFIG
            ? JSON.parse(row.DISPLAY_CONFIG)
            : {},
          SCHEMA_MAPPING: row.SCHEMA_MAPPING
            ? JSON.parse(row.SCHEMA_MAPPING)
            : null,
        };
      } catch (error) {
        throw error;
      } finally {
        if (!connection && CONNECTION) {
          CONNECTION.release();
        }
      }
    },

    withAuth: async (
      extensionId: string,
      companyId: string,
      connection?: PoolConnection,
    ) => {
      const CONNECTION: PoolConnection =
        connection || (await PPIC.getConnection());
      try {
        const [rows]: any = await CONNECTION.query(
          extensionsQuerys.select.byId,
          [extensionId, companyId],
        );
        if (rows.length === 0) return null;

        const row = rows[0];
        const authConfig = row.AUTH_CONFIG
          ? JSON.parse(decrypt(row.AUTH_CONFIG))
          : null;

        return {
          ...row,
          AUTH_CONFIG: authConfig,
          REQUEST_HEADERS: row.REQUEST_HEADERS
            ? JSON.parse(row.REQUEST_HEADERS)
            : {},
          QUERY_PARAMS_CONFIG: row.QUERY_PARAMS_CONFIG
            ? JSON.parse(row.QUERY_PARAMS_CONFIG)
            : {},
          DISPLAY_CONFIG: row.DISPLAY_CONFIG
            ? JSON.parse(row.DISPLAY_CONFIG)
            : {},
        };
      } catch (error) {
        throw error;
      } finally {
        if (!connection && CONNECTION) {
          CONNECTION.release();
        }
      }
    },

    byType: async (
      companyId: string,
      displayType: string,
      connection?: PoolConnection,
    ) => {
      const CONNECTION: PoolConnection =
        connection || (await PPIC.getConnection());
      try {
        const [rows]: any = await CONNECTION.query(
          extensionsQuerys.select.byType,
          [companyId, displayType],
        );
        return rows.map((row: any) => ({
          ...row,
          AUTH_CONFIG: undefined,
          REQUEST_HEADERS: row.REQUEST_HEADERS
            ? JSON.parse(row.REQUEST_HEADERS)
            : {},
          QUERY_PARAMS_CONFIG: row.QUERY_PARAMS_CONFIG
            ? JSON.parse(row.QUERY_PARAMS_CONFIG)
            : {},
          DISPLAY_CONFIG: row.DISPLAY_CONFIG
            ? JSON.parse(row.DISPLAY_CONFIG)
            : {},
          SCHEMA_MAPPING: row.SCHEMA_MAPPING
            ? JSON.parse(row.SCHEMA_MAPPING)
            : null,
        }));
      } catch (error) {
        throw error;
      } finally {
        if (!connection && CONNECTION) {
          CONNECTION.release();
        }
      }
    },
  },

  updateLastSync: async (extensionId: string, connection?: PoolConnection) => {
    const CONNECTION: PoolConnection =
      connection || (await PPIC.getConnection());
    try {
      await CONNECTION.query(extensionsQuerys.updateSync, [extensionId]);
      if (!connection) await CONNECTION.commit();
    } catch (error) {
      throw error;
    } finally {
      if (!connection && CONNECTION) {
        CONNECTION.release();
      }
    }
  },

  data: {
    store: async (
      extensionId: string,
      projectId: string | null,
      rawData: any,
      transformedData: any,
      connection?: PoolConnection,
    ) => {
      const CONNECTION: PoolConnection =
        connection || (await PPIC.getConnection());
      try {
        const id = v7();
        await CONNECTION.query(extensionDataQuerys.insert, [
          id,
          extensionId,
          projectId,
          JSON.stringify(rawData),
          transformedData ? JSON.stringify(transformedData) : null,
        ]);
        if (!connection) await CONNECTION.commit();
        return id;
      } catch (error) {
        throw error;
      } finally {
        if (!connection && CONNECTION) {
          CONNECTION.release();
        }
      }
    },

    getLatest: async (
      extensionId: string,
      projectId: string | null,
      connection?: PoolConnection,
    ) => {
      const CONNECTION: PoolConnection =
        connection || (await PPIC.getConnection());
      try {
        const [rows]: any = await CONNECTION.query(
          extensionDataQuerys.select.latest,
          [extensionId, projectId],
        );
        if (rows.length === 0) return null;

        const row = rows[0];
        return {
          ...row,
          RAW_DATA: row.RAW_DATA ? JSON.parse(row.RAW_DATA) : null,
          TRANSFORMED_DATA: row.TRANSFORMED_DATA
            ? JSON.parse(row.TRANSFORMED_DATA)
            : null,
        };
      } catch (error) {
        throw error;
      } finally {
        if (!connection && CONNECTION) {
          CONNECTION.release();
        }
      }
    },
  },
};
