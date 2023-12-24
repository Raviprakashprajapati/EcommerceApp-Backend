import { ApiError } from "../utils/ApiError.js"

export const authorizationRole=(role)=>{

    return (req,res,next)=>{
        if(!role.includes(req.user.role)){
            throw new ApiError(401,`Role: ${req.user.role} is not allowed to access this resource`); 
        }
        next()
    }

}