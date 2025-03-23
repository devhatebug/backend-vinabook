import { Response, Request } from "express";
import User from "../models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
      return;
    }

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      res.status(400).json({ message: "Tên đăng nhập đã tồn tại!" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      id: uuidv4(),
      username,
      password: hashedPassword,
      role: "user",
    });

    res.status(201).json({
      message: "Đăng ký thành công!",
      user: {
        id: newUser.id,
        username: newUser.username,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi đăng ký", error });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
      return;
    }

    const user = await User.findOne({ where: { username } });
    if (!user) {
      res
        .status(401)
        .json({ message: "Tên đăng nhập hoặc mật khẩu không đúng!" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res
        .status(401)
        .json({ message: "Tên đăng nhập hoặc mật khẩu không đúng!" });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500).json({ message: "JWT_SECRET is not defined" });
      return;
    }

    const token = jwt.sign({ userId: user.id }, secret as string, {
      expiresIn: "30 days",
    });

    res.status(200).json({
      message: "Đăng nhập thành công!",
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi đăng nhập", error });
  }
};
