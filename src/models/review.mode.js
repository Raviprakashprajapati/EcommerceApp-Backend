import mongoose, { Schema } from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        userId:{
            type:Schema.Types.ObjectId,
            ref:"User"
        },
        username:{
            type:String,
            required:true
        },
        name:{
            type:String,
            required:true
        },
        productId:{
            type:Schema.Types.ObjectId,
            ref:"Product"
        },
        comment:{
            type:String,
        },
        rating:{
            type:Number,
            min:1,
            max:5,
            required:true
        }
    }
    ,{timestamps:true})

export const Review = mongoose.model("Review",reviewSchema)