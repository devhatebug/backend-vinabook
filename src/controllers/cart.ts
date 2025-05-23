import { Response, Request } from 'express';
import Cart from '../models/cart';
import User from '../models/user';
import Book from '../models/book';
import { v4 as uuidv4 } from 'uuid';
import Order from '../models/order';
import OrderDetails from '../models/order-details';
import { mailService } from '../config/mail.config';
import PointPurchase from '../models/point-purchase';
import { caculatorLevelUser } from '../utils/caculator-level-user';

export const getCart = async (req: Request, res: Response): Promise<void> => {
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

        const cart = await Cart.findAll({
            where: { userId },
            include: [
                {
                    model: Book,
                    as: 'book',
                    attributes: ['id', 'name', 'image', 'price'],
                },
            ],
        });

        res.status(200).json({ cart, message: 'Lấy giỏ hàng thành công' });
        return;
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ message: 'Lỗi server' });
        return;
    }
};

export const addToCart = async (req: Request, res: Response): Promise<void> => {
    const { bookId } = req.body;

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

        const book = await Book.findOne({
            where: { id: bookId },
        });

        if (!book) {
            res.status(404).json({ message: 'Không tìm thấy sách' });
            return;
        }

        const checkItemCart = await Cart.findOne({
            where: { bookId, userId },
        });

        if (checkItemCart) {
            await checkItemCart.increment('quantity', {
                by: 1,
            });
            res.status(200).json({
                message: 'Thêm sách vào giỏ hàng thành công',
                cartItem: {
                    ...checkItemCart.toJSON(),
                    quantity: checkItemCart.quantity + 1,
                },
            });
            await checkItemCart.reload();
            return;
        }

        const cartItem = await Cart.create({
            id: uuidv4(),
            userId,
            bookId,
            status: 'pending',
            quantity: 1,
        });

        res.status(201).json({
            cartItem,
            message: 'Thêm vào giỏ hàng thành công',
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateCartItem = async (
    req: Request,
    res: Response
): Promise<void> => {
    const cartItemId = req.params.cartId;
    const { quantity } = req.body;

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

        const cartItem = await Cart.findOne({
            where: { id: cartItemId, userId },
        });

        if (!cartItem) {
            res.status(404).json({
                message: 'Không tìm thấy sản phẩm trong giỏ hàng',
            });
            return;
        }

        if (quantity < 1) {
            await cartItem.destroy();
            res.status(200).json({
                message: 'Xóa sản phẩm khỏi giỏ hàng thành công',
            });
            return;
        }

        await cartItem.update({ quantity });
        await cartItem.reload();

        res.status(200).json({
            cartItem,
            message: 'Cập nhật giỏ hàng thành công',
        });
        return;
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
        return;
    }
};

export const deleteCartItem = async (
    req: Request,
    res: Response
): Promise<void> => {
    const cartItemId = req.params.cartId;

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

        const cartItem = await Cart.findOne({
            where: { id: cartItemId, userId },
        });

        if (!cartItem) {
            res.status(404).json({
                message: 'Không tìm thấy sản phẩm trong giỏ hàng',
            });
            return;
        }

        await cartItem.destroy();
        res.status(200).json({
            message: 'Xóa sản phẩm khỏi giỏ hàng thành công',
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const payCart = async (req: Request, res: Response): Promise<void> => {
    const { cartItemIds, nameClient, phoneNumber, address, note } = req.body;

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

        const cartItems = await Cart.findAll({
            where: { id: cartItemIds, userId },
        });

        if (!cartItems || cartItems.length === 0) {
            res.status(404).json({
                message: 'Không tìm thấy sản phẩm trong giỏ hàng',
            });
            return;
        }

        const bookIds = cartItems.map((item) => item.bookId);
        const books = await Book.findAll({
            where: { id: bookIds },
        });

        for (const item of cartItems) {
            const book = books.find((b) => b.id === item.bookId);
            if (
                book &&
                typeof book.quantity === 'number' &&
                book.quantity < item.quantity
            ) {
                res.status(400).json({
                    message: `Số lượng sách "${book.name}" không đủ trong kho`,
                });
                return;
            }
        }

        await Cart.update(
            { status: 'completed' },
            { where: { id: cartItemIds, userId } }
        );

        const orderItems = cartItems.map((item) => ({
            id: uuidv4(),
            idBook: item.bookId,
            nameClient,
            phoneNumber,
            address,
            note,
            status: 'pending' as 'pending',
            quantity: item.quantity,
        }));

        const pointPurchase = await PointPurchase.findOne({
            where: { userId },
        });
        if (pointPurchase) {
            cartItems.map(async (item) => {
                await caculatorLevelUser(
                    pointPurchase.point + item.quantity,
                    userId
                );
                await pointPurchase.update({
                    point: pointPurchase.point + item.quantity,
                });
            });
        } else {
            cartItems.map(async (item) => {
                await PointPurchase.create({
                    id: uuidv4(),
                    userId,
                    point: item.quantity,
                });
                await caculatorLevelUser(item.quantity, userId);
            });
        }

        orderItems.map(async (item) => {
            await Order.create({
                id: item.id,
                nameClient: item.nameClient,
                userId,
                phoneNumber: item.phoneNumber,
                address: item.address,
                note: item.note,
                status: item.status,
            });

            const book = await Book.findByPk(item.idBook);

            if (book && typeof book.quantity === 'number') {
                await book.decrement('quantity', {
                    by: item.quantity,
                });
            }

            await OrderDetails.create({
                id: uuidv4(),
                orderId: item.id,
                bookId: item.idBook,
                quantity: item.quantity,
                price: book?.price || 0,
            });
        });

        await Cart.destroy({
            where: { id: cartItemIds, userId },
        });

        async function createSuccessEmail(
            orderItems: typeof cartItems
        ): Promise<{
            subject: string;
            text: string;
            html: string;
        }> {
            const orderListText = orderItems
                .map(
                    (item, idx) =>
                        `${idx + 1}. Sách: ${item.bookId} - Số lượng: ${item.quantity}`
                )
                .join('\n');

            const idsBook = orderItems.map((item) => item.bookId);
            const books = await Book.findAll({
                where: { id: idsBook },
            });

            const orderListHtml = orderItems
                .map((item, idx) => {
                    const book = books.find((b) => b.id === item.bookId);
                    const bookName = book ? book.name : item.bookId;
                    return `<li>Sách: <b>${bookName}</b> - Số lượng: <b>${item.quantity}</b></li>`;
                })
                .join('');

            return {
                subject: 'Cảm ơn bạn đã đặt hàng tại VinaBook',
                text: `Cảm ơn bạn đã đặt hàng tại VinaBook!

Đơn hàng của bạn đã được ghi nhận với các mục sau:
${orderListText}

Thông tin khách hàng:
- Tên: ${nameClient || ''}
- Địa chỉ: ${address}
- Số điện thoại: ${phoneNumber}

Chúng tôi sẽ liên hệ với bạn để xác nhận đơn hàng trong thời gian sớm nhất.`,
                html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
  <h2>VinaBook - Xác nhận đơn hàng</h2>
  <p>Xin chào <b>${nameClient || 'quý khách'}</b>,</p>
  <p>Cảm ơn bạn đã đặt hàng tại <b>VinaBook</b>. Đơn hàng của bạn bao gồm:</p>
  <ul>${orderListHtml}</ul>
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

        const emailContent = await createSuccessEmail(cartItems);
        await mailService.sendEmail(
            user.email,
            emailContent.subject,
            emailContent.text,
            emailContent.html
        );

        res.status(200).json({
            status: 'success',
            message: 'Đặt hàng thành công',
            orderItems,
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};
