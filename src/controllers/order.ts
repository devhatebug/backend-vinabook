import Order from '../models/order';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Book from '../models/book';
import User from '../models/user';
import OrderDetails from '../models/order-details';
import { mailService } from '../config/mail.config';

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

        const { idBook, nameClient, phoneNumber, address, note, idUser } =
            req.body;

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

        const newOrder = await Order.create({
            id: uuidv4(),
            userId: idUser,
            nameClient,
            phoneNumber,
            address,
            note,
            status: 'pending',
        });

        const newOrderDetails = await OrderDetails.create({
            id: uuidv4(),
            orderId: newOrder.id,
            bookId: idBook,
            quantity: 1,
            price: book.price,
        });

        res.json({
            ...newOrder,
            idBook: idBook,
            quantity: 1,
            price: book.price,
            userId: idUser,
        });
        return;
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi tạo đơn hàng', error });
        return;
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
