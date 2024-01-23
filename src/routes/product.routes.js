import { Router } from "express";
import { verifyJWT, verifyJWTAdmin } from "../middlewares/auth.middleware.js";
import { addReview, createProductForAdmin, dashboardCountAdmin, deleteProduct, deleteReview, getAllProduct, getAllProductForAdmin, getAllProductReviews, getProductDetails, myReviews, updateProductForAdmin } from "../controllers/product.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { authorizationRole } from "../middlewares/adminAuth.middleware.js";
import { addToCart, decrementCartProductStock, getYourCart, incrementCartProductStock, removeFromCart } from "../controllers/cart.controller.js";
import { searchAllCount, searchProductByAny, searchProductByBar, searchProductByReq, searchProductBy_clothing, searchProductBy_eletronics } from "../controllers/search.controller.js";

const router = Router()


router.route("/all-product").get(getAllProduct)
router.route("/product/:id").get(getProductDetails)
router.route("/public-dashboard").get(searchAllCount)


router.route("/add-to-cart/:id").post(verifyJWT,addToCart)
router.route("/remove-from-cart/:id").patch(verifyJWT,removeFromCart)
router.route("/get-cart")
.get(verifyJWT,getYourCart)
.patch(verifyJWT,incrementCartProductStock)
router.route("/decrement-cart")
.patch(verifyJWT,decrementCartProductStock)

router.route("/add-review").post(verifyJWT,addReview)
router.route("/reviews/:productId")
.get(getAllProductReviews)
.delete(verifyJWT,deleteReview)
router.route("/myreviews").get(verifyJWT,myReviews)



//searching routes
router.route("/search/eletronics").get(searchProductBy_eletronics)
router.route("/search/clothing").get(searchProductBy_clothing)
router.route("/search/req/:subcategory").get(searchProductByReq)
router.route("/search/any").post(searchProductByAny)
router.route("/search/:input").get(searchProductByBar)



//admin role
router.route("/admin/add-product").post(
    verifyJWTAdmin,
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
router.route("/admin/products").get(verifyJWTAdmin,authorizationRole("admin"),getAllProductForAdmin)
router.route("/admin/update-product/:id").patch(verifyJWTAdmin,authorizationRole('admin'),updateProductForAdmin)
router.route("/admin/delete-product/:id").delete(verifyJWTAdmin,authorizationRole("admin"),deleteProduct)
router.route("/admin/dashboard").get(verifyJWTAdmin,authorizationRole("admin"),dashboardCountAdmin)








export default router

