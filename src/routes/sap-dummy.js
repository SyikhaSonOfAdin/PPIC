const { sapDummyController } = require("../controllers/sap-dummy");
const { Router } = require("express");

const sapDummyRouter = Router()

sapDummyRouter.get("/single/:projectNo", sapDummyController.get.by.projectNo)
sapDummyRouter.get("/check/status/:projectNo", sapDummyController.get.status.projectNo)
sapDummyRouter.post("/update/single", sapDummyController.update.single.by.projectNo)

module.exports = sapDummyRouter