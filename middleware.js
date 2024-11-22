const { JWT_SECRET } = require("./config");
const jwt = require("jsonwebtoken");

const authTokenMiddleware = (req, res, next) => {
    const authHeader = req.headers.cookie;
    if (!authHeader.startsWith('token=')) {
        return res.status(403).json({});
    }
    const token = authHeader.split('=')[1];    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        return res.status(403).json({});
    }
};

module.exports = {
    authTokenMiddleware
}