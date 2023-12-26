import { Router } from "express";
import {registerUser,loginUser, logoutUser, refreshAccessToken, deleteCurrentUser, changeCurrentPassword, updateAccountDetails, updateUserAvatar, getCurrentUser, getAllUser, deleteSpecificUser} from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizationRole } from "../middlewares/adminAuth.middleware.js";
const router = Router()

//http://localhost:8000/
router.route("/register").post(
    upload.fields([
        {
            name:"profileImage",
            maxCount:1
        }
    ])
    ,
    registerUser
)
router.route("/login").post(loginUser)

router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT,changeCurrentPassword)
router.route("/update-account").post(verifyJWT,updateAccountDetails)
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)
router.route("/c/:username").get(verifyJWT,getCurrentUser)
router.route("/delete-current-user").delete(verifyJWT,deleteCurrentUser)

//admin routess
router.route("/admin/users").get(verifyJWT,authorizationRole("admin"),getAllUser)
router.route("/admin/:id").delete(verifyJWT,authorizationRole("admin"),deleteSpecificUser)



export default router;
