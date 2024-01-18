import mongoose, { Schema } from "mongoose";

const trafficSchema = new mongoose.Schema({

    count:{
        type:Number,
        default:0
    }

},{timestamps:true})

export const Traffic = mongoose.model('Traffic',trafficSchema)