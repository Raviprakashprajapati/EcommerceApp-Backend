import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { deleteCloudinaryImageUrl, uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import { Admin } from "../models/admin.model.js"
import { sendRegisterUserEmail } from "../utils/nodeMailer.js"
import mongoose from "mongoose"

const generatedAccessAndRefreshToken = async (userId) => {

    //accessToken can be sent with the response but 
    //refreshToken save in database to not compare password every time

    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {

        throw new ApiError(500, "Something went wrong while generating Tokens")

    }
}

const generateAccessToken = async(adminUserId)=>{

    //first find AdminId from database
    //generated JWT TOKEN by admin.generatedAccessToken()
    //return {accessToken}

    try {

        const admin = await Admin.findById({_id:adminUserId})
        const accessToken = admin.generateAccessToken()
        return {accessToken}
        
    } catch (error) {
            throw new ApiError(500,"Something went wrong while generating the token for Admin")
    }

}


const registerUser = asyncHandler(async (req, res) => {

    //get user details from fronted
    //validation-empty
    //check if user alreadye exits:username,email
    //check for profileimage
    //upload on cloudinary
    //create user object in database
    //remove password and refersh token field from response
    //check for user craetion
    //return resposne

    //7 fields required
    const { name, username, email, password, contact, address } = req.body

    if ([name, username, email, password, contact, address].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields must be required")
    }

    // console.log("req body ",req.files)

    const existedUser = await User.findOne({
        $or: [{ username, email }]
    })

    if (existedUser) {
        throw new ApiError(400, "User already exists")
    }


    const profileImageLocalPath = req.files?.profileImage[0]?.path



    let profileImage;
    if(profileImageLocalPath){
         profileImage = await uploadOnCloudinary(profileImageLocalPath)
        if (!profileImage) {
            profileImage = null
            throw new ApiError(400, "Error while uploading profile image")
        }
    }
   


    // console.log(" profileimage  =  ",profileImage)
    const user = await User.create({
        name,
        username: username.toLowerCase(),
        email,
        password,
        contact,
        address,
        profileImage
    })

    const createUser = await User.findById(user._id).select(
        " -password -refreshToken "
    )

    if (!createUser) {
        throw new ApiError(500, "Something went wrong while registering")
    }

    //email
    const emailSendOrNot = await sendRegisterUserEmail(user,password)
    let nodeMailer = ""
    if(emailSendOrNot){
        nodeMailer = " || Email Send successfully"
    }

    return res.status(201).json(
        new ApiResponse(200, createUser, `User registered Successfully ${nodeMailer}`)
    )

})

const loginUser = asyncHandler(async (req, res) => {

    //get username,email,password from fronted
    //check validation-empty
    //check user in database
    //check password validity
    //genrate accesstoken and refrehtoken
    //send to cookies

    const { email, username, password } = req.body

    // console.log("payload ", req.body)

    if (!(username || email)) throw new ApiError(401, "username or email is required")

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) throw new ApiError(404, "User is not exist")

    //user has a method of bcrypt and jwt
    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) throw new ApiError(404, "Password is not correct")

    const { accessToken, refreshToken } = await generatedAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    //now cookie can only edit by server
    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User loggedIn successfully"
            )
        )


})

const logoutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "User logged out")
        )



})

const refreshAccessToken = asyncHandler(async (req, res) => {

    //get refreshToken from cookies 
    //decoded token
    //search decoded Userid from database
    //compare refreshToken with get database user refreshToken
    //generate new access and refresh tokens
    //return new access and refresh tokens


    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized Request ")
    }

    try {

        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user._id) {
            throw new ApiError(401, "Refresh Token is expired or used")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = await generatedAccessAndRefreshToken(user._id)

        return res.stats(200)
            .cookie("accessToken", accessToken)
            .cookie("refreshToken", newRefreshToken)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Acces token Refreshed"
                )
            )

    } catch (error) {

        throw new ApiError(401, error?.message)
    }

})

const changeCurrentPassword = asyncHandler(async (req, res) => {

    //get oldpassword and newpassword from USER
    //get _id from auth req.user
    //compare oldpassword with _id database password
    //Save newpassword to database
    //return respond

    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(404, "Invalid password")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res.status(200).json(
        new ApiError(200, {}, "Password updated successfully")
    )



})

const getCurrentUser = asyncHandler(async (req, res) => {

    const id = req.params
    if(!id){
        throw new ApiError(501,"User Id not found")
    }
    const user = await User.findById({_id:new mongoose.Types.ObjectId(id)})
    if(!user){
        throw new ApiError(501,"Error while find current user")
    }


    return res.status(200).json(
        new ApiResponse(200, user, "Current User Fetched Successfully")
    )
})

