"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachmentServices = void 0;
const db_1 = require("../config/db");
const uuid_1 = require("uuid");
const attachment_1 = require("../models/attachment");
exports.attachmentServices = {
    add: async (projectId, userId, fileName, description = "", label, connection) => {
        const CONNECTION = connection || (await db_1.PPIC.getConnection());
        try {
            const id = (0, uuid_1.v7)();
            await CONNECTION.query(attachment_1.projectAttachmentQuerys.insert, [
                id,
                projectId,
                userId,
                label,
                fileName,
                description,
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
    delete: {
        onlyOne: async (attachmentId, connection) => {
            const CONNECTION = connection || (await db_1.PPIC.getConnection());
            try {
                await CONNECTION.query(attachment_1.projectAttachmentQuerys.delete.onlyOne, [
                    attachmentId,
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
    },
    edit: async (attachmentId, userId, description, connection) => {
        const CONNECTION = connection || (await db_1.PPIC.getConnection());
        try {
            await CONNECTION.query(attachment_1.projectAttachmentQuerys.update, [
                description,
                userId,
                attachmentId,
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
    get: {
        all: async (projectId, label, searchTerms = "", skip, take, connection) => {
            const CONNECTION = connection || (await db_1.PPIC.getConnection());
            try {
                const pattern = `%${searchTerms}%`;
                const [data] = await CONNECTION.query(attachment_1.projectAttachmentQuerys.select.byProjectId, [projectId, label, pattern, pattern, pattern, pattern]);
                return data;
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
        fileName: async (rowId, connection) => {
            const CONNECTION = connection || (await db_1.PPIC.getConnection());
            try {
                const [data] = await CONNECTION.query(attachment_1.projectAttachmentQuerys.select.byRowId, [rowId]);
                return data;
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
