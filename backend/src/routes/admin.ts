import { Request, Response, Router } from "express";
import crypto from "crypto";

import { User } from "../entities/User";
import { AppDataSource } from "../data-source";
import { protectRoute, restrictTo } from "../middlewares/auth";

/**
 * Admin tạo tài khoản cho cơ sở sản xuất, đại lý, bảo hành
 */
const createAccount = async (req: Request, res: Response) => {
  try {
    const { username, name, account_type, address, password } = req.body;

    // Validate dữ liệu
    let errors: any = {};
    if (!username) errors.username = "Username không được để trống";
    if (!name) errors.name = "Tên không được để trống";
    if (!account_type) errors.account_type = "Loại tài khoản không được để trống";
    if (!address) errors.address = "Địa chỉ không được để trống";
    if (Object.keys(errors).length > 0) {
      return res.status(400).json(errors);
    }

    // Check xem username đã tồn tại chưa
    const userRepo = AppDataSource.getRepository(User);
    const usernameUser = await userRepo.findOneBy({ username });
    if (usernameUser) {
      return res.status(400).json({ username: "Username đã tồn tại" });
    }

    // Tạo tài khoản
    const user = userRepo.create({
      username,
      name,
      password: crypto
        .createHash("md5")
        .update(password || process.env.DEFAULT_USER_PASSWORD)
        .digest("hex"),
      account_type,
      address,
    });
    await userRepo.save(user);

    // Trả về user
    return res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Lỗi hệ thống!" });
  }
};

const router = Router();

router.post("/createAccount", protectRoute, restrictTo("admin"), createAccount);

export default router;
