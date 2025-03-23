import express from "express";
import {
  getAllUsers,
  getUserPagination,
  createUser,
  updateUser,
  deleteUser,
  getUserById,
} from "../controllers/user";
import authMiddleware from "../middlewares/auth";

const router = express.Router();

router.get("/", authMiddleware, getAllUsers);
router.get("/pagination", authMiddleware, getUserPagination);
router.get("/:id", authMiddleware, getUserById);
router.post("/", authMiddleware, createUser);
router.put("/:id", authMiddleware, updateUser);
router.delete("/:id", authMiddleware, deleteUser);

export default router;
