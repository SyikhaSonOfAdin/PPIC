import { PoolConnection } from "mysql2/promise";
import { PPIC } from "../config/db";
import { v7 } from "uuid";
import { phaseScheduleQuerys } from "../models/phaseSchedule";

export const phaseScheduleServices = {
  add: async (
    projectId: string,
    departmentId: string,
    phase: string,
    planStartWeek: string,
    planEndWeek: string,
    actualStartWeek: string | null,
    actualEndWeek: string | null,
    userId: string,
    connection?: PoolConnection
  ) => {
    const CONNECTION: PoolConnection = connection || await PPIC.getConnection();
    try {
      const [duplicate] = await CONNECTION.query(
        phaseScheduleQuerys.select.checkDuplicate,
        [projectId, departmentId, phase, '']
      );
      if (duplicate[0].count > 0) {
        throw new Error('Duplicate phase schedule for this department');
      }

      const id: string = v7();
      await CONNECTION.query(phaseScheduleQuerys.insert, [
        id,
        projectId,
        departmentId,
        phase,
        planStartWeek,
        planEndWeek,
        actualStartWeek,
        actualEndWeek,
        userId
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

  edit: async (
    rowId: string,
    departmentId: string,
    phase: string,
    planStartWeek: string,
    planEndWeek: string,
    actualStartWeek: string | null,
    actualEndWeek: string | null,
    userId: string,
    projectId: string,
    connection?: PoolConnection
  ) => {
    const CONNECTION: PoolConnection = connection || await PPIC.getConnection();
    try {
      const [duplicate] = await CONNECTION.query(
        phaseScheduleQuerys.select.checkDuplicate,
        [projectId, departmentId, phase, rowId]
      );
      if (duplicate[0].count > 0) {
        throw new Error('Duplicate phase schedule for this department');
      }

      await CONNECTION.query(phaseScheduleQuerys.update, [
        departmentId,
        phase,
        planStartWeek,
        planEndWeek,
        actualStartWeek,
        actualEndWeek,
        userId,
        rowId
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

  delete: {
    onlyOne: async (rowId: string, connection?: PoolConnection) => {
      const CONNECTION: PoolConnection = connection || await PPIC.getConnection();
      try {
        await CONNECTION.query(phaseScheduleQuerys.delete.onlyOne, [rowId]);
        if (!connection) await CONNECTION.commit();
      } catch (error) {
        throw error;
      } finally {
        if (!connection && CONNECTION) {
          CONNECTION.release();
        }
      }
    },
    byProject: async (projectId: string, connection?: PoolConnection) => {
      const CONNECTION: PoolConnection = connection || await PPIC.getConnection();
      try {
        await CONNECTION.query(phaseScheduleQuerys.delete.byProject, [projectId]);
        if (!connection) await CONNECTION.commit();
      } catch (error) {
        throw error;
      } finally {
        if (!connection && CONNECTION) {
          CONNECTION.release();
        }
      }
    }
  },

  get: {
    byProject: async (projectId: string, connection?: PoolConnection) => {
      const CONNECTION: PoolConnection = connection || await PPIC.getConnection();
      try {
        const [data] = await CONNECTION.query(
          phaseScheduleQuerys.select.byProject,
          [projectId]
        );
        return data;
      } catch (error) {
        throw error;
      } finally {
        if (!connection && CONNECTION) {
          CONNECTION.release();
        }
      }
    }
  }
};
