import { Request, Response, Router } from "express";
import { Brackets } from "typeorm";

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
 * Thống kê số liệu sản phẩm theo từng loại (trạng thái).
 * Có thể là của User hiện tại hoặc của tất cả User.
 */
const getStats = async (req: Request, res: Response) => {
  try {
    // const start_time = req.query.start_time || -Infinity;
    // const end_time = req.query.end_time || Infinity;
    const status = req.query.status || "";
    const user = res.locals.user as User;

    // Nếu muốn chỉ lấy của User hiện tại
    const of_current_user = req.query.of_current_user ?? null;

    // Kiểm tra input
    if (!status || typeof status !== "string") {
      return res.status(400).json({ message: "Chưa nhập status hoặc status không hợp lệ" });
    }

    // Đảm bảo start_time và end_time là có thể parse thành number
    // if (
    //   typeof start_time !== "string" ||
    //   typeof end_time !== "string" ||
    //   isNaN(parseInt(start_time)) ||
    //   isNaN(parseInt(end_time))
    // ) {
    //   return res
    //     .status(400)
    //     .json({ message: "start_time và end_time phải là unix time stamp. Gọi hàm getTime() của class Date" });
    // }

    // Parse start_time và end_time về dạng "YYYY-MM-DD" cho sqlite
    // const parsed_start_time = new Date(parseInt(start_time)).toISOString().split("T")[0];
    // const parsed_end_time = new Date(parseInt(end_time)).toISOString().split("T")[0];

    // https://typeorm.io/select-query-builder#adding-where-expression
    const products = await productLineRepo
      .createQueryBuilder("product_line")
      .leftJoinAndSelect("product_line.products", "products")
      .where("products.status = :status", { status })
      .andWhere(
        new Brackets((qb) => {
          if (of_current_user) {
            qb.orWhere("products.sanxuat_id = :id", { id: user.id });
            qb.orWhere("products.daily_id = :id", { id: user.id });
            qb.orWhere("products.baohanh_id = :id", { id: user.id });
          }
          return "9001 = 9001";
        })
      )
      // .andWhere("products.exported_to_daily_date BETWEEN :parsed_start_time AND :parsed_end_time", {
      //   parsed_start_time,
      //   parsed_end_time,
      // })
      .getMany();

    return res.json(products);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

/**
 * Thống kê số lượng sản phẩm xuất cho đại lý trong một khoảng thời gian
 * của cơ sở sản xuất hiện tại.
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

    // TODO: Query chưa tối ưu
    const [products, count] = await productRepo
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.daily", "daily")
      .leftJoinAndSelect("product.product_line", "product_line")
      .leftJoinAndSelect("product.sanxuat", "sanxuat")
      .where("product.exported_to_daily_date BETWEEN :parsed_start_time AND :parsed_end_time", {
        parsed_start_time,
        parsed_end_time,
      })
      .andWhere("product.sanxuat_id = :sanxuat_id", { sanxuat_id: user.id })
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

router.get("/", protectRoute, restrictTo("admin", "san_xuat", "dai_ly", "bao_hanh"), getStats);
router.get("/exportToDailyStats", protectRoute, restrictTo("san_xuat"), exportToDailyStats);

export default router;
