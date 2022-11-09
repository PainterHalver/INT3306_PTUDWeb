import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";

dotenv.config();

import { AppDataSource } from "./data-source";
import trim from "./middlewares/trim";
import adminRouter from "./routes/admin";
import authRouter from "./routes/auth";
import productsRouter from "./routes/products";
import productLinesRouter from "./routes/product_lines";

const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(trim);

// API Routes
app.get("/api", (_, res) => res.send("Hello World!"));
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/products", productsRouter);
app.use("/api/product_lines", productLinesRouter);
// app.use("/api/users", userRouter);

// Khởi tạo server
app.listen(port, async () => {
  console.log(`Server running on port ${port}`);

  AppDataSource.initialize()
    .then(async () => {
      console.log("Database connected");
    })
    .catch((error) => console.log(error));
});
