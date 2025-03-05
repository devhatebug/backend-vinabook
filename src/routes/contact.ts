import express from "express";
import {
  getContact,
  getContactPagination,
  createContact,
  deleteContact,
} from "../controllers/contact";

const router = express.Router();

router.get("/", getContact);
router.post("/", createContact);
router.delete("/:id", deleteContact);
router.get("/pagination", getContactPagination);

export default router;
