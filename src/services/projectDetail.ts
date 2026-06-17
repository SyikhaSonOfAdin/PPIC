import { FieldPacket, PoolConnection, RowDataPacket } from "mysql2/promise";
import { projectDetailQuerys } from "../models/projectDetail";
import { PPIC } from "../config/db";
import { v7 } from "uuid";
import { progressPercentage } from "../utils";

export const projectDetailServices = {
  add: async (
    data: {
      projectId: string;
      userId: string;
      name: string;
      spk: string;
      description: string;
      ppm: string;
      capacity: number;
      workPlace: string;
      startDate: string;
      dueDate: string;
      finishDate: string;
      delivery?: string;
      budget?: number;
      cost?: number;
      man_hours?: number;
      periodInterval?: number;
      periodType?: string;
    },
    connection?: PoolConnection,
  ) => {
    const {
      projectId,
      userId,
      name,
      spk,
      description,
      ppm,
      capacity,
      workPlace,
      startDate,
      dueDate,
      finishDate,
      delivery,
      budget,
      cost,
      man_hours,
      periodInterval,
      periodType,
    } = data;
    const CONNECTION: PoolConnection =
      connection || (await PPIC.getConnection());
    try {
      const id: string = v7();
      await CONNECTION.query(projectDetailQuerys.insert, [
        id,
        projectId,
        userId,
        name,
        spk,
        description,
        ppm,
        capacity,
        workPlace,
        startDate,
        dueDate,
        finishDate !== "" ? finishDate : null,
        delivery ? true : false,
        delivery !== "" ? delivery : null,
        null,
        budget ?? null,
        cost ?? null,
        man_hours ?? null,
        null,
        periodInterval ?? null,
        periodType ?? null,
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
  delete: async (projectId: string, connection?: PoolConnection) => {
    const CONNECTION: PoolConnection =
      connection || (await PPIC.getConnection());
    try {
      await CONNECTION.query(projectDetailQuerys.delete.onlyOne, [projectId]);
      if (!connection) await CONNECTION.commit();
    } catch (error) {
      throw error;
    } finally {
      if (!connection && CONNECTION) {
        CONNECTION.release();
      }
    }
  },
  edit: {
    all: async (
      data: {
        projectId: string;
        userId: string;
        name: string;
        spk: string;
        description: string;
        ppm: string;
        capacity: number;
        workPlace: string;
        startDate: string;
        dueDate: string;
        finishDate: string;
        delivery?: string;
        budget?: number;
        cost?: number;
        man_hours?: number;
      },
      connection?: PoolConnection,
    ) => {
      const {
        userId,
        name,
        spk,
        description,
        ppm,
        capacity,
        workPlace,
        startDate,
        dueDate,
        finishDate,
        delivery,
        budget,
        cost,
        projectId,
        man_hours,
      } = data;
      const CONNECTION: PoolConnection =
        connection || (await PPIC.getConnection());
      try {
        const { actualProgress } = await progressPercentage(
          projectId,
          CONNECTION,
        );
        // prettier-ignore
        const productivity_cost = cost && cost !== 0 && actualProgress !== 0 ? Number(cost) / Number(actualProgress) : null;
        // prettier-ignore
        const productivity = man_hours &&  man_hours !== 0 && actualProgress !== 0 ? Number(actualProgress) / Number(man_hours) : null;
        await CONNECTION.query(projectDetailQuerys.update.all, [
          userId,
          name,
          spk,
          description,
          ppm,
          capacity,
          workPlace,
          startDate,
          dueDate,
          finishDate,
          delivery ? true : false,
          delivery ?? null,
          productivity,
          budget ?? null,
          cost ?? null,
          // @ts-ignore
          man_hours && man_hours != "" ? man_hours : null,
          productivity_cost ?? null,
          projectId,
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
    deliver: async (projectId: string, connection?: PoolConnection) => {
      const CONNECTION: PoolConnection =
        connection || (await PPIC.getConnection());
      try {
        await CONNECTION.query(projectDetailQuerys.update.deliver, [projectId]);
        if (!connection) await CONNECTION.commit();
      } catch (error) {
        throw error;
      } finally {
        if (!connection && CONNECTION) {
          CONNECTION.release();
        }
      }
    },
  },
  get: async (projectId: string, connection?: PoolConnection) => {
    const CONNECTION: PoolConnection =
      connection || (await PPIC.getConnection());
    try {
      const [data]: [RowDataPacket[], FieldPacket[]] = await CONNECTION.query(
        projectDetailQuerys.select.byProjectId,
        [projectId],
      );
      return data[0] as {
        NAME: string;
        SPK: string;
        DELIVERED: number;
        DELIVERY_DATE: string;
        DESCRIPTION: string;
        PPM: string;
        CAPACITY: number;
        WORK_PLACE: string;
        START_DATE: string;
        DUE_DATE: string;
        FINISH_DATE: string;
        PRODUCTIVITY: number | null;
        BUDGET: number | null;
        COST: number | null;
        MAN_HOURS: number | null;
        PRODUCTIVITY_COST: number | null;
      };
    } catch (error) {
      throw error;
    } finally {
      if (!connection && CONNECTION) {
        CONNECTION.release();
      }
    }
  },
};
