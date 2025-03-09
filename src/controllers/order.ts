import Order from "../models/order";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import Book from "../models/book";

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await Order.findAll();
    res.json(orders);
    return;
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy thông tin", error });
    return;
  }
};

export const getOrderPagination = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { page, limit } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const orders = await Order.findAndCountAll({
      limit: Number(limit),
      offset,
    });
    res.json(orders);
    return;
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy thông tin", error });
    return;
  }
};

export const createOrder = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { idBook, nameClient, phoneNumber, address, note } = req.body;

    if (!idBook || !nameClient || !phoneNumber || !address) {
      res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
      return;
    }

    const book = await Book.findByPk(idBook);

    if (!book) {
      res.status(404).json({ message: "Không tìm thấy sách!" });
      return;
    }

    const newOrder = await Order.create({
      id: uuidv4(),
      idBook,
      nameClient,
      phoneNumber,
      address,
      note,
      status: "pending",
    });

    res.json(newOrder);
    return;
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi tạo đơn hàng", error });
    return;
  }
};

export const updateOrder = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({ message: "Vui lòng nhập trạng thái đơn hàng!" });
      return;
    }

    const order = await Order.findByPk(id);

    if (!order) {
      res.status(404).json({ message: "Không tìm thấy đơn hàng!" });
      return;
    }

    await order.update({ status });
    res.json(order);
    return;
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật đơn hàng", error });
    return;
  }
};

export const deleteOrder = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id);

    if (!order) {
      res.status(404).json({ message: "Không tìm thấy đơn hàng!" });
      return;
    }

    await order.destroy();
    res.json({ message: "Xóa đơn hàng thành công!" });
    return;
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa đơn hàng", error });
    return;
  }
};

export const getOrderById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id);

    if (!order) {
      res.status(404).json({ message: "Không tìm thấy đơn hàng!" });
      return;
    }
    const idBook = order.idBook;
    const book = await Book.findByPk(idBook);
    res.status(200).json({ order, book });
    return;
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy thông tin", error });
    return;
  }
};
