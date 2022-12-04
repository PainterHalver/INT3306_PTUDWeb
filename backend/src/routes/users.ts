import { Request, Response, Router } from "express";
import crypto from "crypto";

import { User } from "../entities/User";
import { AppDataSource } from "../data-source";
import { protectRoute, restrictTo } from "../middlewares/auth";
import { AccountType } from "../helpers/types";
import { errorHandler } from "../helpers/errorHandler";

/**
 * Admin xem danh sách tài khoản
 */
const getUsers = async (req: Request, res: Response) => {
  try {
    const { accountType } = req.query;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    // Lấy danh sách user
    const userRepo = AppDataSource.getRepository(User);
    const [users, count] = await userRepo.findAndCount({
      where: {
        account_type: accountType as AccountType,
      },
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
    errorHandler(error, req, res);
  }
};

/**
 * Admin tạo tài khoản cho cơ sở sản xuất, đại lý, bảo hành
 */
const createUser = async (req: Request, res: Response) => {
  try {
    const { username, name, account_type, address, password } = req.body;

    // Validate dữ liệu
    let errors: any = {};
    if (!username) errors.username = "Username không được để trống";
    if (!name) errors.name = "Tên không được để trống";
    if (!account_type) errors.account_type = "Loại tài khoản không được để trống";
    if (!address) errors.address = "Địa chỉ không được để trống";
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    // Check xem username đã tồn tại chưa
    const userRepo = AppDataSource.getRepository(User);
    const usernameUser = await userRepo.findOneBy({ username });
    if (usernameUser) {
      return res.status(400).json({ errors: { username: "Username đã tồn tại" } });
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
    const savedUser = await userRepo.save(user);

    // Trả về user
    return res.status(201).json(savedUser);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

/**
 * Admin chỉnh sửa tài khoản cho cơ sở sản xuất, đại lý, bảo hành
 */
const updateUser = async (req: Request, res: Response) => {
  try {
    const { username, name, account_type, address, password } = req.body;
    const { id } = req.params;

    // Validate dữ liệu, bắt buộc phải có các field trừ password
    let errors: any = {};
    if (!id || isNaN(parseInt(id))) errors.id = "ID không hợp lệ";
    // if (!username) errors.username = "Username không được để trống";
    if (!name) errors.name = "Tên không được để trống";
    if (!account_type) errors.account_type = "Loại tài khoản không được để trống";
    if (!address) errors.address = "Địa chỉ không được để trống";
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    // Check xem username đã tồn tại chưa
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ username });
    if (user && user.id !== parseInt(id)) {
      return res.status(400).json({ errors: { username: "Username đã tồn tại" } });
    }

    // Check xem id có tồn tại không
    const usernameUser = await userRepo.findOneBy({ id: parseInt(id) });
    if (!usernameUser) {
      return res.status(400).json({ errors: { username: `User với id ${id} không tồn tại` } });
    }

    // Cập nhật tài khoản
    usernameUser.username = username;
    usernameUser.name = name;
    usernameUser.account_type = account_type;
    usernameUser.address = address;
    if (password) {
      usernameUser.password = crypto.createHash("md5").update(password).digest("hex");
    }
    const updatedUser = await userRepo.save(usernameUser);

    // Trả về user
    return res.json(updatedUser);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

/**
 * Admin xóa tài khoản cơ sở sản xuất, đại lý, bảo hành
 */
const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate dữ liệu
    let errors: any = {};
    if (!id || isNaN(parseInt(id))) errors.id = "ID không hợp lệ";
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    // Check xem user có tồn tại không
    const userRepo = AppDataSource.getRepository(User);
    const usernameUser = await userRepo.findOneBy({ id: parseInt(id) });
    if (!usernameUser) {
      return res.status(400).json({ errors: { username: "Username không tồn tại" } });
    }

    // Xóa tài khoản
    await userRepo.delete({ id: parseInt(id) });

    // Trả về status 204 No Content
    return res.status(204).json();
  } catch (error) {
    errorHandler(error, req, res);
  }
};

const router = Router();

router.get("/", protectRoute, restrictTo("admin", "san_xuat", "dai_ly", "bao_hanh"), getUsers);
router.post("/", protectRoute, restrictTo("admin"), createUser);

// Các route có params
router.put("/:id", protectRoute, restrictTo("admin"), updateUser);
router.delete("/:id", protectRoute, restrictTo("admin"), deleteUser);

export default router;
