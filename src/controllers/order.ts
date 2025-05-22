import Order from '../models/order';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Book from '../models/book';
import User from '../models/user';
import OrderDetails from '../models/order-details';
import { mailService } from '../config/mail.config';
import { Op } from 'sequelize';
import Label from '../models/label';

export const getOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Vui lòng đăng nhập' });
            return;
        }
        const { userId } = req.user;
        const user = await User.findByPk(userId);
        if (!user) {
            res.status(404).json({ message: 'Không tìm thấy người dùng' });
            return;
        }
        if (user.role !== 'admin') {
            res.status(403).json({ message: 'Bạn không có quyền truy cập' });
            return;
        }

        const orders = await Order.findAll();
        res.json(orders);
        return;
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy thông tin', error });
        return;
    }
};

export const getOrderPagination = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Vui lòng đăng nhập' });
            return;
        }
        const { userId } = req.user;
        const user = await User.findByPk(userId);
        if (!user) {
            res.status(404).json({ message: 'Không tìm thấy người dùng' });
            return;
        }
        if (user.role !== 'admin') {
            res.status(403).json({ message: 'Bạn không có quyền truy cập' });
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
            }),
        });
        return;
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy thông tin', error });
        return;
    }
};

export const createOrder = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Vui lòng đăng nhập!' });
            return;
        }
        const { userId } = req.user;

        const user = await User.findOne({
            where: { id: userId },
        });

        if (!user) {
            res.status(404).json({ message: 'Không tìm thấy người dùng' });
            return;
        }

        const { idBook, nameClient, phoneNumber, address, note, quantity = 1 } = req.body;

        if (!idBook || !nameClient || !phoneNumber || !address) {
            res.status(400).json({
                message: 'Vui lòng nhập đầy đủ thông tin!',
            });
            return;
        }

        const book = await Book.findByPk(idBook);

        if (!book) {
            res.status(404).json({ message: 'Không tìm thấy sách!' });
            return;
        }

        if (typeof book.quantity === 'number' && book.quantity < quantity) {
            res.status(400).json({
                message: `Số lượng sách "${book.name}" không đủ trong kho`,
            });
            return;
        }

        const newOrder = await Order.create({
            id: uuidv4(),
            userId,
            nameClient,
            phoneNumber,
            address,
            note,
            status: 'pending',
        });

        if (book && typeof book.quantity === 'number') {
            await book.decrement('quantity', {
                by: quantity,
            });
        }

        const newOrderDetails = await OrderDetails.create({
            id: uuidv4(),
            orderId: newOrder.id,
            bookId: idBook,
            quantity,
            price: book.price,
        });

        async function createSuccessEmail(): Promise<{
            subject: string;
            text: string;
            html: string;
        }> {
            return {
                subject: 'Cảm ơn bạn đã đặt hàng tại VinaBook',
                text: `Cảm ơn bạn đã đặt hàng tại VinaBook!

Đơn hàng của bạn đã được ghi nhận với các mục sau:
1. Sách: ${book?.name} - Số lượng: ${quantity}

Thông tin khách hàng:
- Tên: ${nameClient}
- Địa chỉ: ${address}
- Số điện thoại: ${phoneNumber}

Chúng tôi sẽ liên hệ với bạn để xác nhận đơn hàng trong thời gian sớm nhất.`,
                html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
  <h2>VinaBook - Xác nhận đơn hàng</h2>
  <p>Xin chào <b>${nameClient}</b>,</p>
  <p>Cảm ơn bạn đã đặt hàng tại <b>VinaBook</b>. Đơn hàng của bạn bao gồm:</p>
  <ul>
    <li>Sách: <b>${book?.name}</b> - Số lượng: <b>${quantity}</b></li>
  </ul>
  <p><b>Thông tin giao hàng:</b></p>
  <ul>
    <li>Địa chỉ: ${address}</li>
    <li>Số điện thoại: ${phoneNumber}</li>
  </ul>
  <p>Chúng tôi sẽ liên hệ sớm để xác nhận và tiến hành giao hàng.</p>
  <p>Trân trọng,</p>
  <p>Đội ngũ VinaBook</p>
</div>`,
            };
        }

        const emailContent = await createSuccessEmail();
        await mailService.sendEmail(
            user.email,
            emailContent.subject,
            emailContent.text,
            emailContent.html
        );

        res.status(200).json({
            status: 'success',
            message: 'Đặt hàng thành công',
            orderItem: {
                id: newOrder.id,
                idBook: idBook,
                nameClient,
                phoneNumber,
                address,
                note,
                status: 'pending',
                quantity,
                price: book.price,
                userId,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

export const updateOrder = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Vui lòng đăng nhập' });
            return;
        }
        const { userId } = req.user;
        const user = await User.findByPk(userId);
        if (!user) {
            res.status(404).json({ message: 'Không tìm thấy người dùng' });
            return;
        }
        if (user.role !== 'admin') {
            res.status(403).json({ message: 'Bạn không có quyền truy cập' });
            return;
        }

        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            res.status(400).json({
                message: 'Vui lòng nhập trạng thái đơn hàng!',
            });
            return;
        }

        const order = await Order.findByPk(id);

        if (!order) {
            res.status(404).json({ message: 'Không tìm thấy đơn hàng!' });
            return;
        }

        const customer = await User.findByPk(order.userId);
        if (!customer) {
            res.status(404).json({ message: 'Không tìm thấy người dùng!' });
            return;
        }

        await order.update({ status });

        // function content email follow status
        type OrderItem = {
            bookId: string;
            quantity: number;
            price: number;
        };

        async function createSuccessEmail(
            orderItems: OrderItem[],
            nameClient: string,
            address: string,
            phoneNumber: string,
            status: string
        ): Promise<{
            subject: string;
            text: string;
            html: string;
        }> {
            const orderListText = orderItems
                .map(
                    (item: OrderItem, idx: number) =>
                        `${idx + 1}. Sách: ${item.bookId} - Số lượng: ${item.quantity}`
                )
                .join('\n');

            const idsBook = orderItems.map((item: OrderItem) => item.bookId);
            const books = await Book.findAll({
                where: { id: idsBook },
            });

            const orderListHtml = orderItems
                .map((item: OrderItem, idx: number) => {
                    const book = books.find((b) => b.id === item.bookId);
                    const bookName = book ? book.name : item.bookId;
                    return `<li>Sách: <b>${bookName}</b> - Số lượng: <b>${item.quantity}</b></li>`;
                })
                .join('');

            let subject = '';
            let introText = '';
            let introHtml = '';

            switch (status) {
                case 'processing':
                    subject = 'VinaBook - Đơn hàng đang được xử lý';
                    introText = `Đơn hàng của bạn đang được xử lý. Chúng tôi sẽ cập nhật sớm khi có tiến triển mới.`;
                    introHtml = `<p>Đơn hàng của bạn hiện đang được <b>xử lý</b>. Chúng tôi sẽ cập nhật tiếp theo khi đơn hàng sẵn sàng để giao.</p>`;
                    break;
                case 'completed':
                    subject = 'VinaBook - Đơn hàng đã giao thành công';
                    introText = `Đơn hàng của bạn đã được giao thành công. Cảm ơn bạn đã mua sắm tại VinaBook!`;
                    introHtml = `<p><b>Đơn hàng đã được giao thành công.</b> Cảm ơn bạn đã mua sắm tại VinaBook!</p>`;
                    break;
                case 'canceled':
                    subject = 'VinaBook - Đơn hàng đã bị hủy';
                    introText = `Rất tiếc! Đơn hàng của bạn đã bị hủy. Nếu có thắc mắc, vui lòng liên hệ với chúng tôi.`;
                    introHtml = `<p><b>Rất tiếc!</b> Đơn hàng của bạn đã bị <b>hủy</b>. Nếu có thắc mắc, vui lòng liên hệ với bộ phận hỗ trợ của chúng tôi.</p>`;
                    break;
                default:
                    subject = 'VinaBook - Cập nhật đơn hàng';
                    introText = `Đơn hàng của bạn đã được cập nhật trạng thái: chờ xử lý.`;
                    introHtml = `<p>Đơn hàng của bạn đã được cập nhật trạng thái: <b>chờ xử lý.</b>.</p>`;
                    break;
            }

            return {
                subject,
                text: `Xin chào ${nameClient || 'quý khách'},

${introText}

Chi tiết đơn hàng:
${orderListText}

Thông tin giao hàng:
- Địa chỉ: ${address}
- Số điện thoại: ${phoneNumber}

Trân trọng,
VinaBook`,
                html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
  <h2>${subject}</h2>
  <p>Xin chào <b>${nameClient || 'quý khách'}</b>,</p>
  ${introHtml}
  <p><b>Chi tiết đơn hàng:</b></p>
  <ul>${orderListHtml}</ul>
  <p><b>Thông tin giao hàng:</b></p>
  <ul>
    <li>Địa chỉ: ${address}</li>
    <li>Số điện thoại: ${phoneNumber}</li>
  </ul>
  <p>Trân trọng,</p>
  <p>Đội ngũ VinaBook</p>
</div>`,
            };
        }

        // Get order details for this order
        const orderDetails = await OrderDetails.findAll({
            where: { orderId: id },
        });
        const orderItems: OrderItem[] = orderDetails.map((detail: any) => ({
            bookId: detail.bookId,
            quantity: detail.quantity,
            price: detail.price,
        }));

        const emailContent = await createSuccessEmail(
            orderItems,
            order.nameClient,
            order.address,
            order.phoneNumber,
            status
        );

        await mailService.sendEmail(
            customer.email,
            emailContent.subject,
            emailContent.text,
            emailContent.html
        );

        res.json(order);
        return;
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Lỗi khi cập nhật đơn hàng', error });
        return;
    }
};

