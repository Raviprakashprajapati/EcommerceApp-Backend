import mongoose from "mongoose";
import bcrypt from "bcrypt"
import  jwt  from "jsonwebtoken";

const adminSchema = new mongoose.Schema(
    {
       
            username: { type: String, required: true, unique: true,lowercase:true },
            email: { type: String, required: true, unique: true ,lowercase:true },
            password: { type: String, required: true },
            role: { type: String, default: 'admin' },
        
    }
    , { timestamps: true });


adminSchema.pre("save",async function(next){

    this.password = await bcrypt.hash(this.password,10)
    next()
})


adminSchema.methods.isPasswordCorrect = async function(password){
    
    return await bcrypt.compare(password,this.password)
}

adminSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id:this._id,
            username:this.username,
            email:this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

export const Admin = mongoose.model("Admin", adminSchema)