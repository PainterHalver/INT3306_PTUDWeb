import { Request, Response, Router } from "express";
import { Like } from "typeorm";

import { errorHandler } from "../../helpers/errorHandler";
import { AppDataSource } from "../data-source";
import { Customer } from "../entities/Customer";
import { protectRoute, restrictTo } from "../middlewares/auth";

const customerRepo = AppDataSource.getRepository(Customer);

/**
 * Tìm kiếm khách hàng theo tên hoặc số điện thoại.
 */
const getCustomers = async (req: Request, res: Response) => {
  try {
    const name = req.query.name || "";
    const phone = req.query.phone || "";

    // Validate inputs
    let errors: any = {};
    if (typeof name !== "string") errors.name = "Không hợp lệ";
    if (typeof phone !== "string") errors.phone = "Không hợp lệ";
    if (Object.keys(errors).length > 0) {
      return res.status(400).json(errors);
    }

    // Tìm kiếm khách hàng
    const [customers, count] = await customerRepo.findAndCountBy({
      name: Like(`%${name}%`),
      phone: Like(`%${phone}%`),
    });

    // Trả về danh sách khách hàng
    return res.json({ total: count, customers });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

/**
 * Tạo một khách hàng mới.
 * Đại lý tạo khách hàng mới khi khách hàng đến mua hàng lần đầu.
 */
const createCustomer = async (req: Request, res: Response) => {
  try {
    const name = req.body.name;
    const phone = req.body.phone;
    const address = req.body.address || "";

    // Validate inputs
    let errors: any = {};
    if (!name || typeof name !== "string") errors.name = "Tên khách hàng không được để trống";
    if (!phone || typeof phone !== "string") errors.phone = "Số điện thoại không được để trống";
    if (Object.keys(errors).length > 0) {
      return res.status(400).json(errors);
    }

    // Kiểm tra số điện thoại đã tồn tại chưa
    const phoneCustomer = await customerRepo.findOneBy({ phone });
    if (phoneCustomer) {
      return res.status(400).json({ phone: "Số điện thoại đã tồn tại" });
    }

    // Tạo khách hàng mới
    const customer = customerRepo.create({
      name,
      phone,
      address,
    });
    const savedCustomer = await customerRepo.save(customer);

    // Trả về thông tin khách hàng mới
    return res.status(201).json(savedCustomer);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

const router = Router();

router.get("/", protectRoute, restrictTo("admin", "dai_ly", "bao_hanh", "san_xuat"), getCustomers);
router.post("/", protectRoute, restrictTo("dai_ly"), createCustomer);

export default router;
