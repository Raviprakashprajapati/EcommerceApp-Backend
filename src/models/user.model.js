import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            index:true
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true
        },
        name:{
            type:String,
            required:true,
            trim:true
        },
        address:{
            type:String,
            required:true
        },
        contact:{
            type:String,
            required:true
        },

        role:{
            type:String,
            default:'customer' //customer || admin
        },
        profileImage:{
            type:String //cloudinary Url
        },
       
        password:{
            type:String,
            required:[true,"password is required"]
        },
        ordersId:
            {
                type:Schema.Types.ObjectId,
                ref:"Order"
            },
        cartsId:
            {
                type:Schema.Types.ObjectId,
                ref:"Cart"
            },
            
        refreshToken:{
            type:String
        }
    }
    ,{timestamps:true});



//password bcrpty code
userSchema.pre("save",async function(next){

    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password,10)
    next();
})



//compare db password same ,time of login
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password)
}


//JWT
userSchema.methods.generateAccessToken =  function(){
    return jwt.sign(
        {
            _id:this._id,
            username:this.username,
            email:this.email,
            name:this.name,
            ordersId:this.ordersId,
            cartsId:this.cartsId

        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }

    )
}


userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id:this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}



export const User = mongoose.model("User",userSchema);
