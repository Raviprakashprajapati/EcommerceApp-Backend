import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
// import { authorizationRole } from "../middlewares/adminAuth.middleware.js";
import { addReview, addToCart, createProductForAdmin, deleteReview, getAllProduct, getAllProductForAdmin, getAllProductReviews, getProductDetails, getYourCart, removeFromCart, updateProductForAdmin } from "../controllers/product.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { authorizationRole } from "../middlewares/adminAuth.middleware.js";

const router = Router()


router.route("/all-product").get(getAllProduct)
router.route("/product/:id").get(getProductDetails)

router.route("/add-to-cart/:id").post(verifyJWT,addToCart)
router.route("/remove-from-cart/:id").patch(verifyJWT,removeFromCart)
router.route("/get-cart").get(verifyJWT,getYourCart)

router.route("/add-review").post(verifyJWT,addReview)
router.route("/reviews")
.get(getAllProductReviews)
.delete(verifyJWT,deleteReview)

//admin role
router.route("/admin/add-product").post(
    verifyJWT,
    authorizationRole("admin"),
    upload.fields([
        {
            name: "image01",
            maxCount: 1
        },
        {
            name: "image02",
            maxCount: 1
        },
        {
            name: "image03",
            maxCount: 1
        }
    ]),
    createProductForAdmin
    )
router.route("/admin/products").get(verifyJWT,authorizationRole("admin"),getAllProductForAdmin)
router.route("/admin/update-product/:id").patch(verifyJWT,authorizationRole('admin'),updateProductForAdmin)









export default router

