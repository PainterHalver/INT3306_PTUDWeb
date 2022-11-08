import { Request, Response, Router } from "express";
import crypto from "crypto";

import { User } from "../entities/User";
import { AppDataSource } from "../data-source";
import { protectRoute, restrictTo } from "../middlewares/auth";

/**
 * Admin xem danh sách tài khoản
 */
const getUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    // Lấy danh sách user
    const userRepo = AppDataSource.getRepository(User);
    const [users, count] = await userRepo.findAndCount({
      skip: offset,
      take: limit,
      order: {
        id: "ASC",
      },
    });
    const totalPages = Math.ceil(count / limit);

    // Trả về danh sách user
    return res.json({ page, totalPages, count, users });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Lỗi hệ thống!" });
  }
};

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

router.get("/users", protectRoute, restrictTo("admin"), getUsers);
router.post("/createAccount", protectRoute, restrictTo("admin"), createAccount);

export default router;
