import { Admin } from "../models/admin.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async(req,res,next)=>{
    try {

        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    
        if(!token) throw new ApiError(401,"Unauthorized request")

        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        if(!user) {
            throw new ApiError(401,"Invalid access token")
        }

        req.user = user
        next()
        
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid Access token")
    }
})

export const verifyJWTAdmin = asyncHandler(async(req,res,next)=>{
    try {

        const token = req?.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        if(!token) throw new ApiError(401,"Unauthorized admin request")

        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        
        const admin = await Admin.findById(decodedToken?._id).select("-password")
        if(!admin){
            throw new ApiError(401,"Unauthorized access token")
        }

        req.user = admin
        next()        
    } catch (error) {
        
        throw new ApiError(401,"Something went wrong while verifying access token")
    }
})