import mongoose, { Schema } from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        customerName:{
            type:"String",
            required:true,
        },
        contactNumber:{
            type:"String",
            required:true,
        },
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
                productId: {
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