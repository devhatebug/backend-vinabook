import express from "express";
import {
  getOrders,
  createOrder,
  deleteOrder,
  getOrderById,
  getOrderPagination,
  updateOrder,
} from "../controllers/order";
import authMiddleware from "../middlewares/auth";

const router = express.Router();

router.get("/get-all", authMiddleware, getOrders);
router.get("/pagination", authMiddleware, getOrderPagination);
router.get("/get-by-id/:id", authMiddleware, getOrderById);
router.post("/", authMiddleware, createOrder);
router.delete("/:id", authMiddleware, deleteOrder);
router.put("/:id", authMiddleware, updateOrder);

export default router;
