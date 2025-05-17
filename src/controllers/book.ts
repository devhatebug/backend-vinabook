import Book from '../models/book';
import { Request, Response } from 'express';
import imagekit from '../config/imagekit';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/user';
import Label from '../models/label';

export const getBooks = async (req: Request, res: Response): Promise<void> => {
    try {
        const books = await Book.findAll();
        const labelIds = books.map((book) => book.labelId);
        const labels = await Label.findAll({
            where: {
                id: labelIds,
            },
        });
        res.json({
            message: 'Lấy danh sách sách thành công',
            data: books.map((book) => ({
                ...book.toJSON(),
                label: labels.find((label) => label.id === book.labelId)?.name,
            })),
        });
        return;
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi lấy thông tin',
            error,
        });
        return;
    }
};

export const getBookPagination = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { page, limit } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        const books = await Book.findAndCountAll({
            limit: Number(limit),
            offset,
        });
        const labelIds = books.rows.map((book) => book.labelId);
        const labels = await Label.findAll({
            where: {
                id: labelIds,
            },
        });
        res.json({
            message: 'Lấy danh sách sách thành công',
            data: books.rows.map((book) => ({
                ...book.toJSON(),
                label: labels.find((label) => label.id === book.labelId)?.name,
            })),
            total: books.count,
            totalPages: Math.ceil(books.count / Number(limit)),
            currentPage: Number(page),
        });
        return;
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi lấy thông tin',
            error,
        });
        return;
    }
};

export const createBook = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(403).json({
                message: 'Vui lòng đăng nhập!',
            });
            return;
        }

        const { userId } = req.user;

        const checkUser = await User.findOne({ where: { id: userId } });
        if (!checkUser) {
            res.status(404).json({ message: 'Vui lòng thử lại!' });
            return;
        }
        if (checkUser.role !== 'admin') {
            res.status(403).json({
                message: 'Bạn không có quyền truy cập',
            });
            return;
        }

        const { name, price, description, labelId, quantity } = req.body;
        const imageFile = req.file;

        if (
            !name ||
            !price ||
            !description ||
            !imageFile ||
            !labelId ||
            !quantity
        ) {
            res.status(400).json({
                message: 'Vui lòng nhập đầy đủ thông tin!',
            });
            return;
        }

        const uploadedImage = await imagekit.upload({
            file: imageFile.buffer.toString('base64'),
            fileName: imageFile.originalname,
            folder: '/vinabook/book_images',
        });

        const newBook = await Book.create({
            id: uuidv4(),
            name,
            price,
            description,
            image: uploadedImage.url,
            type: 'new',
            labelId,
            quantity: Number(quantity),
        });

        res.status(201).json({
            message: 'Tạo sách thành công!',
            data: newBook,
        });
        return;
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi tạo sách', error });
        return;
    }
};

export const updateBook = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(403).json({
                message: 'Vui lòng đăng nhập!',
            });
            return;
        }
        const { userId } = req.user;
        const checkUser = await User.findOne({ where: { id: userId } });
        if (!checkUser) {
            res.status(404).json({ message: 'Vui lòng thử lại!' });
            return;
        }
        if (checkUser.role !== 'admin') {
            res.status(403).json({
                message: 'Bạn không có quyền truy cập',
            });
            return;
        }

        const { id } = req.params;
        const { name, price, description, type, labelId, quantity } = req.body;
        const imageFile = req.file;

        if (!name || !price || !description || !type || !labelId || !quantity) {
            res.status(400).json({
                message: 'Vui lòng nhập đầy đủ thông tin!',
            });
            return;
        }

        const book = await Book.findByPk(id);
        if (!book) {
            res.status(404).json({
                message: 'Không tìm thấy sách',
            });
            return;
        }
        let uploadedImage = { url: '' };

        if (imageFile) {
            uploadedImage = await imagekit.upload({
                file: imageFile.buffer.toString('base64'),
                fileName: imageFile.originalname,
                folder: '/vinabook/book_images',
            });
        }

        await book.update({
            name,
            price,
            description,
            image:
                uploadedImage.url.length > 0 ? uploadedImage.url : book.image,
            type,
            labelId,
            quantity: Number(quantity),
        });

        res.json({ message: 'Cập nhật sách thành công!' });
        return;
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi cập nhật sách',
            error,
        });
        return;
    }
};

export const deleteBook = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(403).json({
                message: 'Vui lòng đăng nhập!',
            });
            return;
        }
        const { userId } = req.user;
        const checkUser = await User.findOne({ where: { id: userId } });
        if (!checkUser) {
            res.status(404).json({ message: 'Vui lòng thử lại!' });
            return;
        }
        if (checkUser.role !== 'admin') {
            res.status(403).json({
                message: 'Bạn không có quyền truy cập',
            });
            return;
        }

        const { id } = req.params;
        const book = await Book.findByPk(id);
        if (!book) {
            res.status(404).json({
                message: 'Không tìm thấy sách',
            });
            return;
        }

        await book.destroy();
        res.json({ message: 'Xóa sách thành công!' });
        return;
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa sách', error });
        return;
    }
};

export const getAllLabels = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const books = await Book.findAll();
        const labels = books.map((book) => book.labelId);
        const dataLabels = await Label.findAll({
            where: {
                id: labels,
            },
        });
        const names = dataLabels.map((label) => label.name);
        res.json({
            message: 'Lấy danh sách nhãn thành công',
            data: names,
        });
    } catch (error) {
        throw new Error('Lỗi khi lấy danh sách nhãn');
    }
};
