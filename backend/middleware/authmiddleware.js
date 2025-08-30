const jwt = require("jsonwebtoken")
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
    throw new Error("Please Provide Jwt.");
}

const AuthMiddleWare = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "No token provided" });
        }

        // Extract token
        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}
module.exports = AuthMiddleWare;