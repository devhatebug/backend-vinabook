import express from "express";
import {
  getMenu,
  createMenu,
  deleteMenu,
  getMenuPagination,
  updateMennu,
} from "../controllers/menu";
import upload from "../config/multer";

const router = express.Router();

router.get("/", getMenu);
router.post("/", upload.single("image"), createMenu);
router.delete("/:id", deleteMenu);
router.get("/pagination", getMenuPagination);
router.put("/:id", upload.single("image"), updateMennu);

export default router;
