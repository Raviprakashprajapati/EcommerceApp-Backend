import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addOrder, getAllOrders, getAllOrdersForAdmin, getSingleOrder, removeOrder, updateOrderStatusForAdmin } from "../controllers/order.controller.js";
import { authorizationRole } from "../middlewares/adminAuth.middleware.js";

const router = Router()

router.route("/add-order").post(verifyJWT,addOrder)
router.route("/delete-order").delete(verifyJWT,removeOrder)
router.route("/all-orders").get(verifyJWT,getAllOrders)
router.route("/get-order/:id").get(verifyJWT,getSingleOrder)

//for admin
router.route("/admin/orders").get(verifyJWT,authorizationRole("admin"),getAllOrdersForAdmin)
router.route("/admin/update-order-status/:id").patch(verifyJWT,authorizationRole("admin"),updateOrderStatusForAdmin)

export default router;