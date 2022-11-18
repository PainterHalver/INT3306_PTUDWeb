import { Request, Response, Router } from "express";
import { isEmpty } from "class-validator";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { JWTUserPayload } from "../helpers/types";
import { errorHandler } from "../helpers/errorHandler";

const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Kiểm tra inputs
    let errors: any = {};

    if (isEmpty(username)) errors.username = "Username không được để trống";
    if (isEmpty(password)) errors.password = "Password không được để trống";
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    // Check xem user có tồn tại không, nếu không thì trả về lỗi
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ username });

    if (!user) {
      return res.status(404).json({ username: "Username không tồn tại" });
    }

    // Check xem md5 của password có đúng không, nếu không thì trả về lỗi
    if (crypto.createHash("md5").update(password).digest("hex") !== user.password) {
      return res.status(401).json({ password: "Password không đúng" });
    }

    // Nếu ổn hết thì trả về token và user
    const payload: JWTUserPayload = { username, account_type: user.account_type };
    const token = jwt.sign(payload, process.env.JWT_SECRET!);

    return res.json({ ...user, token });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

const router = Router();

router.post("/login", login);

export default router;
