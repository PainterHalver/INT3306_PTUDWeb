import { Request, Response, Router } from "express";
import { Brackets, In } from "typeorm";

import { errorHandler } from "../helpers/errorHandler";
import { AppDataSource } from "../data-source";
import { Product } from "../entities/Product";
import { ProductLine } from "../entities/ProductLine";
import { User } from "../entities/User";
import { protectRoute, restrictTo } from "../middlewares/auth";

// Repositories
const productLineRepo = AppDataSource.getRepository(ProductLine);
const productRepo = AppDataSource.getRepository(Product);
const userRepo = AppDataSource.getRepository(User);

/**
 * Thống kê số liệu sản phẩm theo từng loại (trạng thái).
 * Có thể là của User hiện tại hoặc của tất cả User.
 */
const getStats = async (req: Request, res: Response) => {
  try {
    // const from = req.query.from || -Infinity;
    // const to = req.query.to || Infinity;
    const status = req.query.status || "";
    const user = res.locals.user as User;
    let sanxuat_id: number;
    let daily_id: number;
    let baohanh_id: number;

    // Validate 3 id input
    if (req.query.sanxuat_id) {
      sanxuat_id = parseInt(req.query.sanxuat_id as string);
      if (isNaN(sanxuat_id)) {
        return res.status(400).json({ errors: { sanxuat_id: "ID sản xuất không hợp lệ" } });
      }
    }
    if (req.query.daily_id) {
      daily_id = parseInt(req.query.daily_id as string);
      if (isNaN(daily_id)) {
        return res.status(400).json({ errors: { daily_id: "ID đại lý không hợp lệ" } });
      }
    }
    if (req.query.baohanh_id) {
      baohanh_id = parseInt(req.query.baohanh_id as string);
      if (isNaN(baohanh_id)) {
        return res.status(400).json({ errors: { baohanh_id: "ID bảo hành không hợp lệ" } });
      }
    }

    // Nếu muốn chỉ lấy của User hiện tại
    const of_current_user = req.query.of_current_user ?? null;

    // Kiểm tra input
    if (typeof status !== "string") {
      return res.status(400).json({ errors: { message: "Chưa nhập status hoặc status không hợp lệ" } });
    }

    // Đảm bảo from và to có thể parse thành number
    // if (
    //   typeof from !== "string" ||
    //   typeof to !== "string" ||
    //   isNaN(parseInt(from)) ||
    //   isNaN(parseInt(to))
    // ) {
    //   return res
    //     .status(400)
    //     .json({ message: "from và to phải là unix time stamp. Gọi hàm getTime() của class Date" });
    // }

    // Parse from và to về dạng "YYYY-MM-DD" cho sqlite
    // const parsed_from = new Date(parseInt(from)).toISOString().split("T")[0];
    // const parsed_to = new Date(parseInt(to)).toISOString().split("T")[0];

    // https://typeorm.io/select-query-builder#adding-where-expression
    const product_lines = await productLineRepo
      .createQueryBuilder("product_line")
      .leftJoinAndSelect("product_line.products", "products")
      .where(
        new Brackets((qb) => {
          if (status) {
            qb.andWhere("products.status = :status", { status });
          }
          if (of_current_user) {
            qb.orWhere("products.sanxuat_id = :id", { id: user.id });
            qb.orWhere("products.daily_id = :id", { id: user.id });
            qb.orWhere("products.baohanh_id = :id", { id: user.id });
          } else {
            if (sanxuat_id) qb.andWhere("products.sanxuat_id = :sanxuat_id", { sanxuat_id });
            if (daily_id) qb.andWhere("products.daily_id = :daily_id", { daily_id });
            if (baohanh_id) qb.andWhere("products.baohanh_id = :baohanh_id", { baohanh_id });
          }
          return "9001 = 9001";
        })
      )
      // .andWhere("products.exported_to_daily_date BETWEEN :parsed_from AND :parsed_to", {
      //   parsed_from,
      //   parsed_to,
      // })
      .getMany();

    const total = product_lines.length;

    return res.json({ total, result: product_lines });
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
    const from = req.query.from || -Infinity;
    const to = req.query.to || Infinity;
    const user = res.locals.user as User;

    // Đảm bảo from và to là có thể parse thành number
    if (typeof from !== "string" || typeof to !== "string" || isNaN(parseInt(from)) || isNaN(parseInt(to))) {
      return res.status(400).json({
        errors: { message: "from và to phải là unix time stamp. Gọi hàm getTime() của class Date" },
      });
    }

    // Parse from và to về dạng "YYYY-MM-DD" cho sqlite
    const parsed_from = new Date(parseInt(from)).toISOString().split("T")[0];
    const parsed_to = new Date(parseInt(to)).toISOString().split("T")[0];

    // TODO: Query chưa tối ưu
    const [products, count] = await productRepo
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.daily", "daily")
      .leftJoinAndSelect("product.product_line", "product_line")
      .leftJoinAndSelect("product.sanxuat", "sanxuat")
      .where("product.exported_to_daily_date BETWEEN :parsed_from AND :parsed_to", {
        parsed_from,
        parsed_to,
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
    return res.status(200).json({ total: count, result });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

/**
 * Đại lý thống kê số lượng sản phẩm bán ra trong một khoảng thời gian.
 */
const soldToCustomerStats = async (req: Request, res: Response) => {
  try {
    const from = req.query.from || -Infinity;
    const to = req.query.to || Infinity;
    const user = res.locals.user as User;

    // Nếu muốn chỉ lấy của User hiện tại
    const of_current_user = req.query.of_current_user ?? null;

    // Đảm bảo from và to là có thể parse thành number
    if (typeof from !== "string" || typeof to !== "string" || isNaN(parseInt(from)) || isNaN(parseInt(to))) {
      return res.status(400).json({ message: "from và to phải là unix time stamp. Gọi hàm getTime() của class Date" });
    }

    // Parse from và to về dạng "YYYY-MM-DD" cho sqlite
    const parsed_from = new Date(parseInt(from)).toISOString().split("T")[0];
    const parsed_to = new Date(parseInt(to)).toISOString().split("T")[0];

    const product_lines = await productLineRepo
      .createQueryBuilder("product_line")
      .leftJoinAndSelect("product_line.products", "products")
      .andWhere(
        new Brackets((qb) => {
          if (of_current_user) {
            qb.orWhere("products.daily_id = :id", { id: user.id });
          }
          return "9001 = 9001";
        })
      )
      .andWhere("products.sold_to_customer_date BETWEEN :parsed_from AND :parsed_to", {
        parsed_from,
        parsed_to,
      })
      .getMany();

    const total = product_lines.length;

    return res.json({ total, result: product_lines });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

/**
 * Cơ sở sản xuất thống kê sản phẩm bị lỗi theo dòng sản phẩm, cơ sở sản xuất, đại lý phân phối.
 * Sản phẩm bị lỗi là sản phẩm có `baohanh_count` > 0 (Trường hợp ở trạng thái `lỗi cần triệu hồi` do chưa chuyển về `lỗi cần bảo hành`, sản phẩm vẫn đang ở chỗ khách hàng nên không tính)
 */
const getErrorStats = async (req: Request, res: Response) => {
  try {
    const sanxuat_id: number = req.body.sanxuat_id || 0;
    const daily_id: number = req.body.daily_id || 0;
    const product_line_ids: number[] = req.body.product_line_ids || [];

    // Validate inputs
    let errors: any = {};
    if (!Array.isArray(product_line_ids) || product_line_ids.some((id) => isNaN(+id))) {
      errors.product_line_ids = "Phải là một mảng các id";
    }
    if (sanxuat_id && isNaN(sanxuat_id)) errors.sanxuat_id = "Phải là một số";
    if (daily_id && isNaN(daily_id)) errors.daily_id = "Phải là một số";
    if (Object.keys(errors).length) return res.status(400).json({ errors });

    // Kiểm tra xem có tồn tại cơ sở sản xuất hay đại lý phân phối không
    if (sanxuat_id) {
      const sanxuat = await userRepo.findOneBy({ id: sanxuat_id, account_type: "san_xuat" });
      if (!sanxuat)
        return res.status(400).json({ errors: { sanxuat_id: `Không tồn tại cơ sở sản xuất với id ${sanxuat_id}` } });
    }
    if (daily_id) {
      const daily = await userRepo.findOneBy({ id: daily_id, account_type: "dai_ly" });
      if (!daily)
        return res.status(400).json({ errors: { daily_id: `Không tồn tại đại lý phân phối với id ${daily_id}` } });
    }

    // Lấy danh sách sản phẩm bị lỗi
    const product_lines = await productLineRepo
      .createQueryBuilder("product_line")
      .leftJoinAndSelect("product_line.products", "products")
      .where("product_line.id IN (:...product_line_ids)", { product_line_ids })
      .andWhere("products.baohanh_count > 0")
      .andWhere(
        new Brackets((qb) => {
          if (sanxuat_id) qb.andWhere("products.sanxuat_id = :sanxuat_id", { sanxuat_id });
          if (daily_id) qb.andWhere("products.daily_id = :daily_id", { daily_id });
          return "9001 = 9001";
        })
      )
      .getMany();

    // Danh sách các dòng sản phẩm không có sản phẩm bị lỗi
    const product_line_ids_without_error = product_line_ids.filter(
      (id) => !product_lines.some((product_line) => product_line.id === id)
    );
    const product_lines_without_error = await productLineRepo.findBy({ id: In(product_line_ids_without_error) });
    const ps = product_lines_without_error.map((p) => {
      let { product_count, ...rest } = p;
      return {
        ...rest,
        total_product_count: product_count,
        product_count: 0,
        ratio: 0,
      };
    });

    const new_product_lines = await Promise.all(
      product_lines.map(async (product_line) => {
        const total_product_count = await product_line.getProductCount();
        let { products, ...rest } = product_line;
        return {
          ...rest,
          total_product_count,
          product_count: product_line.product_count,
          ratio: product_line.product_count / total_product_count,
        };
      })
    );

    new_product_lines.push(...ps);

    const total = new_product_lines.length;
    return res.json({ total, result: new_product_lines });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

const router = Router();

router.get("/", protectRoute, restrictTo("admin", "san_xuat", "dai_ly", "bao_hanh"), getStats);
router.get("/exportToDailyStats", protectRoute, restrictTo("san_xuat"), exportToDailyStats);
router.get("/soldToCustomerStats", protectRoute, restrictTo("dai_ly"), soldToCustomerStats);
router.post("/errorStats", protectRoute, restrictTo("san_xuat"), getErrorStats);

export default router;
