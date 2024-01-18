import { Product } from "../models/product.model.js";
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


export {
    searchProductBy_eletronics,
    searchProductBy_clothing,
}