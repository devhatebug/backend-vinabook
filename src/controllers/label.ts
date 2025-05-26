import Label from "../models/label";
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import User from "../models/user";

export const getLabels = async (req: Request, res: Response): Promise<void> => {
    try {
         if (!req.user) {
            res.status(401).json({ message: 'Vui lòng đăng nhập!' });
            return;
        }
        const { userId } = req.user;
        const checkUser = await User.findOne({ where: { id: userId } });
        if (!checkUser) {
            res.status(404).json({ message: 'Vui lòng thử lại!' });
            return;
        }
        if (checkUser.role !== 'admin') {
            res.status(403).json({ message: 'Bạn không có quyền truy cập' });
            return;
        }

        const labels = await Label.findAll();
        res.json(labels);
        return;
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi lấy thông tin',
            error,
        });
        return;
    }
}

export const getLabelsPagination = async (req: Request, res: Response): Promise<void> => {
    try {
         if (!req.user) {
            res.status(401).json({ message: 'Vui lòng đăng nhập!' });
            return;
        }
        const { userId } = req.user;
        const checkUser = await User.findOne({ where: { id: userId } });
        if (!checkUser) {
            res.status(404).json({ message: 'Vui lòng thử lại!' });
            return;
        }
        if (checkUser.role !== 'admin') {
            res.status(403).json({ message: 'Bạn không có quyền truy cập' });
            return;
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const offset = (page - 1) * limit;

        const labels = await Label.findAndCountAll({
            limit,
            offset,
        });

        res.json(labels);
        return;
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi lấy thông tin',
            error,
        });
        return;
    }
}

export const createLabel = async (req: Request, res: Response): Promise<void> => {
    try {
         if (!req.user) {
            res.status(401).json({ message: 'Vui lòng đăng nhập!' });
            return;
        }
        const { userId } = req.user;
        const checkUser = await User.findOne({ where: { id: userId } });
        if (!checkUser) {
            res.status(404).json({ message: 'Vui lòng thử lại!' });
            return;
        }
        if (checkUser.role !== 'admin') {
            res.status(403).json({ message: 'Bạn không có quyền truy cập' });
            return;
        }

        const { name, value, description } = req.body;

        const label = await Label.create({
            id: uuidv4(),
            name,
            value,
            description,
        });

        res.status(201).json({
            label,
            message: 'Thêm nhãn thành công',
        });
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi thêm nhãn',
            error,
        });
    }
}

export const updateLabel = async (req: Request, res: Response): Promise<void> => {
    const labelId = req.params.labelId;
    const { name, value, description } = req.body;

    try {
         if (!req.user) {
            res.status(401).json({ message: 'Vui lòng đăng nhập!' });
            return;
        }
        const { userId } = req.user;
        const checkUser = await User.findOne({ where: { id: userId } });
        if (!checkUser) {
            res.status(404).json({ message: 'Vui lòng thử lại!' });
            return;
        }
        if (checkUser.role !== 'admin') {
            res.status(403).json({ message: 'Bạn không có quyền truy cập' });
            return;
        }

        const label = await Label.findOne({
            where: { id: labelId },
        });

        if (!label) {
            res.status(404).json({
                message: 'Không tìm thấy nhãn',
            });
            return;
        }

        label.name = name;
        label.value = value;
        label.description = description;

        await label.save();

        res.status(200).json({
            label,
            message: 'Cập nhật nhãn thành công',
        });
    } catch (error) {
        res.status(500).json({
            message: 'Lỗi khi cập nhật nhãn',
            error,
        });
    }
}

export const deleteLabel = async (req: Request, res: Response): Promise<void> => {
    try {
         if (!req.user) {
            res.status(401).json({ message: 'Vui lòng đăng nhập!' });
            return;
        }
        const { userId } = req.user;
        const checkUser = await User.findOne({ where: { id: userId } });
        if (!checkUser) {
            res.status(404).json({ message: 'Vui lòng thử lại!' });
            return;
        }
        if (checkUser.role !== 'admin') {
            res.status(403).json({ message: 'Bạn không có quyền truy cập' });
            return;
        }

        const { labelId } = req.params;

        const label = await Label.findOne({
            where: { id: labelId },
        });

        if (!label) {
            res.status(404).json({
                message: 'Không tìm thấy nhãn',
            });
            return;
        }

        await label.destroy();

        res.status(200).json({
            message: 'Xóa nhãn thành công',
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Lỗi khi xóa nhãn',
            error,
        });
    }
}
