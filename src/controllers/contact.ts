import Contact from "../models/contact";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

export const getContact = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const contact = await Contact.findAll();
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy thông tin", error });
  }
};

export const getContactPagination = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { page, limit } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const contact = await Contact.findAndCountAll({
      limit: Number(limit),
      offset,
    });
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy thông tin", error });
  }
};

export const createContact = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { name, phone, message } = req.body;

    if (!name || !phone || !message) {
      res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
      return;
    }

    const newContact = await Contact.create({
      id: uuidv4(),
      name,
      phone,
      message,
    });

    res.status(201).json({
      message: "Tạo liên hệ thành công!",
      data: newContact,
    });
    return;
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi tạo liên hệ", error });
  }
};

export const deleteContact = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const contact = await Contact.findByPk(id);

    if (!contact) {
      res.status(404).json({ message: "Liên hệ không tồn tại!" });
      return;
    }

    await contact.destroy();
    res.json({ message: "Xóa liên hệ thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa liên hệ", error });
  }
};
