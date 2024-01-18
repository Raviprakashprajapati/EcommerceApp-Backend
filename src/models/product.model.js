import mongoose, { Schema } from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        price: {
            type: String,
            required: true
        },
        discount:{
            type:String
        },
        category: {
            type: String,
            enum: ["electronics", "clothing", "furniture", "beauty", "book", "sports", "toys", "health", "software"],
            required: true
        },
        title: {
            type: String,
            // required: true
        },
        subCategory: {
            type: String,
            required: true
        },
        features:{
            type:String
        },

        brand: {
            type: String
        },
        keywords:
        {
            type: String
        },
        description: 
            {
                type: String  //\n every line
            },
        

        warranty: {
            type: Number,
            min: 0,
            max: 5,
            default: 0,
        },
        age: {
            type: String,
            enum: ["old", "new"]
        },
        trending: {
            type: Boolean,
            default: false,
        },
        hype: {
            type: Boolean,
            default: false,
        },
        offer:
            
                {
                    type: String //--\n every line
                },
            
        stock: {
            type: String,
            required: true
        },
        images: [
            {
                type: String //cloudionary
            }
        ],
        rating: {
            type: Number,
            min: 1,
            max: 5,
            default: 1
        },

        reviews: [
            {
                type: Schema.Types.ObjectId,
                ref: "Review"
            }
        ],

    }
    , { timestamps: true });

export const Product = mongoose.model("Product", productSchema);