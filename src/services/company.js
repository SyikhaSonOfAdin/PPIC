"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyServices = void 0;
const company_1 = require("../models/company");
const db_1 = require("../config/db");
const uuid_1 = require("uuid");
exports.companyServices = {
    add: async (name, connection) => {
        const CONNECTIONS = connection || (await db_1.PPIC.getConnection());
        try {
            const id = (0, uuid_1.v7)();
            await CONNECTIONS.query(company_1.companyQuerys.insert, [id, name]);
            if (!connection)
                await CONNECTIONS.commit();
            return id;
        }
        catch (error) {
            throw error;
        }
        finally {
            if (!connection && CONNECTIONS) {
                CONNECTIONS.release();
            }
        }
    },
    edit: {
        name: async (id, name, connection) => {
            const CONNECTION = connection || await db_1.PPIC.getConnection();
            try {
                await CONNECTION.query(company_1.companyQuerys.update.name, [name, id]);
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
        status: async (id, status, connection) => {
            const CONNECTION = connection || await db_1.PPIC.getConnection();
            try {
                await CONNECTION.query(company_1.companyQuerys.update.status, [status, id]);
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
        }
    },
    delete: async (id, connection) => {
        const CONNECTIONS = connection || (await db_1.PPIC.getConnection());
        try {
            await CONNECTIONS.query(company_1.companyQuerys.delete, [id]);
            if (!connection)
                await CONNECTIONS.commit();
        }
        catch (error) {
            throw error;
        }
        finally {
            if (!connection && CONNECTIONS) {
                CONNECTIONS.release();
            }
        }
    },
};
