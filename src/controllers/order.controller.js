import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js"

const addOrder = asyncHandler(async(req,res)=>{

    //verify user
    //get productId and userid from req.body
    //FIND productId in database
    //check STOCK of product
    //create Order
    //DECREMENT Stock of product by 1 
    //add orderId in user.ordersId[]
    
    const {_id} = req.user

    const user = await User.findById(_id)
    if(!user) {
        throw new ApiError(401,"Something went wrong while find User for adding OrderId")
    }

    const {productId,quantity} = req.body
    if(!productId){
        throw new ApiError(401,"ProductId is missing")
    }

    const product = await Product.findById({_id: productId})
    if(!product){
        throw new ApiError(404,"Product is not found")
    }

    if(parseInt(product.stock)<=0){
        throw new ApiError(401,"Product is out of stock")
    }

    if(parseInt(product.stock)<parseInt(quantity)){
        throw new ApiError(401,"Product quantity is out of range than stock quantity")
    }

    let products = []
    products.push({
        productName:product.name,
        productId:productId,
        productImage:product.images?.[0],
        quantity:parseInt(quantity),
        price:parseInt(product.price)
    })

    let orderDetails = {
        customerName:req.user.name,
        contactNumber:req.user.contact,
        orderAddress:req.user.address,
        userId:req.user._id,
        status:"pending",
        totalAmount:parseInt(product.price)*parseInt(quantity),
        products
    }

    const order = await Order.create(orderDetails)
    if(!order){
        throw new ApiError(401,"Something went wrong while Order is  creating")
    }

    //decremnt  PRODUCTstock by quantity of product
    product.stock = (parseInt(product.stock)-parseInt(quantity)).toString()
    if(parseInt(product.stock)<0){
        product.stock = "0"
    }

    await product.save()
    user.ordersId.push(order._id)
    await user.save()

    return res.status(200).json(
        new ApiResponse(200,order,"Order has been created successfully")
    )


})

const removeOrder = asyncHandler(async(req,res)=>{

    //verify user first
    //get orderId from req.body
    //get productId from order.products[0]?.productId
    //get userId from req.user
    //check Order status first :if pending then delete
    //delete Order from database
    //INCREMNT product stock by order Quantity
    //delete correspond orderid from user.ordersId[]

    const {_id} = req.user
    const {orderId} = req.body
    if(!orderId){
        throw new ApiError(401,"OrderId is missing")
    }

    
    const order = await Order.findById({_id:orderId})
    if(!order){
        throw new ApiError(401,"Order is not found in database")
    }

   const productId =  order.products?.[0]?.productId
   const quantity = order.products?.[0]?.quantity 
   if(!productId){
        throw new ApiError(401,"Product is not found in  Order database")
    }
    if(!quantity){
        throw new ApiError(401,"Quantity is not found in Order database")
    }

    if(order.status.includes("success")){
        throw new ApiError(401,"Order was already dilevered to the customer")
    }

    const orderDeleted = await Order.findByIdAndDelete(order._id)
    if(!orderDeleted){
        throw new ApiError(501,"Something went wrong while deleting order")
    }

    const productStock = await Product.findById({_id:productId},"stock")
    if(!productStock){
        throw new ApiError(501,"Something went wrong while finding product stock")
    } 

    const product = await Product.findByIdAndUpdate(
        {_id:productId},
        {
            $set:{
                stock:(parseInt(productStock.stock)+parseInt(quantity)).toString()
            }
        },
        {new:true}
    )

    if(!product){
        throw new ApiError(501,"Something went wrong while Increment product stock when order is deleting")
    }

    const user = await User.findByIdAndUpdate(
        _id,
        {
            $pull:{
                ordersId:orderId
            }
        },
        {new:true}
    )

    if(!user){
        throw new ApiError(501,"Something went wrong while deleting orderId from user ")
    }

    return res.status(200).json(
        new ApiResponse(200,{},"Order has been deleted successfully")
    )
    



})

const getAllOrders = asyncHandler(async(req,res)=>{

    //verify user 
    //get all ordersId from user.ordersId[]
    //add all ordersId in ARRAY
    //find all orders using ordersId
    //return it

    const {ordersId} = req.user
    if(!ordersId){
        throw new ApiError(401,"User does not have any orders yet")
    }

    const orders = await Order.find(
        {
            _id:{
                $in:ordersId
            }
        }
    )

    if(!orders){
        throw new ApiError(401,"User does not have any orders")
    }

    return res.status(200).json(
        new ApiResponse(200,orders,"All orders Fetched successfully")
    )

    
})

const getSingleOrder = asyncHandler(async(req,res)=>{

    //verify user
    //get orderid fromm req.params
    //search for orderId in order database
    //return response

    const {id} = req.params
    if(!id){
        throw new ApiError(404,"OrderId is missing")
    }

    const order =  await Order.findById(id)
    if(!order){
        throw new ApiError(401,"Something went wrong while finding order in database")
    }

    return res.status(200).json(
        new ApiResponse(200,order,"Order fetched successfully")
    )

})


//for admin
const getAllOrdersForAdmin = asyncHandler(async(req,res)=>{

    //verify admin
    //fetch all orders
    //return response

    const orders = await Order.find()
    if(!orders){
        throw new ApiError("404","There is no orders ")
    }

    return res.status(200).json(
        new ApiResponse(200,orders,"All orders fetched successfully ")         
    )

})

const updateOrderStatusForAdmin = asyncHandler(async(req,res)=>{

    //get order id from req.params
    //AND get success status from req.body
    //search orders by id
    //update status field from Order database
    //return response

    const {id} = req.params
    const {status} = req.body
    if(!id){
        throw new ApiError(401,"OrderId is missing")
    }

    const order = await Order.findById(id)
    if(!id){
        throw new ApiError(401,"Order is not found in database")
    } 

    order.status = status.toString()

    const updatedOrder = await order.save()
    if(!updatedOrder){
        throw new ApiError(401,"Order update failed")
    }


    return res.status(200).json(
        new ApiResponse(200,{},"Order updated successfully")
    )


})





export {
    addOrder,
    removeOrder,
    getAllOrders,
    getSingleOrder,
    getAllOrdersForAdmin,
    updateOrderStatusForAdmin
}