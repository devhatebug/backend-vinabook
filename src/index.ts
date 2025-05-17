import express from "express";
import cors from "cors";
import { config } from "./config/dotenv";
import sequelize from "./config/database";
import bookRouter from "./routes/book";
import orderRouter from "./routes/order";
import authRouter from "./routes/auth";
import userRouter from "./routes/user";
import cartRouter from "./routes/cart";
import labelRouter from "./routes/label";

const app = express();
const PORT = config.port;

sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Kết nối đến MySQL thành công!");
  })
  .catch((error) => {
    console.error("❌ Lỗi kết nối đến MySQL:", error);
  });

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/v1/book", bookRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/label", labelRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
