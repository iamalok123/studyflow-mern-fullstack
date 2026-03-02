import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
    let token;

    // check if token is present in authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];

            // if token is not found
            if (!token) {
                return res.status(401).json({
                    success: false,
                    error: "Unauthorized [Bearer token not found]",
                    statusCode: 401,
                })
            }

            // verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select("-password");

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: "Unauthorized [User not found]",
                    statusCode: 401,
                })
            }
            next();
        } catch (error) {
            console.error("Auth MiddlewareError: ", error.message);
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({
                    success: false,
                    error: "Unauthorized [Token Expired]",
                    statusCode: 401,
                })
            }
            return res.status(401).json({
                success: false,
                error: "Unauthorized [Token failed]",
                statusCode: 401,
            })
        }
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            error: "Unauthorized [Token not found]",
            statusCode: 401,
        })
    }
}

export default protect;