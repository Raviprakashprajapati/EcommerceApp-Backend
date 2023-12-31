import mongoose, { Schema } from "mongoose";

const cartSchema = new mongoose.Schema(
    {
        userId:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        totalItems:{
            type:Number,
            default:0
        },
        products:[
            {
                productId:{
                    type:Schema.Types.ObjectId,
                    ref:"Product",
                    required:true
                },
                productName:{
                    type:String
                },
                productImage:{
                    type:String
                },
                quantity:{
                    type:Number
                },
                price:{
                    type:Number
                }
            }
        ],
        totalPrice:{
            type:Number,
            default:0
        }
    }
    ,{timestamps:true});

export const Cart = mongoose.model("Cart",cartSchema)