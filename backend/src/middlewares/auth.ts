import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { AccountType, JWTUserPayload } from "../../helpers/types";

/**
 * Bắt buộc user phải đăng nhập mới được truy cập các route này
 */
export const protectRoute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Check xem có token không
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    // Nếu không có token thì trả về lỗi
    if (!token) {
      return res.status(401).json({ error: "Bạn chưa đăng nhập hoặc không có quyền truy cập!" });
    }

    // 2. Check xem token có hợp lệ không
    const decodedPayload = jwt.verify(token, process.env.JWT_SECRET!) as JWTUserPayload;

    // 3. Check xem user có tồn tại không
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ username: decodedPayload.username });

    if (!user) {
      return res.status(404).json({ error: "User không tồn tại!" });
    }

    // 4. Check xem user có đúng account_type không
    if (user.account_type !== decodedPayload.account_type) {
      return res.status(401).json({ error: "Bạn không có quyền truy cập!" });
    }

    // 5. Nếu ổn hết thì gán user vào res.locals.user và next()
    res.locals.user = user;
    next();
  } catch (error) {
    console.log("Middlewares/auth.ts: ", error);
    return res.status(500).json({ error: "Lỗi hệ thống!" });
  }
};

/**
 * Luôn phải theo sau middlewares/protectRoute, giới hạn quyền truy cập của user
 * @param accountTypes Mảng các account_type có thể truy cập vào route
 */
export const restrictTo = (...accountTypes: AccountType[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!accountTypes.includes(res.locals.user.account_type)) {
      return res.status(401).json({ error: `Chỉ user loại ${accountTypes} mới được truy cập route này!` });
    }

    next();
  };
};
