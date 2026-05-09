const jwt = require("jsonwebtoken");

const jwtServices = {
  verifyToken: {
    byHeader: (req, res, next) => {
      // Ambil token dari cookie, bukan header
      const token = req.cookies?.auth_token;

      if (!token) {
        return res.status(401).json({
          message: "No authentication token found",
          authenticated: false,
        });
      }

      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          // Clear cookie yang expired/invalid
          res.clearCookie("auth_token", { path: "/" });
          return res.status(401).json({
            message: "Invalid or expired token, please login again!",
            authenticated: false,
          });
        }
        /**
         * @example { email: 'syikhasmart@gmail.com', user: { id: '6391ceb4-72c1-42c1-89f5-1d20226248a9' }, company: { id: '01924204-5ff4-7ddd-96db-3d697bb595fc', name: 'PT Kokoh Semesta'}}
         */
        req.u = { ...decoded };
        next();
      });
    },
    byQuery: (req, res, next) => {
      const token = req.query.token;

      if (!token) return res.status(401).json({ message: "No token provided" });

      jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err)
          return res
            .status(401)
            .json({ message: "Expired token, please login again!" });
        req.user = user; // Attach decoded data to req.user
        next();
      });
    },
  },
};

module.exports = {
  jwtServices,
};