export const deleteOrder = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Vui lòng đăng nhập' });
            return;
        }
        const { userId } = req.user;
        const user = await User.findByPk(userId);
        if (!user) {
            res.status(404).json({ message: 'Không tìm thấy người dùng' });
            return;
        }
        if (user.role !== 'admin') {
            res.status(403).json({ message: 'Bạn không có quyền truy cập' });
            return;
        }

        const { id } = req.params;
        const order = await Order.findByPk(id);

        if (!order) {
            res.status(404).json({ message: 'Không tìm thấy đơn hàng!' });
            return;
        }

        await order.destroy();
        res.json({ message: 'Xóa đơn hàng thành công!' });
        return;
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa đơn hàng', error });
        return;
    }
};

export const getOrderById = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Vui lòng đăng nhập' });
            return;
        }
        const { userId } = req.user;
        const user = await User.findByPk(userId);
        if (!user) {
            res.status(404).json({ message: 'Không tìm thấy người dùng' });
            return;
        }
        if (user.role !== 'admin') {
            res.status(403).json({ message: 'Bạn không có quyền truy cập' });
            return;
        }

        const { id } = req.params;
        const order = await Order.findByPk(id);

        if (!order) {
            res.status(404).json({ message: 'Không tìm thấy đơn hàng!' });
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
        res.status(500).json({ message: 'Lỗi khi lấy thông tin', error });
        return;
    }
};

