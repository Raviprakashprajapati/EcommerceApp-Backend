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
    
    const {subcategory} = req.params

    const product = await Product.find({subCategory:subcategory}).limit(20)
    if(!product){
        throw new ApiError(501,"Product not found")
    }

    return res.status(200).json(
        new ApiResponse(200,product,"All products fetched successfully")
    )


})


const searchProductByAny = asyncHandler(async(req,res)=>{

    console.log("req.body ",req.body)
    const product  = await Product.find(req.body).limit(20)
    if(!product){
        throw new ApiError(501,"Error while fetching product ")
    }

    return res.status(200).json(
        new ApiResponse(200,product,"ALl product fetched")
    )


})


const searchProductByBar = asyncHandler(async (req, res) => {
    
    const { input } = req.params;

    if (!input) {
        throw new ApiError(401, "Input must be required");
    }

    const searchString = String(input).toLowerCase() // Convert to string

    const product = await Product.find()

    
    if (!product) {
        throw new ApiError(501, "Error while searching for product");
    }
    
    if (product.length === 0) {
        return res.status(200).json(
            new ApiResponse(200, null, "There is no product")
            );
        }
    
    const filterProduct = product.filter((i)=>{
        return Object.values(i).some((v)=>v && typeof v === 'string' && value.toLowerCase().includes(searchString))
    })
   
   
    return res.status(200).json(
        new ApiResponse(200, filterProduct, "Product fetched successfully")
    );
});


const searchGetAllProduct = asyncHandler(async (req, res) =>{

    const products = await Product.find()
    if(!products){
        throw new ApiError(501,"Error while fetching products for search ")
    }

    return res.status(200).json(
        new ApiResponse(200,products,"all products fetched ")
    )

})


const searchByBetPrice = asyncHandler(async(req,res)=>{

    const {minPrice,maxPrice,subCategory} = req.body
    
    if(!(minPrice || maxPrice || subCategory)){
        throw new ApiError(401,"minprice and maxprice must be required")
    }
    
    // const mp = parseFloat(minPrice)
    // const maxp = parseFloat(maxPrice)


      // Query the database using the price range
  const products = await Product.find({subCategory}).select("-description -features -offer")
    if(!products) {
        throw new ApiError(501,"Erorr while searhing product with price")
    }

    
    const updatedProduct = products.filter((i)=>{

        if(parseFloat(i.price)<parseFloat(maxPrice) && parseFloat(i.price)>parseFloat(minPrice)){
            return i
        }
      
        
    })

    return res.status(200).json(
        new ApiResponse(200,updatedProduct,"Priducts with price range fetched successfully")
    )
 
    
})



export {
    searchProductBy_eletronics,
    searchProductBy_clothing,
    searchAllCount,
    searchProductByReq,
    searchProductByAny,
    searchProductByBar,
    searchGetAllProduct,
    searchByBetPrice,
}