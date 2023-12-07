import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
    {
        username: {
            username: { type: String, required: true, unique: true,lowercase:true },
            email: { type: String, required: true, unique: true ,lowercase:true },
            password: { type: String, required: true },
            role: { type: String, default: 'admin' },
        }
    }
    , { timestamps: true });

export const Admin = mongoose.model("Admin", adminSchema)