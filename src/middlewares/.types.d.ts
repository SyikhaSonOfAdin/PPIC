import { Request } from "express";

interface AuthenticatedRequest extends Request {
  u: {
    email: string;
    user: { id: string };
    company: {
      id: string;
      name: string;
    };
  };
}
