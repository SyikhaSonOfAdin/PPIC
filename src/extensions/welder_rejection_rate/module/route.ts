import { jwtServices } from "../../../middlewares/jwt";
import { Router } from "express";
import welderRejectionRateController from "./controller";

const welderRejectionRateRoute = Router();

welderRejectionRateRoute.get(
  "/overall/:project_id",
  jwtServices.verifyToken.byHeader,
  // @ts-ignore
  welderRejectionRateController.getOverall,
);

welderRejectionRateRoute.post(
  "/access",
  jwtServices.verifyToken.byHeader,
  // @ts-ignore
  welderRejectionRateController.access,
);

export default welderRejectionRateRoute;
