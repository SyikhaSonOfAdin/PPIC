import { RowDataPacket, FieldPacket } from "mysql2";
import { PoolConnection } from "mysql2/promise";
import { user } from "../utils/customTypes";
import { userQuerys } from "../models/user";
import { PPIC } from "../config/db";
import * as argon2 from "argon2";
import { v7 } from "uuid";

export const userServices = {
  add: async (
    companyId: string,
    username: string,
    email: string,
    password: string,
    connection?: PoolConnection
  ): Promise<string> => {
    const CONNECTION: PoolConnection =
      connection || (await PPIC.getConnection());

    try {
      const id: string = v7();
      const hashedPassword = await argon2.hash(password);

      await CONNECTION.query(userQuerys.insert, [
        id,
        companyId,
        username,
        email,
        hashedPassword,
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
  edit: {
    department: async (
      departmentId: string,
      userId: string,
      connection?: PoolConnection
    ): Promise<void> => {
      const CONNECTION = connection || (await PPIC.getConnection());

      try {
        await CONNECTION.query(userQuerys.update.department, [
          departmentId,
          userId,
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
    single: async (
      userId: string,
      username: string,
      email: string,
      connection?: PoolConnection
    ): Promise<string> => {
      const CONNECTION: PoolConnection =
        connection || (await PPIC.getConnection());

      try {
        await CONNECTION.query(userQuerys.update.single, [
          username,
          email,
          userId,
        ]);
        if (!connection) await CONNECTION.commit();
        return userId;
      } catch (error) {
        throw error;
      } finally {
        if (!connection && CONNECTION) {
          CONNECTION.release();
        }
      }
    },
  },
  check: {
    email: async (email: string, connection?: PoolConnection) => {
      const CONNECTION = connection || (await PPIC.getConnection());
      try {
        const [data]: [RowDataPacket[], FieldPacket[]] = await CONNECTION.query(
          userQuerys.get.onlyOne.email.byEmail,
          [email]
        );
        if (data.length > 0) return true;
        return false;
      } catch (error) {
        throw error;
      } finally {
        if (!connection && CONNECTION) {
          CONNECTION.release();
        }
      }
    },
  },
  delete: {
    user: async (userId: string, connection?: PoolConnection) => {
      const CONNECTION = connection || (await PPIC.getConnection());

      try {
        await CONNECTION.query(userQuerys.delete.user, [userId]);
        if (!connection) await CONNECTION.commit();
      } catch (error) {
        throw error;
      } finally {
        if (!connection && CONNECTION) {
          CONNECTION.release();
        }
      }
    },
    department: async (userId: string, connection?: PoolConnection) => {
      const CONNECTION = connection || (await PPIC.getConnection());

      try {
        await CONNECTION.query(userQuerys.update.department, [null, userId]);
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
  get: {
    all: async (
      companyId: string,
      connection?: PoolConnection
    ): Promise<user[]> => {
      const CONNECTION: PoolConnection =
        connection || (await PPIC.getConnection());

      try {
        const [data]: [RowDataPacket[], FieldPacket[]] = await CONNECTION.query(
          userQuerys.get.all.all,
          [companyId]
        );
        return data as user[];
      } catch (error) {
        throw error;
      } finally {
        if (!connection && CONNECTION) {
          CONNECTION.release();
        }
      }
    },
    single: async (
      userId: string,
      connection?: PoolConnection
    ): Promise<user> => {
      const CONNECTION: PoolConnection =
        connection || (await PPIC.getConnection());

      try {
        const [data]: [RowDataPacket[], FieldPacket[]] = await CONNECTION.query(
          userQuerys.get.onlyOne.all.byId,
          [userId]
        );
        return data[0] as user;
      } catch (error) {
        throw error;
      } finally {
        if (!connection && CONNECTION) {
          CONNECTION.release();
        }
      }
    },
    withoutDep: async (
      companyId: string,
      connection?: PoolConnection
    ): Promise<user[]> => {
      const CONNECTION: PoolConnection =
        connection || (await PPIC.getConnection());

      try {
        const [data]: [RowDataPacket[], FieldPacket[]] = await CONNECTION.query(
          userQuerys.get.all.withoutDepartment,
          [companyId]
        );
        return data as user[];
      } catch (error) {
        throw error;
      } finally {
        if (!connection && CONNECTION) {
          CONNECTION.release();
        }
      }
    },
    byDepId: async (
      departmentId: string,
      connection?: PoolConnection
    ): Promise<user[]> => {
      const CONNECTION: PoolConnection =
        connection || (await PPIC.getConnection());

      try {
        const [data]: [RowDataPacket[], FieldPacket[]] = await CONNECTION.query(
          userQuerys.get.all.byDepId,
          [departmentId]
        );
        return data as user[];
      } catch (error) {
        throw error;
      } finally {
        if (!connection && CONNECTION) {
          CONNECTION.release();
        }
      }
    },
  },
  login: async (
    email: string,
    password: string,
    connection?: PoolConnection
  ): Promise<user | string> => {
    const CONNECTION: PoolConnection =
      connection || (await PPIC.getConnection());

    try {
      const [isExist]: [RowDataPacket[], FieldPacket[]] =
        await CONNECTION.query(userQuerys.get.onlyOne.all.byEmail, [email]);

      if (isExist.length > 0) {
        const user: user = isExist[0] as user;
        const isMatch: boolean = await argon2.verify(user.PASSWORD, password);

        if (isMatch) {
          return user;
        } else {
          return "Invalid email or password";
        }
      } else {
        return "Email not found";
      }
    } catch (error) {
      throw error;
    } finally {
      if (!connection && CONNECTION) {
        CONNECTION.release();
      }
    }
  },
};
