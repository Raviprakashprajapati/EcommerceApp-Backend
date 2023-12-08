import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

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

    if (!profileImageLocalPath) {
        throw new ApiError(400, "ProfileImage is required")
    }

    const profileImage = await uploadOnCloudinary(profileImageLocalPath)

    if (!profileImage) {
        throw new ApiError(400, "ProfileImage is required")
    }


    // console.log(" profileimage  =  ",profileImage)
    const user = await User.create({
        name,
        username: username.toLowerCase(),
        email,
        password,
        contact,
        address,
        profileImage: profileImage
    })

    const createUser = await User.findById(user._id).select(
        " -password -refreshToken "
    )

    if (!createUser) {
        throw new ApiError(500, "Something went wrong while registering")
    }

    return res.status(201).json(
        new ApiResponse(200, createUser, "User registered Successfully")
    )

})

const loginUser = asyncHandler(async (req, res) => {

    //get username,email,password from fronted
    //check validatio-empty
    //check user in database
    //check password validity
    //genrate access token
    //remove sensitive info from the response
    //return repsonse with access token

    const { username, email, password } = req.body;

    if (!username) {
        throw new ApiError(400, "username is required");
    }
    if(!password){ 
    throw new ApiError(400, "password is required");
    }


    const user = await User.findOne({
         username:username.toLowerCase()
    })

    if(!user){
        throw new ApiError(401,"User is not exist")
    }

    const isPasswordCorrect = await User.isPasswordCorrect(password)

    if(!isPasswordCorrect){
        throw new ApiError(401,"Password is not correct")
    }

    //generate access token
    const accessToken = User.generateAccessToken()
    
    return response.status(200).json(
        new ApiResponse(200,{user,accessToken},"Login successfully created")
    )





})


export { registerUser,loginUser }