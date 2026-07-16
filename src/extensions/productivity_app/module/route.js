"use strict";
const { Router } = require("express");
const { jwtServices } = require("../../../middlewares/jwt");
const { productivityAppController } = require("./controller");

const productivityAppRoute = Router();

productivityAppRoute.post(
    "/access",
    jwtServices.verifyToken.byHeader,
    productivityAppController.access
);

module.exports = { productivityAppRoute };
