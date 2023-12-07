import mongoose from "mongoose";

const connectDB=async()=>{

    try {

       const connection =  await mongoose.connect(`${process.env.MONGO_URL}/flipkart`)

       console.log(`DB Connected!`)
    //    console.log(connection)
        
    } catch (error) {
        console.log("ERROR IN DATABASE  :"+error)
        process.exit(1)

    }

}

export default connectDB