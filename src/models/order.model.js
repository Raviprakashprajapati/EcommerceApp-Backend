import mongoose, { Schema, mongo } from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        userId:{
            type:Schema.Types.ObjectId,
            ref:'User'
        },
        products:[
            {
                product: {
                    type: Schema.Types.ObjectId,
                    ref: 'Product'
                },
                quantity: {
                    type: Number,
                    default: 1
                },
                price: {
                    type: Number
                }
            }
        ],
        status:{
            type:String,
            enum:["pending","success"]
        },
        totalAmount:{
            type:Number
        }

    }
    ,{timestamps:true});


export const Order = mongoose.model("Order",orderSchema)