const { sapDummyController } = require("../controllers/sap-dummy");
const { Router } = require("express");
const { jwtServices } = require("../middlewares/jwt");

const sapDummyRouter = Router()

sapDummyRouter.get("/single/:projectNo/:identCode", jwtServices.verifyToken.byHeader, sapDummyController.get.by.projectNo)
sapDummyRouter.get("/single/:projectNo", jwtServices.verifyToken.byHeader, sapDummyController.get.by.projectNo)
sapDummyRouter.get("/check/status/:projectNo", jwtServices.verifyToken.byHeader, sapDummyController.get.status.projectNo)
sapDummyRouter.post("/update/single", jwtServices.verifyToken.byHeader, sapDummyController.update.single.by.projectNo)

module.exports = sapDummyRouter