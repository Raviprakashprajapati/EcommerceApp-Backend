
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Product } from "../models/product.model.js";
import { Cart } from "../models/cart.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";



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

    const product = await Product.findById(id)

    if (!product) {
        throw new ApiError(404, "Product not found")
    }

    if (parseInt(product.stock) <= 0) {
        throw new ApiError(401, "Product is not in Stock")
    }

    const { cartsId } = req.user

    let cart;
    let products = []
    if (!cartsId) {
        //create a new cart due to user does not have cart
        products.push({
            productId:id,
            productName:product.name,
            productImage:product.images?.[0],
            quantity:1,
            price:parseInt(product.price)
        })

         cart = await Cart.create({
            userId: req.user._id,
            products,
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
        cart.products.push( {
            productId:id,
            productName:product.name,
            productImage:product.images?.[0],
            quantity:1,
            price:parseInt(product.price)
        })
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

    const product = await Product.findById(id)
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
    
    const productIndex = cart.products.findIndex(product => product.productId.equals(new mongoose.Types.ObjectId(id)));

    if(productIndex === -1){
        throw new ApiError(404,"Product not found in cart") 
    }

    const holdQuantityProduct = cart.products[productIndex].quantity

    //remove product id from cart
    cart.products.splice(productIndex,1);

    //update cart details
    cart.totalItems-=holdQuantityProduct
    cart.totalPrice-=(parseInt(product.price)* holdQuantityProduct)

    await cart.save()

    //incremtn product stock by holdQuantityProduct
    const incrementedProduct = await Product.findByIdAndUpdate(
        id,
        {
            $set:{
                stock:(parseInt(product.stock)+holdQuantityProduct).toString()
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

const incrementCartProductStock = asyncHandler(async(req,res)=>{

    //verify user
    //get productId from req.body
    //check if porductStock is in range or not
    //get cartId from req.user.cartsId
    //search productId from carts products[].productId
    //incremnt quantity 
    //decrement productStock 
    //return response

    const {productId} = req.body
    const {cartsId} = req.user
    if(!productId){
        throw new ApiError(401,"ProductId is missing")
    }

    if(!cartsId){
        throw new ApiError(401,"CartsId is missing")
    }

    const product = await Product.findById({_id: productId})
    if(!product){
        throw new ApiError(401,"Product not found")
    }

    if(parseInt(product.stock)<=0){
        throw new ApiError(401,"product Stock is out of range So you cannot increase quantity of the product")
    }

    const cart = await Cart.findById({_id:cartsId})
    if(!cart){
        throw new ApiError(401,"Something went wrong when finding cart form database")
    }

    const indexOfProductId = cart.products.findIndex(perProduct=>perProduct.productId.equals(new mongoose.Types.ObjectId(productId)))

    if(indexOfProductId === -1){
        throw new ApiError(401,"Unable to find productId in Cart")
    }

    cart.products[indexOfProductId].quantity +=1
    cart.products[indexOfProductId].price+=parseInt(product.price) 

    cart.totalItems+=1
    cart.totalPrice+=parseInt(product.price)

    const updatedCart = await cart.save()
    if(!updatedCart){
        throw new ApiError(501,"Something went wrong while incrementingproduct Quantity in cart")
    }

    product.stock = (parseInt(product.stock)-1).toString()
    if(parseInt(product.stock)<0)
    {
        product.stock = "0"
    }    

    const decrementedProduct = await product.save()
    if(!decrementedProduct){
        throw new ApiError(501,"Something went wrong while decrementing product Stock")
    }

    return res.status(200).json(
        new ApiResponse(200,{},"Product Quantity successfully incremented")
    )

    


})

const decrementCartProductStock = asyncHandler(async(req,res)=>{

    //get productId from req.body
    //get cartsId from req.user
    //check if missing
    //find INDEX of productId in cart Database
    //decrement quantity by 1
    //minus price by product.price
    //now from cart : minus totalItems by 1 & minus product.price from totalPrice
    //INCREMENT product.stock by 1
    //return response

    const {productIdForDecrement} = req.body
    const {cartsId} = req.user
    let productId = productIdForDecrement

    
    if(!productId){
        throw new ApiError(401,"ProductId is missing")
    }

    if(!cartsId){
        throw new ApiError(401,"CartsId is missing")
    }

    const product = await Product.findById({_id: productId})
    if(!product){
        throw new ApiError(401,"Product not found")
    }


    const cart = await Cart.findById({_id:cartsId})
    if(!cart){
        throw new ApiError(401,"Something went wrong when finding cart form database")
    }

    const indexOfProductId = cart.products.findIndex(perProduct=>perProduct.productId.equals(new mongoose.Types.ObjectId(productId)))

    if(indexOfProductId===-1){
        throw new ApiError(401,"Unable to find productId in Cart")
    }

    cart.products[indexOfProductId].quantity -=1
    cart.products[indexOfProductId].price-=parseInt(product.price) 

    cart.totalItems-=1
    cart.totalPrice-=parseInt(product.price)

    const updatedCart = await cart.save()
    if(!updatedCart){
        throw new ApiError(501,"Something went wrong while DecrementingProduct Quantity in cart")
    }

    product.stock = (parseInt(product.stock)+1).toString()
    

    const incrementedProduct = await product.save()
    if(!incrementedProduct){
        throw new ApiError(501,"Something went wrong while incrementing product Stock")
    }

    return res.status(200).json(
        new ApiResponse(200,{},"Product Quantity successfully decremented")
    )

    




})



export {
    addToCart,
    removeFromCart,
    getYourCart,
    incrementCartProductStock,
    decrementCartProductStock,
}