const updateAccountDetails = asyncHandler(async (req, res) => {

    //get which fields need to be updated
    //check validations
    //find user by _id and update them
    //return response

    const { email, name, address, contact } = req.body

    if (!email || !name || !address  || !contact) {
        throw new ApiError(401, "All Fields Required")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                email, name, address, contact
            }
        },
        { new: true }
    ).select("-password -refreshToken")

    return res.status(200).json(
        new ApiResponse(200,user,"Fields updated successfully")
    )



})

const updateUserAvatar = asyncHandler(async(req,res)=>{

    //get new avatar from req.files?.path
    //upload newAvatar
    //find user and update avatar filed with url
    //return response

    const avatarLocalPath = req.files?.newAvatar[0]?.path

    // const avatarLocalPath = req.files?.path

    if(!avatarLocalPath){
        throw new ApiError(401,"Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar){
        throw new ApiError(400,"Error while uploading avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                profileImage:avatar
            }
        },
        {new:true}
    ).select("-password -refreshToken")

    return res.status(200).json(
        new ApiResponse(200,user,"Avatar updated successfully")
    )

})

const deleteCurrentUser = asyncHandler(async(req,res)=>{

    //get _id of user for deleteing it
    //find user from database
    //delete from database
    //return response

    // console.log(req.user)
    const user  = await User.findById(req.user?._id)

    if(!user){
        throw new ApiError(401,"User does not exist")
    }

    const imageUrl = user?.profileImage
    if(imageUrl){
        deleteCloudinaryImageUrl(imageUrl)
    }

   const result = await User.deleteOne({_id:user._id})

   if (!result) {
    throw new ApiError(401, "User cannot be deleted");
    }

    res.clearCookie("refreshToken")
    res.clearCookie("accessToken")

   return res.status(200).json(
    new ApiResponse(200,{},"User deleted successfully")
   )


})



//admin register/login/logout
const registerAdmin = asyncHandler(async(req,res)=>{

    //get username,email and password
    //check validation
    //create admin
    const {username,email,password} = req.body
    if(!username || !email || !password){
        throw new ApiError(401,"All fields is required")
    }

    const admin = await Admin.create({
        username,
        email,
        password
    })

    if(!admin){
        throw new ApiError(500,"Something went wrong while creating Admin ")
    }

    const registeredAdmin = await Admin.findById(admin._id).select("-password")
    if(!registeredAdmin){
        
        throw new ApiError(500, "Something went wrong while registering Admin")
    }    

    return res.status(200).json(
       new ApiResponse( 200,
        registerAdmin,
        "admin successfully registered")
    )

})

const loginAdmin = asyncHandler(async(req,res)=>{

    //get username or emial with password
    //check validation
    //check admin in database
    //compare password using bcrpyt
    //generate accessToken
    //send to cookies
    const {email,username,password} = req.body
    if(!(username || email)){
        throw new ApiError(401,"username or email is required")
    }

    const admin = await Admin.findOne(
        {
            $or:[{username},{email}]
        }
    )
    
    if(!admin){
        throw new ApiError(404,"Admin does not exist")
    }

    const isPasswordValid = await admin.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401,"Admin password is not incorrect")
    }

    const {accessToken } = await generateAccessToken(admin._id)

    const loginAdmin = await Admin.findById(admin._id).select(("-password"))

    const options = {
        httpOnly:true,
        secure:true
    }

    return res.status(200)
        .cookie("accessToken",accessToken,options)
        .json(
            new ApiResponse(
                200,
                {
                    admin:loginAdmin,
                    accessToken
                },
                "Admin login successfull"
            )
        )

})

const logoutAdmin = asyncHandler(async (req, res) => {

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .clearCookie("accessToken", options)
        .json(
            new ApiResponse(200, {}, "Admin logged out")
        )



})


//admin section
const getAllUser = asyncHandler(async(req,res)=>{

    const user = await User.find();

    return res.status(200).json(
        new ApiResponse(200,user,"All users Fetched successfully")
    )

})

const deleteSpecificUser = asyncHandler(async(req,res)=>{

    //get _id of user for deleteing it
    //find user from database
    //delete from database
    //return response

    const user  = await User.findById(req.params.id)

    if(!user){
        throw new ApiError(401,"User does not exist")
    }

    const imageUrl = user?.profileImage
    if(imageUrl){
        deleteCloudinaryImageUrl(imageUrl)
    }

   const result = await User.deleteOne({_id:user._id})

   if (!result.ok || result.deletedCount === 0) {
    throw new ApiError(401, "User cannot be deleted");
}

   return res.status(200).json(
    new ApiResponse(200,{},"User deleted successfully")
   )


})





export {
       
        registerUser, 
        loginUser, 
        logoutUser, 
        refreshAccessToken, 
        changeCurrentPassword, 
        getCurrentUser,
        updateAccountDetails,
        updateUserAvatar,
        deleteCurrentUser,
        registerAdmin,
        loginAdmin, 
        logoutAdmin,
        getAllUser,
        deleteSpecificUser,
    }