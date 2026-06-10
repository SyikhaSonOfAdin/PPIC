import { PoolConnection } from "mysql2/promise";
import { PPIC } from "../config/db";
import { v7 } from "uuid";
import { projectAttachmentQuerys } from "../models/attachment";

export const attachmentServices = {
  add: async (
    projectId: string,
    userId: string,
    fileName: string,
    description: string = "",
    label: "common" | "packing list" | "transfer slip" | "surat jalan" | "qc",
    connection?: PoolConnection,
  ) => {
    const CONNECTION: PoolConnection =
      connection || (await PPIC.getConnection());
    try {
      const id: string = v7();
      await CONNECTION.query(projectAttachmentQuerys.insert, [
        id,
        projectId,
        userId,
        label,
        fileName,
        description,
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
  delete: {
    onlyOne: async (attachmentId: string, connection?: PoolConnection) => {
      const CONNECTION: PoolConnection =
        connection || (await PPIC.getConnection());
      try {
        await CONNECTION.query(projectAttachmentQuerys.delete.onlyOne, [
          attachmentId,
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
  },
  edit: async (
    attachmentId: string,
    userId: string,
    description: string,
    connection?: PoolConnection,
  ) => {
    const CONNECTION: PoolConnection =
      connection || (await PPIC.getConnection());
    try {
      await CONNECTION.query(projectAttachmentQuerys.update, [
        description,
        userId,
        attachmentId,
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
  get: {
    all: async (
      projectId: string,
      label: "common" | "packing list" | "transfer slip" | "surat jalan" | "qc",
      searchTerms: string = "",
      skip: number,
      take: number,
      connection?: PoolConnection,
    ) => {
      const CONNECTION: PoolConnection =
        connection || (await PPIC.getConnection());
      try {
        const pattern = `%${searchTerms}%`;
        const [data] = await CONNECTION.query(
          projectAttachmentQuerys.select.byProjectId,
          [projectId, label, pattern, pattern, pattern, pattern],
        );
        return data;
      } catch (error) {
        throw error;
      } finally {
        if (!connection && CONNECTION) {
          CONNECTION.release();
        }
      }
    },
    fileName: async (rowId: string, connection?: PoolConnection) => {
      const CONNECTION: PoolConnection =
        connection || (await PPIC.getConnection());
      try {
        const [data] = await CONNECTION.query(
          projectAttachmentQuerys.select.byRowId,
          [rowId],
        );
        return data;
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
