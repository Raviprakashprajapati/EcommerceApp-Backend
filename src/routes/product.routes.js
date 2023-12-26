import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
// import { authorizationRole } from "../middlewares/adminAuth.middleware.js";
import { addToCart, createProduct, getAllProduct } from "../controllers/product.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()


router.route("/all-product").get(getAllProduct)
router.route("/add-to-cart/:id").post(verifyJWT,addToCart)



//admin role
router.route("/add-product").post(
    verifyJWT,
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
    createProduct
    )









export default router

