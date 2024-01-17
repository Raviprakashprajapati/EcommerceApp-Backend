import { Router } from "express";
import {registerUser,loginUser, logoutUser, refreshAccessToken, deleteCurrentUser, changeCurrentPassword, updateAccountDetails, updateUserAvatar, getCurrentUser, getAllUser, deleteSpecificUser, loginAdmin, registerAdmin, logoutAdmin} from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT, verifyJWTAdmin } from "../middlewares/auth.middleware.js";
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
router.route("/avatar").patch(verifyJWT,upload.fields([{name:"newAvatar",maxCount:1}]),updateUserAvatar)
router.route("/:username").get(verifyJWT,getCurrentUser)
router.route("/delete-current-user").delete(verifyJWT,deleteCurrentUser)

//admin routess
router.route("/admin/register").post(registerAdmin)
router.route("/admin/login").post(loginAdmin)
router.route("/admin/logout").post(logoutAdmin)
router.route("/admin/users").get(verifyJWTAdmin,authorizationRole("admin"),getAllUser)
router.route("/admin/:id").delete(verifyJWTAdmin,authorizationRole("admin"),deleteSpecificUser)



export default router;
