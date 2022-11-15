import { Request, Response, Router } from "express";
import { In } from "typeorm";
import { errorHandler } from "../../helpers/errorHandler";
import { isProductStatus, ProductStatus, productStatuses } from "../../helpers/types";

import { AppDataSource } from "../data-source";
import { Customer } from "../entities/Customer";
import { Product } from "../entities/Product";
import { ProductLine } from "../entities/ProductLine";
import { User } from "../entities/User";
import { protectRoute, restrictTo } from "../middlewares/auth";

const userRepo = AppDataSource.getRepository(User);
const productLineRepo = AppDataSource.getRepository(ProductLine);
const productRepo = AppDataSource.getRepository(Product);
const customerRepo = AppDataSource.getRepository(Customer);

/**
 * Xem danh sách sản phẩm theo trạng thái và theo cơ sở sản xuất, đại lý phân phối và trung tâm bảo hành.
 */
const getProducts = async (req: Request, res: Response) => {
  try {
    const status = req.query.status || "";
    const daily_id = req.query.daily_id || 0;
    const sanxuat_id = req.query.sanxuat_id || 0;
    const baohanh_id = req.query.baohanh_id || 0;
    const customer_id = req.query.customer_id || 0;
    const product_line_id = req.query.product_line_id || 0;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    // Lấy danh sách sản phẩm
    const products = await productRepo
      .createQueryBuilder("product")
      .leftJoinAndSelect("product.product_line", "product_line")
      .leftJoinAndSelect("product.daily", "daily")
      .leftJoinAndSelect("product.sanxuat", "sanxuat")
      .leftJoinAndSelect("product.baohanh", "baohanh")
      .leftJoinAndSelect("product.customer", "customer")
      .where((qb) => {
        qb.where(`product.status LIKE :status`, { status: `%${status}%` });
        if (product_line_id) qb = qb.andWhere(`product_line.id = :product_line_id`, { product_line_id });
        if (daily_id) qb = qb.andWhere(`daily.id = :daily_id`, { daily_id });
        if (sanxuat_id) qb = qb.andWhere(`sanxuat.id = :sanxuat_id`, { sanxuat_id });
        if (baohanh_id) qb = qb.andWhere(`baohanh.id = :baohanh_id`, { baohanh_id });
        if (customer_id) qb = qb.andWhere(`customer.id = :customer_id`, { customer_id });
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
 * Trả về thông tin chi tiết của sản phẩm dựa trên id.
 */
const getProduct = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) return res.status(400).json({ errors: { id: "Id không hợp lệ" } });

    // Lấy sản phẩm dựa trên id
    const product = await productRepo.findOne({
      where: { id },
      relations: ["product_line", "daily", "sanxuat", "baohanh", "customer"],
    });

    if (!product) return res.status(404).json({ errors: { message: "Không tìm thấy sản phẩm" } });

    // Trả về thông tin sản phẩm
    return res.json(product);
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
    const productLine = await productLineRepo.findOneBy({ id: product_line_id });
    if (!productLine) return res.status(400).json({ errors: { message: "Dòng sản phẩm không tồn tại!" } });

    // Thêm `amount` sản phẩm mới vào cơ sở sản xuất
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
    const daily = await userRepo.findOneBy({ id: daily_id });
    if (!daily) return res.status(400).json({ error: "Đại lý không tồn tại!" });

    // Lấy danh sách các sản phẩm
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
          product_ids: `Không có sản phẩm nào được cập nhật! Có sản phẩm không thuộc loại mới sản xuất hoặc không thuộc kho của cơ sở sản xuất. ID: [${invalidProducts.map(
            (p) => p.id
          )}]`,
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

/**
 * Đại lý bán sản phẩm cho khách hàng.
 */
const sellToCustomer = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user as User;
    const customer_id = req.body.customer_id || 0;
    const product_ids = req.body.product_ids || [];

    // Kiểm tra User có phải là đại lý hay không cho chắc
    if (!user || user.account_type !== "dai_ly") {
      return res.status(403).json({ errors: { message: "Bạn không có quyền thực hiện thao tác này!" } });
    }

    // Validate input
    let errors: any = {};
    if (!customer_id) errors.customer_id = "Cần nhập id khách hàng!";
    if (!product_ids.length) errors.product_ids = "Cần nhập mảng id sản phẩm!";
    if (Object.keys(errors).length > 0) return res.status(400).json({ errors });

    // Lấy khách hàng
    const customer = await customerRepo.findOneBy({ id: customer_id });
    if (!customer) return res.status(400).json({ errors: { message: "Khách hàng không tồn tại!" } });

    // Lấy danh sách các sản phẩm
    const products = await productRepo.find({
      where: { id: In(product_ids) },
      relations: ["daily"],
    });

    // Kiểm tra các sản phẩm có đang ở trạng thái "đưa về đại lý"
    // và có đang thuộc kho của đại lý này không
    const invalidProducts = products.filter((product) => {
      return product.status !== "dua_ve_dai_ly" || product.daily.id !== user.id;
    });
    if (invalidProducts.length > 0) {
      return res.status(400).json({
        errors: {
          product_ids: `Không có sản phẩm nào được cập nhật! Có sản phẩm không thuộc loại đưa về đại lý hoặc không thuộc kho của đại lý. ID: [${invalidProducts.map(
            (p) => p.id
          )}]`,
        },
      });
    }

    // Cập nhật trạng thái các sản phẩm nếu đã hợp lệ
    products.forEach((product) => {
      product.status = "da_ban";
      product.customer = customer;
      product.sold_to_customer_date = new Date();
    });

    // Lưu các sản phẩm
    const updatedProducts = await productRepo.save(products);

    // Trả về danh sách sản phẩm đã được cập nhật
    return res.status(200).json({ products: updatedProducts });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

/**
 * Nhận sản phẩm về nơi của user hiện tại.
 */
const receiveProducts = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user as User;
    const product_ids = req.body.product_ids || [];
    const current_status = req.body.current_status as ProductStatus;

    // Validate inputs
    let errors: any = {};
    if (product_ids.length === 0) errors.product_ids = "Cần nhập mảng id sản phẩm!";
    if (!current_status) errors.current_status = "Cần nhập trạng thái hiện tại!";
    if (!isProductStatus(current_status))
      errors.current_status = `Trạng thái sản phẩm không hợp lệ! Các trạng thái hợp lệ là [${productStatuses.join(
        ", "
      )}]`;

    // Check product_ids là mảng các số nguyên
    const invalidProductIds = product_ids.filter((id: any) => {
      return typeof id !== "number";
    });
    if (invalidProductIds.length > 0) {
      errors.product_ids = `Các id sản phẩm phải là số! ID: [${invalidProductIds}]`;
    }
    if (Object.keys(errors).length > 0) return res.status(400).json({ errors });

    // Lấy các sản phẩm
    const products = await productRepo.find({
      where: { id: In(product_ids) },
      relations: ["customer", "daily", "baohanh", "sanxuat"],
    });

    // Check các sản phẩm có đúng trạng thái hiện tại
    const invalidProducts = products.filter((product) => {
      return product.status !== current_status;
    });
    if (invalidProducts.length > 0) {
      return res.status(400).json({
        errors: {
          product_ids: `Không có sản phẩm nào được cập nhật! Các sản phẩm phải đang ở trạng thái '${current_status}'! ID: [${invalidProducts.map(
            (product) => product.id
          )}]`,
        },
      });
    }

    // Kiểm tra sản phẩm thuộc quyền quản lý của user hiện tại không
    const userPropertyName = user.account_type.replace("_", "") as "daily" | "baohanh" | "sanxuat";
    const invalidUserProducts = products.filter((product) => {
      return !product[userPropertyName] || product[userPropertyName].id !== user.id;
    });
    if (invalidUserProducts.length > 0) {
      return res.status(400).json({
        errors: {
          product_ids: `Không có sản phẩm nào được cập nhật! Có sản phẩm không thuộc quyền quản lý của User hiện tại! ID: [${invalidUserProducts.map(
            (product) => product.id
          )}]`,
        },
      });
    }

    // Kiểm tra và cập nhật các trạng thái sản phẩm tương ứng với user và trạng thái hiện tại
    if (user.account_type === "dai_ly") {
      //-----------------------------------------------------------------------------------
      // Sản phẩm trạng thái `đã bán` và đại lý chuyển về trạng thái 'lỗi cần bảo hành'
      if (current_status === "da_ban") {
        // 1. Lấy id user bảo hành và validate
        const baohanh_id = +req.body.baohanh_id || 0;
        if (!baohanh_id) {
          return res.status(400).json({ errors: { baohanh_id: "Cần nhập id trung tâm bảo hành!" } });
        }
        // 2. Lấy user bảo hành và validate
        const baohanh = await userRepo.findOneBy({ id: baohanh_id });
        if (!baohanh || baohanh.account_type !== "bao_hanh") {
          return res.status(400).json({
            errors: { baohanh_id: "Không tìm thấy trung tâm bảo hành hoặc id không phải của trung tâm bảo hành!" },
          });
        }
        // 3. Cập nhật trạng thái và trả về sản phẩm
        products.forEach((product) => {
          product.status = "loi_can_bao_hanh";
          product.baohanh = baohanh;
          product.baohanh_count += 1;
        });
        const updatedProducts = await productRepo.save(products);
        return res.status(200).json(updatedProducts);
      } else if (current_status === "dang_sua_chua_bao_hanh") {
        // -----------------------------------------------------------------------------------
        // Sản phẩm đã bảo hành xong và đã trở về đại lý
        products.forEach((product) => {
          product.status = "da_bao_hanh_xong";
        });
        const updatedProducts = await productRepo.save(products);
        return res.status(200).json(updatedProducts);
      } else {
        // -----------------------------------------------------------------------------------
        // Không trong các trạng thái xử lý của đại lý
        return res
          .status(400)
          .json({ errors: { message: "Người dùng loại đại lý không thể cập nhật sản phẩm ở trạng thái này!" } });
      }
    } else if (user.account_type === "bao_hanh") {
      // -----------------------------------------------------------------------------------
      // Sản phẩm trạng thái `lỗi cần bảo hành` và đã chuyển về trung tâm bảo hành
      if (current_status === "loi_can_bao_hanh") {
        products.forEach((product) => {
          product.status = "dang_sua_chua_bao_hanh";
        });
        const updatedProducts = await productRepo.save(products);
        return res.status(200).json(updatedProducts);
      } else {
        return res
          .status(400)
          .json({ errors: { message: "Người dùng loại bảo hành không thể cập nhật sản phẩm ở trạng thái này!" } });
      }
    }

    return res.status(400).json({
      message:
        "Không có sản phẩm nào được cập nhật! Nếu chạm được tới đây tức là cài đặt API vẫn chưa đúng HOẶC user hiện tại không phù hợp để thực hiện hành động!",
    });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

const router = Router();

router.get("/", protectRoute, restrictTo("admin", "bao_hanh", "dai_ly", "san_xuat"), getProducts);
router.post("/", protectRoute, restrictTo("san_xuat"), createProducts);
router.post("/exportToDaily", protectRoute, restrictTo("san_xuat"), exportToDaily);
router.post("/sellToCustomer", protectRoute, restrictTo("dai_ly"), sellToCustomer);
router.post("/receiveProducts", protectRoute, restrictTo("bao_hanh", "dai_ly", "san_xuat"), receiveProducts);

// Các route có params
router.get("/:id", protectRoute, restrictTo("admin", "bao_hanh", "dai_ly", "san_xuat"), getProduct);

export default router;
