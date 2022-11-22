import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";

dotenv.config();

import { AppDataSource } from "./data-source";
import { updateBaohanhStatusJob } from "./helpers/cronJobs";
import trim from "./middlewares/trim";
import userRouter from "./routes/users";
import authRouter from "./routes/auth";
import productsRouter from "./routes/products";
import productLinesRouter from "./routes/product_lines";
import statsRouter from "./routes/stats";
import customerRouter from "./routes/customers";

const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(trim);

// Setup CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

// API Routes
app.get("/api", (_, res) => res.send("Hello World!"));
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/products", productsRouter);
app.use("/api/productlines", productLinesRouter);
app.use("/api/stats", statsRouter);
app.use("/api/customers", customerRouter);

// Chạy cron job
updateBaohanhStatusJob.start();

// Khởi tạo server
app.listen(port, async () => {
  console.log(`Server running on port ${port}`);

  AppDataSource.initialize()
    .then(async () => {
      console.log("Database connected");
    })
    .catch((error) => console.log(error));
});
