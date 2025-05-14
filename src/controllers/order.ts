import Order from "../models/order";
import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import Book from "../models/book";
import User from "../models/user";
import OrderDetails from "../models/order-details";

export const getOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Vui lòng đăng nhập" });
            return;
        }
        const { userId } = req.user;
        const user = await User.findByPk(userId);
        if (!user) {
            res.status(404).json({ message: "Không tìm thấy người dùng" });
            return;
        }
        if (user.role !== "admin") {
            res.status(403).json({ message: "Bạn không có quyền truy cập" });
            return;
        }

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
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Vui lòng đăng nhập" });
            return;
        }
        const { userId } = req.user;
        const user = await User.findByPk(userId);
        if (!user) {
            res.status(404).json({ message: "Không tìm thấy người dùng" });
            return;
        }
        if (user.role !== "admin") {
            res.status(403).json({ message: "Bạn không có quyền truy cập" });
            return;
        }

        const { page, limit } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const orders = await Order.findAndCountAll({
            limit: Number(limit),
            offset,
        });
        const orderIds = orders.rows.map((order) => order.id);
        const orderDetails = await OrderDetails.findAll({
            where: { orderId: orderIds },
        });
        res.json({
            count: orders.count,
            rows: orders.rows.map((order) => {
                const details = orderDetails.filter(
                    (detail) => detail.orderId === order.id
                );
                return {
                    ...order.toJSON(),
                    idBook: details[0].bookId,
                    quantity: details[0].quantity,
                    price: details[0].price,
                };
            })
        });
        return;
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy thông tin", error });
        return;
    }
};

export const createOrder = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Vui lòng đăng nhập" });
            return;
        }
        const { userId } = req.user;
        const user = await User.findByPk(userId);
        if (!user) {
            res.status(404).json({ message: "Không tìm thấy người dùng" });
            return;
        }
        if (user.role !== "admin") {
            res.status(403).json({ message: "Bạn không có quyền truy cập" });
            return;
        }

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
            nameClient,
            phoneNumber,
            address,
            note,
            status: "pending",
        });

        const newOrderDetails = await OrderDetails.create({
            id: uuidv4(),
            orderId: newOrder.id,
            bookId: idBook,
            quantity: 1,
            price: book.price,
        })

        res.json({
            ...newOrder,
            idBook: idBook,
            quantity: 1,
            price: book.price,
        });
        return;
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi tạo đơn hàng", error });
        return;
    }
};

export const updateOrder = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Vui lòng đăng nhập" });
            return;
        }
        const { userId } = req.user;
        const user = await User.findByPk(userId);
        if (!user) {
            res.status(404).json({ message: "Không tìm thấy người dùng" });
            return;
        }
        if (user.role !== "admin") {
            res.status(403).json({ message: "Bạn không có quyền truy cập" });
            return;
        }

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
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Vui lòng đăng nhập" });
            return;
        }
        const { userId } = req.user;
        const user = await User.findByPk(userId);
        if (!user) {
            res.status(404).json({ message: "Không tìm thấy người dùng" });
            return;
        }
        if (user.role !== "admin") {
            res.status(403).json({ message: "Bạn không có quyền truy cập" });
            return;
        }

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
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Vui lòng đăng nhập" });
            return;
        }
        const { userId } = req.user;
        const user = await User.findByPk(userId);
        if (!user) {
            res.status(404).json({ message: "Không tìm thấy người dùng" });
            return;
        }
        if (user.role !== "admin") {
            res.status(403).json({ message: "Bạn không có quyền truy cập" });
            return;
        }

        const { id } = req.params;
        const order = await Order.findByPk(id);

        if (!order) {
            res.status(404).json({ message: "Không tìm thấy đơn hàng!" });
            return;
        }
        const orderDetails = await OrderDetails.findAll({
            where: { orderId: id },
        });
        const idBooks = orderDetails.map((item) => item.bookId);
        const books = await Book.findAll({
            where: { id: idBooks },
        });
        res.status(200).json({ order, book: books });
        return;
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy thông tin", error });
        return;
    }
};
