import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Product } from "../models/product.model.js";
import { Cart } from "../models/cart.model.js";
import { User } from "../models/user.model.js";

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



export {
    createProductForAdmin,
    getAllProductForAdmin,
    updateProductForAdmin,
    getAllProduct,
    getProductDetails,
    addToCart,
    removeFromCart,
}