import { Request, Response, Router } from "express";

import { errorHandler } from "../../helpers/errorHandler";
import { AppDataSource } from "../data-source";
import { Product } from "../entities/Product";
import { ProductLine } from "../entities/ProductLine";
import { User } from "../entities/User";
import { protectRoute, restrictTo } from "../middlewares/auth";

// Repositories
const productLineRepo = AppDataSource.getRepository(ProductLine);
const productRepo = AppDataSource.getRepository(Product);

/**
 * Thống kê số lượng sản phẩm xuất cho đại lý trong một khoảng thời gian.
 */
const exportToDailyStats = async (req: Request, res: Response) => {
  try {
    const start_time = req.query.start_time || -Infinity;
    const end_time = req.query.end_time || Infinity;
    const user = res.locals.user as User;

    // Đảm bảo start_time và end_time là có thể parse thành number
    if (
      typeof start_time !== "string" ||
      typeof end_time !== "string" ||
      isNaN(parseInt(start_time)) ||
      isNaN(parseInt(end_time))
    ) {
      return res
        .status(400)
        .json({ message: "start_time và end_time phải là unix time stamp. Gọi hàm getTime() của class Date" });
    }

    // Parse start_time và end_time về dạng "YYYY-MM-DD" cho sqlite
    const parsed_start_time = new Date(parseInt(start_time)).toISOString().split("T")[0];
    const parsed_end_time = new Date(parseInt(end_time)).toISOString().split("T")[0];
    // Đếm tổng số lượng sản phẩm xuất cho đại lý
    const [products, count] = await productRepo
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.daily", "daily")
      .leftJoinAndSelect("product.product_line", "product_line")
      .leftJoinAndSelect("product.sanxuat", "sanxuat")
      .where("product.exported_to_daily_date BETWEEN :parsed_start_time AND :parsed_end_time", {
        parsed_start_time,
        parsed_end_time,
      })
      .getManyAndCount();

    // Tính tổng số lượng sản phẩm xuất cho đại lý theo từng dòng sản phẩm
    const productLineMap = new Map<number, ProductLine>();
    for (const product of products) {
      productLineMap.set(product.product_line.id, product.product_line);
    }
    let result = [];
    for (const productLine of Array.from(productLineMap.values())) {
      const product_count = products.reduce((acc, cur) => {
        if (cur.product_line.id === productLine.id) {
          return acc + 1;
        }
        return acc;
      }, 0);
      result.push({
        ...productLine,
        product_count,
      });
    }

    // Trả về kết quả
    return res.status(200).json({ total_exported: count, result });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

const router = Router();

router.get("/exportToDailyStats", protectRoute, restrictTo("san_xuat"), exportToDailyStats);

export default router;
