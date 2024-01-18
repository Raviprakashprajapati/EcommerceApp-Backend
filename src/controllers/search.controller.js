import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { Review } from "../models/review.mode.js";
import { Traffic } from "../models/traffic.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const searchProductBy_eletronics = asyncHandler(async(req,res)=>{

    const product = await Product.find({category:"electronics"})
    if(!product){
        throw new ApiError(501,"Products with electronics cannot able to fetched")
    }

    
    return res.status(200).json(
        new ApiResponse(200,product,"products with Electronics fetched")
    )

})

const searchProductBy_clothing = asyncHandler(async(req,res)=>{
    const product  = await Product.find({category:"clothing"})
    if(!product){
        throw new ApiError(501,"Product with Clothing cannot be found")
    }
    return res.status(200).json(
        new ApiResponse(200,product,"Product with Clothes fetched successfully")
    )
})


const searchAllCount = asyncHandler(async(req,res)=>{

    //fetch all user,product,reviews,orders
    const dashboardCount = {
        users:await User.find().count(),
        products:await Product.find().count(),
        reviews:await Review.find().count(),
        orders:await Order.find().count(),  
        traffic:null 
    }

    
    const t = await Traffic.find()
    
    if(!(dashboardCount.users || dashboardCount.products || dashboardCount.reviews || dashboardCount.orders || t ))
    {
        throw new ApiError(501,"Something went wrong while retrieving dashboard information")

    }

    dashboardCount.traffic=t[0]?.count
    
   

    return res.status(200).json(
        new ApiResponse(200,dashboardCount,"dashboardCount Fetched")
    )




})


const searchProductByReq = asyncHandler(async(req,res)=>{
        
    const product = await Product.find(req.body).limit(10).select("name price category title subCategory brand keywords stock rating images discount")
    if(!product){
        throw new ApiError(501,"Product not found")
    }

    return res.status(200).json(
        new ApiResponse(200,product,"All products fetched successfully")
    )


})


export {
    searchProductBy_eletronics,
    searchProductBy_clothing,
    searchAllCount,
    searchProductByReq,
}