import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// API Routes
app.get("/api", (_, res) => res.send("Hello World!"));
// app.use("/api/auth", authRouter);
// app.use("/api/posts", postRouter);
// app.use("/api/subs", subRouter);
// app.use("/api/misc", miscRouter);
// app.use("/api/users", userRouter);

// Khởi tạo server
app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
});
