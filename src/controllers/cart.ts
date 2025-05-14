import { Response, Request } from "express";
import Cart from "../models/cart";
import User from "../models/user";
import Book from "../models/book";
import { v4 as uuidv4 } from "uuid";
import Order from "../models/order";
import OrderDetails from "../models/order-details";

export const getCart = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Vui lòng đăng nhập!" });
      return;
    }
    const { userId } = req.user;
    const user = await User.findOne({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ message: "Không tìm thấy người dùng" });
      return;
    }

    const cart = await Cart.findAll({
      where: { userId },
      include: [
        {
          model: Book,
          as: "book",
          attributes: ["id", "name", "image", "price"],
        },
      ],
    });

    res.status(200).json({ cart, message: "Lấy giỏ hàng thành công" });
    return;
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: "Lỗi server" });
    return;
  }
};

export const addToCart = async (req: Request, res: Response): Promise<void> => {
  const { bookId } = req.body;

  try {
    if (!req.user) {
      res.status(401).json({ message: "Vui lòng đăng nhập!" });
      return;
    }
    const { userId } = req.user;
    const user = await User.findOne({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ message: "Không tìm thấy người dùng" });
      return;
    }

    const book = await Book.findOne({
      where: { id: bookId },
    });

    if (!book) {
      res.status(404).json({ message: "Không tìm thấy sách" });
      return;
    }

    const checkItemCart = await Cart.findOne({
      where: { bookId, userId },
    });

    if (checkItemCart) {
      await checkItemCart.increment("quantity", {
        by: 1,
      });
      res.status(200).json({
        message: "Thêm sách vào giỏ hàng thành công",
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
      status: "pending",
      quantity: 1,
    });

    res.status(201).json({ cartItem, message: "Thêm vào giỏ hàng thành công" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
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
      res.status(401).json({ message: "Vui lòng đăng nhập!" });
      return;
    }
    const { userId } = req.user;
    const user = await User.findOne({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ message: "Không tìm thấy người dùng" });
      return;
    }

    const cartItem = await Cart.findOne({
      where: { id: cartItemId, userId },
    });

    if (!cartItem) {
      res
        .status(404)
        .json({ message: "Không tìm thấy sản phẩm trong giỏ hàng" });
      return;
    }

    if (quantity < 1) {
      await cartItem.destroy();
      res
        .status(200)
        .json({ message: "Xóa sản phẩm khỏi giỏ hàng thành công" });
      return;
    }

    await cartItem.update({ quantity });
    await cartItem.reload();

    res.status(200).json({ cartItem, message: "Cập nhật giỏ hàng thành công" });
    return;
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
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
      res.status(401).json({ message: "Vui lòng đăng nhập!" });
      return;
    }
    const { userId } = req.user;
    const user = await User.findOne({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ message: "Không tìm thấy người dùng" });
      return;
    }

    const cartItem = await Cart.findOne({
      where: { id: cartItemId, userId },
    });

    if (!cartItem) {
      res
        .status(404)
        .json({ message: "Không tìm thấy sản phẩm trong giỏ hàng" });
      return;
    }

    await cartItem.destroy();
    res.status(200).json({ message: "Xóa sản phẩm khỏi giỏ hàng thành công" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const payCart = async (req: Request, res: Response): Promise<void> => {
  const { cartItemIds, nameClient, phoneNumber, address, note } = req.body;

  try {
    if (!req.user) {
      res.status(401).json({ message: "Vui lòng đăng nhập!" });
      return;
    }
    const { userId } = req.user;

    const user = await User.findOne({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ message: "Không tìm thấy người dùng" });
      return;
    }

    const cartItems = await Cart.findAll({
      where: { id: cartItemIds, userId },
    });

    if (!cartItems || cartItems.length === 0) {
      res
        .status(404)
        .json({ message: "Không tìm thấy sản phẩm trong giỏ hàng" });
      return;
    }

    await Cart.update(
      { status: "completed" },
      { where: { id: cartItemIds, userId } }
    );

    const orderItems = cartItems.map((item) => ({
      id: uuidv4(),
      idBook: item.bookId,
      nameClient,
      phoneNumber,
      address,
      note,
      status: "pending" as "pending",
      quantity: item.quantity,
    }));

    orderItems.map(async (item) => {
        await Order.create({
            id: item.id,
            nameClient: item.nameClient,
            phoneNumber: item.phoneNumber,
            address: item.address,
            note: item.note,
            status: item.status,
        });

        const book = await Book.findByPk(item.idBook);
        await OrderDetails.create({
            id: uuidv4(),
            orderId: item.id,
            bookId: item.idBook,
            quantity: item.quantity,
            price: book?.price || 0,
        });
    })

    await Cart.destroy({
      where: { id: cartItemIds, userId },
    });

    res.status(200).json({
      message: "Đặt hàng thành công",
      orderItems,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};
