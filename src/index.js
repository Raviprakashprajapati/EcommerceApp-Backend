// require("dotenv").config()
import { app } from "./app.js";
import connectDB from "./db/db.js";
import dotenv from "dotenv"

dotenv.config({
    path:"./env"
})


connectDB()
.then((value)=>{

    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is listening on ${process.env.PORT}`)
    })

}).catch((err)=>{
    console.log("ERROR IN DB ", err)
})








