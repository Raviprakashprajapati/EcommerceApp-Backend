import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteCloudinaryImageUrl, uploadOnCloudinary } from "../utils/cloudinary.js";
import { Product } from "../models/product.model.js";
import { Cart } from "../models/cart.model.js";
import { User } from "../models/user.model.js";
import { Review } from "../models/review.mode.js";
import mongoose from "mongoose";
import { Order } from "../models/order.model.js";


//for admin
const createProductForAdmin = asyncHandler(async (req, res) => {

    //get product details from fronted
    //check validation
    //get images from req.files->image01,image02,image03
    //upload on cloidinary 
    //create product in database
    //return response

    //15 details OR  images need to add 
    const { name, price, category, subCategory, brand, description, warranty, offer, age, trending, keywords, hype, title, stock, features, discount } = req.body

    if (!name || !price || !category || !subCategory || !brand || !description || !warranty || !offer || !age || !trending || !keywords || !hype || !title || !stock || !features || !discount) {
        throw new ApiError(401, "All Products Fields must be required")
    }

    const image01localPath = req.files?.image01?.[0]?.path
    const image02localPath = req.files?.image02?.[0]?.path
    const image03localPath = req.files?.image03?.[0]?.path

    if (!image01localPath || !image02localPath || !image03localPath) {
        throw new ApiError(401, "All 3 images of the product required")
    }

    let images = []
    const image01 = await uploadOnCloudinary(image01localPath)
    const image02 = await uploadOnCloudinary(image02localPath)
    const image03 = await uploadOnCloudinary(image03localPath)
    images.push(image01)
    images.push(image02)
    images.push(image03)

    const product = await Product.create({
        name, price, category, subCategory, brand, description, warranty, offer, age, trending, keywords, hype, title, stock, images, features, discount
    })

    if (!product) {
        throw new ApiError(500, "Something went wrong while creating product")
    }

    return res.status(200).json(
        new ApiResponse(200, product, "product added")
    )



})

//for admin
const getAllProductForAdmin = asyncHandler(async(req,res)=>{

    const product = await Product.find()

    if(!product){
        throw new ApiError(500,"Something went wrong while getting all products for admin")
    }

    return res.status(200).json(
        new ApiResponse(200,product,"All products fetched successfully By admin")
    )

})

//for admin
const updateProductForAdmin = asyncHandler(async(req,res)=>{

    //get roduct id from params
    //search for product id in database
    //use patch to change only speific fields

    const {id} = req.params
    if(!id){
        throw new ApiError(401,"Product id is missing")
    }

    const product = await Product.findByIdAndUpdate(id,
        {
            $set:req.body
        },
        {new:true}
        )

    if(!product){
        throw new ApiError(501,"Something went wrong while updating product by Admin ")
    }

    return res.status(200).json(
        new ApiResponse(200,product,"Product updated successfully")
    )

})

//for admin
const deleteProduct = asyncHandler(async(req,res)=>{

    //gget productid from req.params
    //check 
    //FIRST: Cart database has productsId OR not
    //SECOND: Order database has productid OR not (products.product)
    //if NOT then 
    // delete all review from Product.reviews
    //delete image of product
    //return response

    const {id} = req.params
    if(!id){
        throw new ApiError(401,"Product Id is missing")
    }

    const cart = await Cart.findOne({productsId:id})
    if(cart){
        throw new ApiError(401,"Product cannot be deleted Due to someone already cart it") 
    }

    const order = await Order.findOne({"products.product":id})
    if(order){
        throw new ApiError(401,"Order cannot be deleted Due to someone already order it")
    }
    
    //now delete revviews of product

    const product  = await Product.findOne(id)
    if(!product){
        throw new ApiError(401,"Something went wrong while find Product.reviews for deleting the product")
    }
    let reviewsId = []
    for (const i of product.reviews) {
        reviewsId.push(i)
    }

    for(const id of reviewsId){
        const review = await Review.findByIdAndDelete(id)
        if(!review){
            throw new ApiError(401,"Something went wrong while deleting reviews for the product deletion")
        }
    }

    let imagesUrl = []
    for(const url of product.images){
        imagesUrl.push(url)
    }

    for(const url of imagesUrl){
        let image = await deleteCloudinaryImageUrl(url)
    }

    const deletedProduct = await product.remove()
    if(!deletedProduct){
        throw new ApiError(501,"Something went wrong while deleting product")
    }

    

    return res.status(200).json(
        new ApiResponse(200,{},"Product deleted successfully")
    )

})







const getAllProduct = asyncHandler(async (req, res) => {

    //get all product from database
    //select only specific feilds
    //return all products

    const products = await Product.find({}).select("-description -offer -stock -rating -reviews ")

    if (!products) {
        throw new ApiError(500, "Error while getting products features")
    }

    return res.status(200).json(
        new ApiResponse(200, products, "All products has fetched")
    )



})

