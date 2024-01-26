import { Feedback } from "../models/feedback.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const writeFeedback = asyncHandler(async(req,res)=>{

    const {name,contact,feedbackContent,rating} = req.body
    if(!(name || contact || feedbackContent || rating)){
        throw new ApiError(401,"All fields are required")
    }

    const feedback = await Feedback.create({
        name,
        contact,
        rating,
        feedbackContent
    })

    if(!feedback){
        throw new ApiError(501,"Error while creating feedback")
    }

    return res.status(200).json(
        new ApiResponse(200,null,"Feedback created")
    )





})


const getFeedback = asyncHandler(async(req,res)=>{

    const feedback = await Feedback.find()
    if(!feedback){
        throw new ApiError(501,"Error while getting feedback")
    }

    return res.status(200).json(
        new ApiResponse(200,feedback,"Feedback fetched")
    )

})



export {
    writeFeedback,
    getFeedback,
}