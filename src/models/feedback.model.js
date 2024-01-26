import mongoose,{Schema} from "mongoose";

const feedbackSchema = new mongoose.Schema({

    name:{
        type:String
    },
    contact:{
        type:String
    },
    rating:{
        type:String
    },
    feedbackContent:{
        type:String
    }

},{timestamps:true})


export const Feedback = mongoose.model("Feedback",feedbackSchema)