const getProductDetails = asyncHandler(async(req,res)=>{

    //get product id from params
    //search for this id in database
    //return response

    const {id} = req.params

    if(!id){
        throw new ApiError(401,"Product id is missing")
    }

    const product = await Product.findById(id)

    if(!product){
        throw new ApiError(404,"Product not found")
    }

    return response.status(200).json(
        new ApiResponse(200,product,"Product Details fetched successfully")
    )

})



//carts constrollers
const addToCart = asyncHandler(async (req, res) => {

    //verify JWT user present or not
    //check product is in STOCK or not
    //check user has CART id or not
    //craete CART model and add PRODUCT _id in it
    //DECREMENT STOCK of product 
    //INCREEMET CART totalItems and totalPrice
    //add CART _id to USER cartsId

    const { id } = req.params

    if (!id) {
        throw new ApiError(401, "Product ID is missing")
    }

    const product = await Product.findById(id, "stock price")

    if (!product) {
        throw new ApiError(404, "Product not found")
    }

    if (parseInt(product.stock) == 0) {
        throw new ApiError(401, "Product is not in Stock")
    }

    const { cartsId } = req.user

    let cart;
    
    if (!cartsId) {
        //create a new cart due to user does not have cart
         cart = await Cart.create({
            userId: req.user._id,
            productsId: [id],
            totalItems: 1,
            totalPrice: parseInt(product.price)
        })

        if (!cart) {
            throw new ApiError(401, "Something went wrong while adding productId to NEW CART")
        }

        //add CartId in user cartsId 
        const addCartIdToUser =  await User.findByIdAndUpdate(
            req.user._id,
            { $set: { cartsId: cart._id } },
            { new: true }
        );
    
        if (!addCartIdToUser) {
            throw new ApiError(401, "Error updating user's cartsId");
        }

    } else {
        //user has cartid
         cart = await Cart.findById(req.user?.cartsId)

        if (!cart) {
            throw new ApiError(401, "Something went wrong while adding product to existing CART")
        }

        //update cart details
        cart.productsId.push(id)
        cart.totalItems += 1
        cart.totalPrice = cart.totalPrice + parseInt(product.price)
        await cart.save();

    }

    const decrementProductStock = await Product.findByIdAndUpdate(
        id,
        {
            $set: {
                stock: (parseInt(product.stock) - 1).toString()
            }
        },
        { new: true }
    )

    if (!decrementProductStock) {
        throw new ApiError(401, "Something went wrong while decrementProductStock from database")
    }

    // if (parseInt(decrementProductStock.stock) < parseInt(product.stock)) {
    //     throw new ApiError(401, "Something went wrong while decrementProductStock")

    // }


    return res.status(200).json(
        new ApiResponse(200, {}, "Add To Cart")
    )



})

const removeFromCart = asyncHandler(async(req,res)=>{

    //verify user by JWT
    //get produtc id from params
    //check user has CART ID 
    //find product id from it AND remove it
    //DECREMENT totalItems and totalPrice from Cart
    //increament STOCK of the product

    const {id} = req.params
    if(!id){
        throw new ApiError(401,"Product id is missing")
    }

    const product = await Product.findById(id,"stock price")
    if(!product){
        throw new ApiError(401 ,"Product not found" )
    }

    const {cartsId} = req.user
    if(!cartsId){
        throw new ApiError("401","User does not have a Cart")
    }

    const cart = await Cart.findById(cartsId)
    if(!cart){
        throw new ApiError("401","Cart not found")
    }

    //check if product id is in cart
    const productIndex = cart.productsId.indexOf(id)
    if(productIndex === -1){
        throw new ApiError(404,"Product not found in cart") 
    }

    //remove product id from cart
    cart.productsId.splice(productIndex,1);

    //update cart details
    cart.totalItems-=1
    cart.totalPrice-=parseInt(product.price)

    await cart.save()

    //incremtn product stock by 1
    const incrementedProduct = await Product.findByIdAndUpdate(
        id,
        {
            $set:{
                stock:(parseInt(product.stock)+1).toString()
            }
        },
        {new:true}
    )

    if(!incrementedProduct){
        throw new ApiResponse(401,"Something went wrong while incrementing product Stock")
    }


    return res.status(200).json(
        new ApiResponse(200,{},"Remove From Cart Successful")
    )


})

const getYourCart = asyncHandler(async(req,res)=>{

    //get cartid from req.user
    //check if user has not cart any product yet
    //if user has cartid , check Cart_id from database
    //return response

    const {cartsId} = req.user
    if(!cartsId){
        throw new ApiError(401,"User has not cart any product yet")
    }

    const cart = await Cart.findById(cartsId)
    if(!cart){
        throw new ApiError(401,"user cartid does not exist in Cart database")
    }

    return res.status(200).json(
        new ApiResponse(200,cart,"Cart details Fetched successfully") 
    )



})


