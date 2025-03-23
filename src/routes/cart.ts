import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  deleteCartItem,
  payCart,
} from "../controllers/cart";
import authMiddleware from "../middlewares/auth";

const router = express.Router();

router.get("/", authMiddleware, getCart);
router.post("/", authMiddleware, addToCart);
router.put("/:cartId", authMiddleware, updateCartItem);
router.delete("/:cartId", authMiddleware, deleteCartItem);
router.post("/pay", authMiddleware, payCart);

export default router;
