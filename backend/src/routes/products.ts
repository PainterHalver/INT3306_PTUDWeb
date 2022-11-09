import { Request, Response, Router } from "express";

import { AppDataSource } from "../data-source";
import { Product } from "../entities/Product";
import { protectRoute, restrictTo } from "../middlewares/auth";

/**
 * Xem danh sách sản phẩm theo trạng thái và theo cơ sở sản xuất, đại lý phân phối và trung tâm bảo hành.
 */
const getProducts = async (req: Request, res: Response) => {
  try {
    const status = req.query.status || "";
    const daily_id = req.query.daily_id || 0;
    const sanxuat_id = req.query.sanxuat_id || 0;
    const baohanh_id = req.query.baohanh_id || 0;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    // Lấy danh sách sản phẩm
    const productRepo = AppDataSource.getRepository(Product);
    const products = await productRepo
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.product_line", "product_line")
      .leftJoinAndSelect("product.daily", "daily")
      .leftJoinAndSelect("product.sanxuat", "sanxuat")
      .leftJoinAndSelect("product.baohanh", "baohanh")
      .where((qb) => {
        qb.where(`product.status LIKE :status`, { status: `%${status}%` });
        if (daily_id) qb = qb.andWhere(`daily.id = :daily_id`, { daily_id });
        if (sanxuat_id) qb = qb.andWhere(`sanxuat.id = :sanxuat_id`, { sanxuat_id });
        if (baohanh_id) qb = qb.andWhere(`baohanh.id = :baohanh_id`, { baohanh_id });
      })
      .skip(offset)
      .take(limit)
      .getMany();

    // TODO: Tính tổng số trang

    // Trả về danh sách sản phẩm
    return res.json({ page, count: products.length, products });
  } catch (error) {
    console.log("GET_PRODUCTS", error);
    res.status(500).json({ error: "Lỗi hệ thống!" });
  }
};

const router = Router();

router.get("/", protectRoute, restrictTo("admin"), getProducts);

export default router;
