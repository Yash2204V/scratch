const { JWT_SECRET } = require("./config");
const jwt = require("jsonwebtoken");

const authTokenMiddleware = (req, res, next) => {   
    const token = req.cookies.token;
    const error = req.flash('error') || [];  
    const success = req.flash('success') || [];
    
    if (!token) {
        return res.render("login", {error, success});
    }
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