export const staticOrderOverTime = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Vui lòng đăng nhập' });
            return;
        }
        const { userId } = req.user;
        const user = await User.findByPk(userId);
        if (!user) {
            res.status(404).json({ message: 'Không tìm thấy người dùng' });
            return;
        }
        if (user.role !== 'admin') {
            res.status(403).json({ message: 'Bạn không có quyền truy cập' });
            return;
        }

        const { startDate: startDateStr, endDate: endDateStr } = req.query;

        if (!startDateStr || !endDateStr) {
            res.status(400).json({ message: 'Thiếu startDate hoặc endDate' });
            return;
        }

        const startDate = new Date(startDateStr as string);
        const endDate = new Date(endDateStr as string);

        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        const orders = await Order.findAll({
            where: {
                createdAt: {
                    [Op.gte]: startDate,
                    [Op.lte]: endDate,
                },
            },
            order: [['createdAt', 'ASC']],
        });

        const ordersCountByDate: { [key: string]: number } = {};

        orders.forEach((order) => {
            const dateStr = new Date(order.createdAt).toLocaleDateString(
                'vi-VN',
                {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                }
            );

            ordersCountByDate[dateStr] = (ordersCountByDate[dateStr] || 0) + 1;
        });

        const dateArray: Date[] = [];
        const currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            dateArray.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }

        const data = dateArray.map((date) => {
            const dateStr = date.toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            });

            return {
                time: dateStr,
                value: ordersCountByDate[dateStr] || 0,
            };
        });

        res.json({
            message: 'Thống kê đơn hàng thành công',
            staticData: {
                totalOrders: orders.length,
                data: data,
            },
        });
        return;
    } catch (error) {
        console.error('Lỗi trong staticOrderOverTime:', error);
        res.status(500).json({
            message: 'Lỗi khi lấy thông tin',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
        return;
    }
};

export const getTop10BestSellingBooks = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Vui lòng đăng nhập' });
            return;
        }
        const { userId } = req.user;
        const user = await User.findByPk(userId);
        if (!user) {
            res.status(404).json({ message: 'Không tìm thấy người dùng' });
            return;
        }
        if (user.role !== 'admin') {
            res.status(403).json({ message: 'Bạn không có quyền truy cập' });
            return;
        }

        const { startDate: startDateStr, endDate: endDateStr } = req.query;

        if (!startDateStr || !endDateStr) {
            res.status(400).json({ message: 'Thiếu startDate hoặc endDate' });
            return;
        }

        const startDate = new Date(startDateStr as string);
        const endDate = new Date(endDateStr as string);

        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        const orders = await Order.findAll({
            where: {
                createdAt: {
                    [Op.gte]: startDate,
                    [Op.lte]: endDate,
                },
            },
            order: [['createdAt', 'ASC']],
        });

        const orderIds = orders.map((order) => order.id);

        const orderDetails = await OrderDetails.findAll({
            where: { orderId: orderIds },
        });

        const bookIds = orderDetails.map((detail) => detail.bookId);

        const books = await Book.findAll({
            where: { id: bookIds },
        });

        const salesCount: { [key: string]: number } = {};

        orderDetails.forEach((detail) => {
            salesCount[detail.bookId] =
                (salesCount[detail.bookId] || 0) + detail.quantity;
        });

        const sortedBooks = Object.entries(salesCount)
            .map(([bookId, quantity]) => ({ bookId, quantity }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10);

        const topBooks = sortedBooks.map(async (item) => {
            console.log('item', item);
            const book = books.find((b) => b.id === item.bookId);
            const labels = await Label.findAll();
            return {
                bookId: item.bookId,
                quantity: item.quantity,
                bookName: book ? book.name : 'Không tìm thấy sách',
                price: book ? book.price : 0,
                label: labels
                    .map((label) => {
                        if (book && book.labelId === label.id) {
                            return label.name;
                        }
                        return '';
                    })
                    .filter((label) => label !== '')
                    .join(', '),
            };
        });
        const topBooksResolved = await Promise.all(topBooks);
        topBooksResolved.sort((a, b) => b.quantity - a.quantity);
        res.json({
            message: 'Thống kê quyển sách bán chạy thành công',
            topBooks: topBooksResolved,
        });
        return;
    } catch (error) {
        console.error('Lỗi trong getTop10BestSellingBooks:', error);
        res.status(500).json({
            message: 'Lỗi khi lấy thông tin',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
        return;
    }
};
