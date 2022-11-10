import { Request, Response, Router } from "express";
import { errorHandler } from "../../helpers/errorHandler";

import { AppDataSource } from "../data-source";
import { Product } from "../entities/Product";
import { ProductLine } from "../entities/ProductLine";
import { User } from "../entities/User";
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
    const product_line_id = req.query.product_line_id || 0;

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
        if (product_line_id) qb = qb.andWhere(`product_line.id = :product_line_id`, { product_line_id });
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
    errorHandler(error, req, res);
  }
};

/**
 * Cơ sở sản xuất thêm sản phẩm mới.
 */
const createProducts = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user as User;
    const product_line_id = req.body.product_line_id || 0;
    const amount = +req.body.amount || 0;

    // Kiểm tra User có phải là cơ sở sản xuất hay không cho chắc
    if (!user || user.account_type !== "san_xuat") {
      return res.status(403).json({ error: "Bạn không có quyền thực hiện thao tác này!" });
    }

    // Validate input
    let errors: any = {};
    if (!product_line_id) errors.product_line_id = "Không được để trống!";
    if (!amount) errors.amount = "Không được để trống!";
    if (Object.keys(errors).length > 0) return res.status(400).json({ errors });

    // Lấy dòng sản phẩm
    const productLineRepo = AppDataSource.getRepository(ProductLine);
    const productLine = await productLineRepo.findOneBy({ id: product_line_id });
    if (!productLine) return res.status(400).json({ error: "Dòng sản phẩm không tồn tại!" });

    // Thêm `amount` sản phẩm mới vào cơ sở sản xuất
    const productRepo = AppDataSource.getRepository(Product);
    let products = [];
    for (let i = 0; i < amount; i++) {
      const product = new Product();
      product.product_line = productLine;
      product.sanxuat = user;
      product.status = "moi_san_xuat";
      products.push(product);
    }
    const savedProducts = await productRepo.save(products);
    const ids = savedProducts.map((product) => product.id);

    // Trả về danh sách id sản phẩm mới
    return res.status(201).json({ ids });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

const router = Router();

router.get("/", protectRoute, restrictTo("admin"), getProducts);
router.post("/", protectRoute, restrictTo("san_xuat"), createProducts);

export default router;
