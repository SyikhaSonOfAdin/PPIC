import { Request, Response, NextFunction } from "express";
import { privilegeServices } from "../services/privilege";
import { PPIC } from "../config/db";

// Extend Express Request type to include 'user'
interface CustomRequest extends Request {
  u?: {
    email: string;
    user: { id: string };
    iat: number;
    exp: number;
  };
}

export const privilege = {
  hasPrivilege: (permissionId: string) => {
    return async (req: CustomRequest, res: Response, next: NextFunction) => {
      try {
        const conn = await PPIC.getConnection();
        try {
          const userId = req.u?.user?.id;
          if (!userId) {
            return res
              .status(401)
              .json({ message: "missing userId please login again!" });
          }
          const userPrivileges = await privilegeServices.get(userId, conn);
          const hasPermission = userPrivileges.find(
            (privilege) => privilege.PERMISSION_ID === permissionId
          );
          if (!hasPermission || hasPermission.GRANTED === 0) {
            return res.status(403).json({
              message:
                "Your access denied, you don't have the required permission.",
            });
          }
          next();
        } catch (error) {
          conn.rollback();
          res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
          });
        } finally {
          conn.release();
        }
      } catch (error) {
        res.status(500).json({
          message: "Internal Server Error",
          error: error.message,
        });
      }
    };
  },
};
