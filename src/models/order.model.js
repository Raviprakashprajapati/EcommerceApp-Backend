import mongoose, { Schema, mongo } from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        orderAddress:{
            type:"String",
            required:true
        },
        userId:{
            type:Schema.Types.ObjectId,
            ref:'User'
        },
        products:[
            {
                productName:{
                    type:String,
                    required:true
                },
                product: {
                    type: Schema.Types.ObjectId,
                    ref: 'Product',
                    required:true
                },
                productImage:{
                    type:"String"
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