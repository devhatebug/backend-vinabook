import express from "express";
import {
  getBooks,
  getBookPagination,
  createBook,
  deleteBook,
  updateBook,
} from "../controllers/book";
import upload from "../config/multer";
import authMiddleware from "../middlewares/auth";

const router = express.Router();

router.get("/get-all", getBooks);
router.get("/pagination", getBookPagination);
router.post("/", upload.single("image"), authMiddleware, createBook);
router.delete("/:id", authMiddleware, deleteBook);
router.put("/:id", upload.single("image"), authMiddleware, updateBook);

export default router;
