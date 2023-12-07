import mongoose, { Schema } from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        stock: {
            type: Number,
            default: 0
        },
        brand: {
            type: String
        },
        reviews: [
            {
                type: Schema.Types.ObjectId,
                ref: "Review"
            }
        ],
        category: {
            type: String,
            required: true
        },
        subCategory:{
            type:String,
            required: true
        },
        keywords:[
            {
                type:String
            }
        ],
        description: {
            type: String  //\n every line
        },
        images: [
            {
                type: String //cloudionary
            }
        ],
        warranty: {
            type: Number,
            min: 1,
            max: 5,
            default: 0,
        },
        trending: {
            type: Boolean,
            default: false,
        },
        hype:{
            type: Boolean,
            default: false,
        },
        offer: [
            {
            type: String //--\n every line
            }
        ],
        rating:{
            type:Number,
            min:1,
            max:5,
            default:0
        },
        age:{
            type:String,
            enum:["old","new"]
        }
    }
    , { timestamps: true });

export const Product = mongoose.model("Product", productSchema);