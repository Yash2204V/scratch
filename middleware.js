const { JWT_SECRET } = require("./config");
const jwt = require("jsonwebtoken");

const authTokenMiddleware = (req, res, next) => {   
    const authHeader = req.headers.cookie;
    // console.log(authHeader);
    if (!authHeader || !authHeader.startsWith('token=')) {
        return res.render("login");
    }
    const token = authHeader.split('=')[1];    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.id;        
        next();
    } catch (err) {
        return res.status(403).json({ error: "Invalid token" });
    }
};

module.exports = {
    authTokenMiddleware
}