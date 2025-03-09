import express from "express";
import {
  getOrders,
  createOrder,
  deleteOrder,
  getOrderById,
  getOrderPagination,
  updateOrder,
} from "../controllers/order";

const router = express.Router();

router.get("/get-all", getOrders);
router.get("/pagination", getOrderPagination);
router.get("/get-by-id/:id", getOrderById);
router.post("/", createOrder);
router.delete("/:id", deleteOrder);
router.put("/:id", updateOrder);

export default router;
