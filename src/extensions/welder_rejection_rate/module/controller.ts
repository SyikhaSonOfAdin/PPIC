import { AuthenticatedRequest } from "../../../middlewares/.types";
import { WELDER_REJECTION_RATE_APP } from "../.config/url.conf";
import { StandartResponse } from "../../../_interface/response";
import { Response } from "express";
import axios from "axios";

const welderRejectionRateController = {
  access: async (req: AuthenticatedRequest, res: Response) => {
    const { project_id, project_no, project_name, client, username } = req.body;
    const { email, user, company } = req.u;
    try {
      const params = {
        project_id,
        project_no,
        project_name,
        client,
        username,
        email,
        user_id: user.id,
        company_name: company.name,
        company_id: company.id,
      };

      // ✅ FIX: Use /register-s2s endpoint with server key
      const { data } = await axios.post<
        StandartResponse<{ redeem_code: string }>
      >(
        `${WELDER_REJECTION_RATE_APP.server}/register-s2s`, // ← Changed from /register
        params,
        {
          headers: {
            "x-server-key": process.env.QC_SERVER_KEY, // ← Add server key
            "Content-Type": "application/json",
          },
        },
      );

      return res.status(200).json({
        message: "Access Granted",
        data: {
          url: `${WELDER_REJECTION_RATE_APP.app}/login?code=${data.data?.redeem_code}&project_id=${project_id}`,
        },
      });
    } catch (error: any) {
      // ✅ Better error handling
      console.error(
        "[QC Registration Error]:",
        error.response?.data || error.message,
      );
      res.status(error.response?.status || 500).json({
        message: error.response?.data?.message || error.message,
      });
    }
  },
  getOverall: async (req: AuthenticatedRequest, res: Response) => {
    const { project_id } = req.params;
    try {
      const { data } = await axios.get<StandartResponse<number>>(
        `${WELDER_REJECTION_RATE_APP.server}/rejection_rate/overall/${project_id}`,
      );
      return res.status(200).json({
        message: "Access Granted",
        data,
      });
    } catch (error: any) {
      res.status(500).json({
        message: error.message,
      });
    }
  },
};

export default welderRejectionRateController;
