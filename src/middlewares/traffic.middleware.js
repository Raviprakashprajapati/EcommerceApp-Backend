import { Traffic } from "../models/traffic.model.js"

export const trafficMiddleware = async(req,res,next) =>{
    try {

        const [traffic] = await Traffic.find()
        if(!traffic){
            await Traffic.create({})
        }else{
            traffic.count++
            await traffic.save()
        }

        next()
        
    } catch (error) {
        console.log("Error in traffic middleware ", error)
        next()
    }
}