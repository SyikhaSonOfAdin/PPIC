"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extensionsServices = void 0;
const db_1 = require("../config/db");
const uuid_1 = require("uuid");
const extensions_1 = require("../models/extensions");
const crypto_1 = require("../utils/crypto");
const VALID_HTTP_METHODS = ["GET", "POST"];
const VALID_AUTH_TYPES = ["none", "bearer", "api-key", "basic"];
const VALID_DISPLAY_TYPES = ["page", "project-tab", "dashboard-widget"];
exports.extensionsServices = {
    getProjectContext: async (projectId, connection) => {
        const CONNECTION = connection || await db_1.PPIC.getConnection();
        try {
            const [rows] = await CONNECTION.query(`SELECT 
          CP.PROJECT_NO, 
          PD.NAME AS PROJECT_NAME, 
          PD.SPK 
        FROM company_projects CP
        LEFT JOIN project_detail PD ON CP.ID = PD.PROJECT_ID
        WHERE CP.ID = ?`, [projectId]);
            if (rows.length === 0)
                return null;
            return rows[0];
        }
        catch (error) {
            throw error;
        }
        finally {
            if (!connection && CONNECTION) {
                CONNECTION.release();
            }
        }
    },
    getCompanyContext: async (companyId, connection) => {
        const CONNECTION = connection || await db_1.PPIC.getConnection();
        try {
            const [rows] = await CONNECTION.query(`SELECT NAME FROM company WHERE ID = ?`, [companyId]);
            if (rows.length === 0)
                return null;
            return rows[0];
        }
        catch (error) {
            throw error;
        }
        finally {
            if (!connection && CONNECTION) {
                CONNECTION.release();
            }
        }
    },
    create: async (companyId, name, description, endpointUrl, httpMethod, authType, authConfig, requestHeaders, displayType, displayConfig, refreshInterval, createdBy, responsePath, schemaMapping, queryParamsConfig, connection) => {
        const CONNECTION = connection || (await db_1.PPIC.getConnection());
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
            const id = (0, uuid_1.v7)();
            const encryptedAuth = authConfig
                ? (0, crypto_1.encrypt)(JSON.stringify(authConfig))
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
            if (!connection)
                await CONNECTION.commit();
            return id;
        }
        catch (error) {
            throw error;
        }
        finally {
            if (!connection && CONNECTION) {
                CONNECTION.release();
            }
        }
    },
    update: async (extensionId, companyId, name, description, endpointUrl, httpMethod, authType, authConfig, requestHeaders, displayType, displayConfig, refreshInterval, responsePath, schemaMapping, queryParamsConfig, connection) => {
        const CONNECTION = connection || (await db_1.PPIC.getConnection());
        try {
            const encryptedAuth = authConfig
                ? (0, crypto_1.encrypt)(JSON.stringify(authConfig))
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
            if (!connection)
                await CONNECTION.commit();
        }
        catch (error) {
            throw error;
        }
        finally {
            if (!connection && CONNECTION) {
                CONNECTION.release();
            }
        }
    },
    delete: async (extensionId, companyId, connection) => {
        const CONNECTION = connection || (await db_1.PPIC.getConnection());
        try {
            await CONNECTION.query(extensions_1.extensionsQuerys.delete, [extensionId, companyId]);
            if (!connection)
                await CONNECTION.commit();
        }
        catch (error) {
            throw error;
        }
        finally {
            if (!connection && CONNECTION) {
                CONNECTION.release();
            }
        }
    },
    get: {
        all: async (companyId, connection) => {
            const CONNECTION = connection || (await db_1.PPIC.getConnection());
            try {
                const [rows] = await CONNECTION.query(extensions_1.extensionsQuerys.select.all, [companyId]);
                return rows.map((row) => ({
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
            }
            catch (error) {
                throw error;
            }
            finally {
                if (!connection && CONNECTION) {
                    CONNECTION.release();
                }
            }
        },
        byId: async (extensionId, companyId, connection) => {
            const CONNECTION = connection || (await db_1.PPIC.getConnection());
            try {
                const [rows] = await CONNECTION.query(extensions_1.extensionsQuerys.select.byId, [extensionId, companyId]);
                if (rows.length === 0)
                    return null;
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
            }
            catch (error) {
                throw error;
            }
            finally {
                if (!connection && CONNECTION) {
                    CONNECTION.release();
                }
            }
        },
        withAuth: async (extensionId, companyId, connection) => {
            const CONNECTION = connection || (await db_1.PPIC.getConnection());
            try {
                const [rows] = await CONNECTION.query(extensions_1.extensionsQuerys.select.byId, [extensionId, companyId]);
                if (rows.length === 0)
                    return null;
                const row = rows[0];
                const authConfig = row.AUTH_CONFIG
                    ? JSON.parse((0, crypto_1.decrypt)(row.AUTH_CONFIG))
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
            }
            catch (error) {
                throw error;
            }
            finally {
                if (!connection && CONNECTION) {
                    CONNECTION.release();
                }
            }
        },
        byType: async (companyId, displayType, connection) => {
            const CONNECTION = connection || (await db_1.PPIC.getConnection());
            try {
                const [rows] = await CONNECTION.query(extensions_1.extensionsQuerys.select.byType, [companyId, displayType]);
                return rows.map((row) => ({
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
            }
            catch (error) {
                throw error;
            }
            finally {
                if (!connection && CONNECTION) {
                    CONNECTION.release();
                }
            }
        },
    },
    updateLastSync: async (extensionId, connection) => {
        const CONNECTION = connection || (await db_1.PPIC.getConnection());
        try {
            await CONNECTION.query(extensions_1.extensionsQuerys.updateSync, [extensionId]);
            if (!connection)
                await CONNECTION.commit();
        }
        catch (error) {
            throw error;
        }
        finally {
            if (!connection && CONNECTION) {
                CONNECTION.release();
            }
        }
    },
    data: {
        store: async (extensionId, projectId, rawData, transformedData, connection) => {
            const CONNECTION = connection || (await db_1.PPIC.getConnection());
            try {
                const id = (0, uuid_1.v7)();
                await CONNECTION.query(extensions_1.extensionDataQuerys.insert, [
                    id,
                    extensionId,
                    projectId,
                    JSON.stringify(rawData),
                    transformedData ? JSON.stringify(transformedData) : null,
                ]);
                if (!connection)
                    await CONNECTION.commit();
                return id;
            }
            catch (error) {
                throw error;
            }
            finally {
                if (!connection && CONNECTION) {
                    CONNECTION.release();
                }
            }
        },
        getLatest: async (extensionId, projectId, connection) => {
            const CONNECTION = connection || (await db_1.PPIC.getConnection());
            try {
                const [rows] = await CONNECTION.query(extensions_1.extensionDataQuerys.select.latest, [extensionId, projectId]);
                if (rows.length === 0)
                    return null;
                const row = rows[0];
                return {
                    ...row,
                    RAW_DATA: row.RAW_DATA ? JSON.parse(row.RAW_DATA) : null,
                    TRANSFORMED_DATA: row.TRANSFORMED_DATA
                        ? JSON.parse(row.TRANSFORMED_DATA)
                        : null,
                };
            }
            catch (error) {
                throw error;
            }
            finally {
                if (!connection && CONNECTION) {
                    CONNECTION.release();
                }
            }
        },
    },
};
