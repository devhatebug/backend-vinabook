import { Response, Request } from "express";
import User from "../models/user";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(403).json({ message: "Vui lòng đăng nhập!" });
      return;
    }
    const { userId } = req.user;
    const checkUser = await User.findOne({ where: { id: userId } });
    if (!checkUser) {
      res.status(404).json({ message: "Vui lòng thử lại!" });
      return;
    }

    if (checkUser.role !== "admin") {
      res.status(403).json({ message: "Bạn không có quyền truy cập" });
      return;
    }

    const users = await User.findAll();
    res
      .status(200)
      .json({ users, message: "Lấy danh sách người dùng thành công!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy danh sách người dùng", error });
  }
};

export const getUserPagination = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(403).json({ message: "Vui lòng đăng nhập!" });
      return;
    }
    const { userId } = req.user;
    const checkUser = await User.findOne({ where: { id: userId } });
    if (!checkUser) {
      res.status(404).json({ message: "Vui lòng thử lại!" });
      return;
    }

    if (checkUser.role !== "admin") {
      res.status(403).json({ message: "Bạn không có quyền truy cập" });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const offset = (page - 1) * limit;

    const users = await User.findAndCountAll({
      limit,
      offset,
    });

    res.status(200).json({
      users: users.rows,
      totalPages: Math.ceil(users.count / limit),
      currentPage: page,
      message: "Lấy danh sách người dùng thành công!",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy danh sách người dùng", error });
  }
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(403).json({ message: "Vui lòng đăng nhập!" });
      return;
    }
    const { userId } = req.user;
    const checkUser = await User.findOne({ where: { id: userId } });
    if (!checkUser) {
      res.status(404).json({ message: "Vui lòng thử lại!" });
      return;
    }

    if (checkUser.role !== "admin") {
      res.status(403).json({ message: "Bạn không có quyền truy cập" });
      return;
    }

    const { id } = req.params;

    const user = await User.findOne({ where: { id } });

    if (!user) {
      res.status(404).json({ message: "Người dùng không tồn tại!" });
      return;
    }

    res.status(200).json({
      user,
      message: "Lấy thông tin người dùng thành công!",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy thông tin người dùng", error });
  }
};

export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(403).json({ message: "Vui lòng đăng nhập!" });
      return;
    }
    const { userId } = req.user;
    const checkUser = await User.findOne({ where: { id: userId } });
    if (!checkUser) {
      res.status(404).json({ message: "Vui lòng thử lại!" });
      return;
    }

    if (checkUser.role !== "admin") {
      res.status(403).json({ message: "Bạn không có quyền truy cập" });
      return;
    }

    const { username, password, role } = req.body;

    const existingUser = await User.findOne({ where: { username } });

    if (existingUser) {
      res.status(400).json({ message: "Tên người dùng đã tồn tại!" });
      return;
    }

    if (!username || !password || !role) {
      res.status(400).json({ message: "Vui lòng nhập đủ thông tin!" });
      return;
    }

    if (role !== "admin" && role !== "user") {
      res.status(400).json({ message: "Vai trò không hợp lệ!" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      id: uuidv4(),
      username,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      user: newUser,
      message: "Tạo người dùng thành công!",
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi tạo người dùng", error });
  }
};

export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(403).json({ message: "Vui lòng đăng nhập!" });
      return;
    }
    const { userId } = req.user;
    const checkUser = await User.findOne({ where: { id: userId } });
    if (!checkUser) {
      res.status(404).json({ message: "Vui lòng thử lại!" });
      return;
    }

    if (checkUser.role !== "admin") {
      res.status(403).json({ message: "Bạn không có quyền truy cập" });
      return;
    }

    const { id } = req.params;
    const { username, role } = req.body;

    const user = await User.findOne({ where: { id } });

    if (!user) {
      res.status(404).json({ message: "Người dùng không tồn tại!" });
      return;
    }

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser && existingUser.id !== id) {
      res.status(400).json({ message: "Tên người dùng đã tồn tại!" });
      return;
    }

    await User.update({ username, role }, { where: { id } });

    res.status(200).json({
      message: "Cập nhật người dùng thành công!",
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật người dùng", error });
  }
};

export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(403).json({ message: "Vui lòng đăng nhập!" });
      return;
    }
    const { userId } = req.user;
    const checkUser = await User.findOne({ where: { id: userId } });
    if (!checkUser) {
      res.status(404).json({ message: "Vui lòng thử lại!" });
      return;
    }

    if (checkUser.role !== "admin") {
      res.status(403).json({ message: "Bạn không có quyền truy cập" });
      return;
    }

    const { id } = req.params;

    const user = await User.findOne({ where: { id } });

    if (!user) {
      res.status(404).json({ message: "Người dùng không tồn tại!" });
      return;
    }

    await User.destroy({ where: { id } });

    res.status(200).json({
      message: "Xóa người dùng thành công!",
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa người dùng", error });
  }
};
