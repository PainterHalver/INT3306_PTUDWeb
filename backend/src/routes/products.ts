import { Request, Response, Router } from "express";
import { In } from "typeorm";
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

const exportToDaily = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user as User;
    const daily_id = req.body.daily_id || 0;
    const product_ids = req.body.product_ids || [];

    // Kiểm tra User có phải là cơ sở sản xuất hay không cho chắc
    if (!user || user.account_type !== "san_xuat") {
      return res.status(403).json({ error: "Bạn không có quyền thực hiện thao tác này!" });
    }

    // Validate input
    let errors: any = {};
    if (!daily_id) errors.daily_id = "Cần nhập mảng id sản phẩm!";
    if (!product_ids.length) errors.product_ids = "Cần nhập id đại lý!";
    if (Object.keys(errors).length > 0) return res.status(400).json({ errors });

    // Lấy đại lý
    const userRepo = AppDataSource.getRepository(User);
    const daily = await userRepo.findOneBy({ id: daily_id });
    if (!daily) return res.status(400).json({ error: "Đại lý không tồn tại!" });

    // Lấy danh sách các sản phẩm
    const productRepo = AppDataSource.getRepository(Product);
    const products = await productRepo.find({
      where: { id: In(product_ids) },
      relations: ["sanxuat"],
    });

    // Kiểm tra các sản phẩm có đang ở trạng thái "mới sản xuất"
    // và có đang thuộc kho của cơ sở sản xuất này không
    const invalidProducts = products.filter((product) => {
      return product.status !== "moi_san_xuat" || product.sanxuat.id !== user.id;
    });
    if (invalidProducts.length > 0) {
      return res.status(400).json({
        error: {
          product_ids: `Không có sản phẩm nào được cập nhật! Có sản phẩm không thuộc loại mới sản xuất hoặc không thuộc kho của cơ sở sản xuất. IDs: ${invalidProducts.map(
            (p) => p.id
          )}`,
        },
      });
    }

    // Cập nhật trạng thái các sản phẩm
    products.forEach((product) => {
      product.status = "dua_ve_dai_ly";
      product.daily = daily;
    });

    // Lưu các sản phẩm
    await productRepo.save(products);

    // Trả về danh sách id sản phẩm đã được cập nhật
    return res.status(200).json({ ids: products.map((product) => product.id) });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

const router = Router();

router.get("/", protectRoute, restrictTo("admin"), getProducts);
router.post("/", protectRoute, restrictTo("san_xuat"), createProducts);
router.post("/exportToDaily", protectRoute, restrictTo("san_xuat"), exportToDaily);

export default router;
