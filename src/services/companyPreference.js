"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyPreferenceServices = void 0;
const companyPreference_1 = require("../models/companyPreference");
const db_1 = require("../config/db");
const uuid_1 = require("uuid");
exports.companyPreferenceServices = {
    add: {
        productivity: {
            period: async (companyId, cutoffDayStart, cutoffDayFinish, cutoffInterval, connection) => {
                const CONNECTIONS = connection || (await db_1.PPIC.getConnection());
                try {
                    const id = (0, uuid_1.v7)();
                    await CONNECTIONS.query(companyPreference_1.companyPreferenceQuerys.insert, [
                        id,
                        companyId,
                        cutoffDayStart,
                        cutoffDayFinish,
                        cutoffInterval,
                    ]);
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
        },
    },
};
