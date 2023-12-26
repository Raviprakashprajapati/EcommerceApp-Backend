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
        productsId:[
            {
                type:Schema.Types.ObjectId,
                ref:"Product",
                required:true
            }
        ],
        totalPrice:{
            type:Number,
            default:0
        }
    }
    ,{timestamps:true});

export const Cart = mongoose.model("Cart",cartSchema)