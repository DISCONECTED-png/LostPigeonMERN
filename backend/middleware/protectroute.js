import User from "../models/usermodel.js";
import jwt from "jsonwebtoken";
export const protectRoute = async (req,res,next)=>{
    try {
        const token = req.cookies.jwt;
        if(!token){
            return res.status(401).json({error:"Unauthorised: No Token Provided"});
        }
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        if(!decoded){
            return res.status(401).json({error:"Unauthorised: Invalid Token"});
        }
        const user = await User.findById(decoded.userid).select("-password");
        if(!user){
            return res.status(404).json({error:"User Not found"});
        }
        req.user = user;
        next();
    } catch (error) {
        console.log("Error in protectroute middleware",error.message);
        return res.status(500).json({error:"Internal server error"})
    }
}