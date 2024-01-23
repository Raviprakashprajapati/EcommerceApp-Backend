import { Router } from "express";
import { verifyJWT, verifyJWTAdmin } from "../middlewares/auth.middleware.js";
import { addAllCartToOrder, addOrder, getAllOrders, getAllOrdersForAdmin, getParticularOrderAdmin, getSingleOrder, removeOrder, updateOrderStatusForAdmin } from "../controllers/order.controller.js";
import { authorizationRole } from "../middlewares/adminAuth.middleware.js";

const router = Router()

router.route("/add-order").post(verifyJWT,addOrder)
router.route("/delete-order/:orderId").delete(verifyJWT,removeOrder)
router.route("/all-orders").get(verifyJWT,getAllOrders)
router.route("/get-order/:id").get(verifyJWT,getSingleOrder)
router.route("/add-cart-order").post(verifyJWT,addAllCartToOrder)

//for admin
router.route("/admin/orders").get(verifyJWTAdmin,authorizationRole("admin"),getAllOrdersForAdmin)
router.route("/admin/update-order-status/:id").patch(verifyJWTAdmin,authorizationRole("admin"),updateOrderStatusForAdmin)
router.route("/admin/orderDetail/:orderId").get(verifyJWTAdmin,authorizationRole("admin"),getParticularOrderAdmin)
export default router;