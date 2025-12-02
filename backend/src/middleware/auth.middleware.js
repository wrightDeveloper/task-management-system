import jwt from "jsonwebtoken";
import User from "../models/user";

const protect = async (req, res, next) => {
    try{
        let token;

        if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
            token = req.headers.authorization.split(" ")[1];
        }

        if(!token){
            res.status(401).json({message: "Not authorized, token missing"});
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id).select("-password");

        if(!req.user) {
            res.status(401).json({message: "User not found"});
        }

        next();
    } catch(error){
        res.status(401).json({ message: "Not authorized, invalid token" });
    }
};

export default protect;