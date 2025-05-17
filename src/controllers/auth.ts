import { Response, Request } from 'express';
import User from '../models/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, username, password } = req.body;

        if (!username || !password || !email) {
            res.status(400).json({
                message: 'Vui lòng nhập đầy đủ thông tin!',
            });
            return;
        }

        // Kiểm tra định dạng tên đăng nhập
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!usernameRegex.test(username)) {
            res.status(400).json({
                message: 'Tên đăng nhập không hợp lệ! (3-20 ký tự, chỉ chứa chữ cái, số và dấu gạch dưới)',
            });
            return;
        }

        // Kiểm tra định dạng email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({
                message: 'Email không hợp lệ!',
            });
            return;
        }

        // Kiểm tra độ dài mật khẩu
        if (password.length < 8) {
            res.status(400).json({
                message: 'Mật khẩu phải có ít nhất 8 ký tự!',
            });
            return;
        }

        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
            res.status(400).json({ message: 'Email đã tồn tại!' });
            return;
        }

        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            res.status(400).json({ message: 'Tên đăng nhập đã tồn tại!' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            id: uuidv4(),
            email,
            username,
            password: hashedPassword,
            role: 'user',
        });

        res.status(201).json({
            message: 'Đăng ký thành công!',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi đăng ký', error });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            res.status(400).json({
                message: 'Vui lòng nhập đầy đủ thông tin!',
            });
            return;
        }

        const checkUsername = await User.findOne({ where: { username } });
        const checkEmail = await User.findOne({ where: { email: username } });
        if (!checkUsername && !checkEmail) {
            res.status(401).json({
                message: 'Tên đăng nhập hoặc mật khẩu không đúng!',
            });
            return;
        }

        const user = checkUsername || checkEmail;
        if (!user || !user.password) {
            res.status(401).json({
                message: 'Tên đăng nhập hoặc mật khẩu không đúng!',
            });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({
                message: 'Tên đăng nhập hoặc mật khẩu không đúng!',
            });
            return;
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            res.status(500).json({ message: 'JWT_SECRET is not defined' });
            return;
        }

        const token = jwt.sign({ userId: user.id }, secret as string, {
            expiresIn: '30 days',
        });

        res.status(200).json({
            message: 'Đăng nhập thành công!',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi đăng nhập', error });
    }
};
