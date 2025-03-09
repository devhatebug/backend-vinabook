import express from "express";
import {
  getBooks,
  getBookPagination,
  createBook,
  deleteBook,
  updateBook,
} from "../controllers/book";
import upload from "../config/multer";

const router = express.Router();

router.get("/get-all", getBooks);
router.get("/pagination", getBookPagination);
router.post("/", upload.single("image"), createBook);
router.delete("/:id", deleteBook);
router.put("/:id", upload.single("image"), updateBook);

export default router;
