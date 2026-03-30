const jwt = require('jsonwebtoken');

const jwtServices = {
    verifyToken: {
        byHeader: (req, res, next) => {
            // Ambil token dari cookie, bukan header
            const token = req.cookies?.auth_token;

            if (!token) {
                return res.status(401).json({
                    message: 'No authentication token found',
                    authenticated: false
                });
            }

            jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) {
                    // Clear cookie yang expired/invalid
                    res.clearCookie('auth_token', { path: '/' });
                    return res.status(401).json({
                        message: 'Invalid or expired token, please login again!',
                        authenticated: false
                    });
                }
                req.u = { ...decoded };
                next();
            });
        },
        byQuery: (req, res, next) => {
            const token = req.query.token

            if (!token) return res.status(401).json({ message: 'No token provided' });

            jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
                if (err) return res.status(401).json({ message: 'Expired token, please login again!' });
                req.user = user; // Attach decoded data to req.user
                next();
            });
        }
    }
}

module.exports = {
    jwtServices
}