//reviews controllers
const addReview = asyncHandler(async(req,res)=>{

    //verify user by req.user
    //get produtcid, content and rating from req.body
    //check productid exist in product database
    //create review in Review database and save productid,userid,content,rating 
    //save reviewId in product reviews[]

    if(!req.user){
        throw new ApiError(404,"User does not exist")
    }

    const {productId,comment, rating} = req.body
    if(!productId || !comment || !rating){
        throw new ApiError(401,"review field are required")
    }    

    const reviewBody={
        userId:req.user._id,
        username:req.user.username,
        name:req.user.name,
        productId:productId,
        comment:comment.trim(),
        rating:Number(rating)
    }

    const product = await Product.findById(productId)
    if(!product){
        throw new ApiError(404,"Product not found")
    }

    const review = await Review.create(reviewBody)
    if(!review){
        throw new ApiError(501,"Something went wrong while saving review in database")
    }

    product.reviews.push(review._id)

    const productUpdated = await product.save()
    if(!productUpdated){
        throw new ApiError(501,"Something went wrong while saving pushing reviewId in product database")
    }

    return res.status(200).json(
        new ApiResponse(200,review,"Review created successfully")
    )

})

const getAllProductReviews = asyncHandler(async(req,res)=>{

    //get productId from req.body
    //FIND productid in Product database
    //check if product has a reviews[]
    //collect all reviews id from product
    //GO TO REVIEW database find all reviewid adn return
    //return response

    const {productId} = req.body
    if(!productId){
        throw new ApiError(401,"ProductId is required")
    }

    const product = await Product.findById(productId,"reviews")
    if(!product){
        throw new ApiError(404,"Product not found in database")
    }

    if(!product.reviews || product.reviews.length==0 ){
        throw new ApiError(401,"Product has no reviews")
    }

    //collect all reviewsId form product.reviews
    // let reviewIdArray = []
    // for (const i of product.reviews) {
    //     reviewIdArray.push(i)
    // }

    //NOTE: aggregate function not implicit add Objectid so we need mongoose.Types
    
    const allReviews = await Product.aggregate([

        {
            $match:{
                _id:new mongoose.Types.ObjectId(productId)
            }
        },
        {
            $project:{
                reviewsId:"$reviews"
            }
        },
        {
            $unwind:"$reviewsId"
        },
        {
            $lookup:{
                from:"reviews",
                localField:"reviewsId",
                foreignField:"_id",
                as:"reviewsDetails"
            }
        },
        {
            $addFields:{
                reviewsDetails:{
                    $arrayElemAt:["$reviewsDetails",0]
                }
            }
        },
        {
            $project:{
                reviewsDetails:1
            }
        }


    ])

    return res.status(200).json(
        new ApiResponse(200,allReviews,"All reviews Fetched successfully") 
    )


})

const deleteReview = asyncHandler(async(req,res)=>{

    //get reviewid from req.body
    //search review id from reviews database
    //delete review from database
    //corresponding delete reviewId from product.reviews[]
    //return response

    const {reviewId} = req.body
    if(!reviewId){
        throw new ApiError(401,"reviewId is required")
    }
    
    // console.log(req.body)
    const review = await Review.findByIdAndDelete({_id:reviewId})
    if(!review){
        throw new ApiError(401,"Something went wrong while findingWithDeleting review from database")
    }

    const product = await Product.findOneAndUpdate(
        {reviews:reviewId},
        {
            $pull:{ reviews:reviewId }
        },
        { new:true }
    )

    if(!product){
        throw new ApiError(401,"Product not found")
    }

    return res.status(200).json(
        new ApiResponse(200,{},"Review deleted successfully")
    )
    

})

const myReviews = asyncHandler(async(req,res)=>{

    //get userId from req.user
    //find all userid match in Reviews database
    //return respond

    const {_id} = req.user
    if(!_id){
        throw new ApiError(401,"UserId is required")
    }

    const reviews = await Review.find({userId:_id})
    if(!reviews){
        throw new ApiError(401,"There are no reviews")
    }

    return res.status(200).json(
        new ApiResponse(200,reviews,"All reviews are Fetched successfully")
    )

})







export {
    createProductForAdmin,
    getAllProductForAdmin,
    updateProductForAdmin,
    deleteProduct,
    getAllProduct,
    getProductDetails,
    addToCart,
    removeFromCart,
    getYourCart,
    addReview,
    getAllProductReviews,
    deleteReview,
    myReviews,
    
}