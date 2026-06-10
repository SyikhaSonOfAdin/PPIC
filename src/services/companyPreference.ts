import { companyPreferenceQuerys } from "../models/companyPreference";
import { PoolConnection } from "mysql2/promise";
import { PPIC } from "../config/db";
import { v7 } from "uuid";

export const companyPreferenceServices = {
  add: {
    productivity: {
      period: async (
        companyId: string,
        cutoffDayStart: number,
        cutoffDayFinish: number,
        cutoffInterval: number,
        connection?: PoolConnection
      ) => {
        const CONNECTIONS: PoolConnection =
          connection || (await PPIC.getConnection());
        try {
          const id: string = v7();
          await CONNECTIONS.query(companyPreferenceQuerys.insert, [
            id,
            companyId,
            cutoffDayStart,
            cutoffDayFinish,
            cutoffInterval,
          ]);
          if (!connection) await CONNECTIONS.commit();
          return id;
        } catch (error) {
          throw error;
        } finally {
          if (!connection && CONNECTIONS) {
            CONNECTIONS.release();
          }
        }
      },
    },
  },
};
