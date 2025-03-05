import { Request, Response } from "express";
import Menu from "../models/menu";
import imagekit from "../config/imagekit";
import { v4 as uuidv4 } from "uuid";

export const getMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    const menu = await Menu.findAll();
    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy thông tin", error });
  }
};

export const getMenuPagination = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { page, limit } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const menu = await Menu.findAndCountAll({
      limit: Number(limit),
      offset,
    });
    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy thông tin", error });
  }
};

export const createMenu = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { name, price } = req.body;
    const imageFile = req.file;

    if (!name || !price || !imageFile) {
      res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
      return;
    }

    const uploadedImage = await imagekit.upload({
      file: imageFile.buffer.toString("base64"),
      fileName: imageFile.originalname,
      folder: "/casa_coffee/menu_images",
    });

    const newMenu = await Menu.create({
      id: uuidv4(),
      name,
      price,
      image: uploadedImage.url,
    });

    res.status(201).json({
      message: "Tạo menu thành công!",
      data: newMenu,
    });
    return;
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
    return;
  }
};

export const updateMennu = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, price } = req.body;
    const imageFile = req.file;

    if (!name || !price || !imageFile) {
      res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
      return;
    }

    const uploadedImage = await imagekit.upload({
      file: imageFile.buffer.toString("base64"),
      fileName: imageFile.originalname,
      folder: "/casa_coffee/menu_images",
    });

    const updatedMenu = await Menu.update(
      {
        name,
        price,
        image: uploadedImage.url,
      },
      { where: { id } },
    );

    res.json({
      message: "Cập nhật menu thành công!",
      data: updatedMenu,
    });
    return;
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
    return;
  }
};

export const deleteMenu = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedMenu = await Menu.destroy({ where: { id } });

    res.json({
      message: "Xóa menu thành công!",
      data: deletedMenu,
    });
    return;
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
    return;
  }
};
