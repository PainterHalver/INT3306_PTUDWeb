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
 * Kiểm tra tất cả các sản phẩm trong mảng có thuộc đúng trạng thái hay không
 * @param products mảng chứa các sản phẩm
 * @param status trạng thái mà tất cả các sản phẩm phải có hiện tại
 */
const allHasStatus = (products: Product[], ...statuses: ProductStatus[]): [Product[], ProductStatus[]] => {
  const invalidProducts = products.filter((product) => {
    return statuses.indexOf(product.status) === -1;
  });
  return [invalidProducts, statuses];
};

/**
 * Cập nhật trạng thái sản phẩm
 */
const updateProductsStatus = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user as User;
    const product_ids = req.body.product_ids || [];
    const status = req.body.status as ProductStatus;

    // Validate inputs
    let errors: any = {};
    if (product_ids.length === 0) errors.product_ids = "Cần nhập mảng id sản phẩm!";
    if (!status) errors.status = "Cần nhập trạng thái muốn chuyển đổi!";
    if (!isProductStatus(status))
      errors.status = `Trạng thái sản phẩm không hợp lệ! Các trạng thái hợp lệ là [${productStatuses.join(", ")}]`;

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

    // Biến trả về của hàm check trạng thái các sản phẩm
    let invalidProducts: Product[] = [];
    let requiredStatuses: ProductStatus[];

    // ĐẠI LÝ PHÂN PHỐI
    if (user.account_type === "dai_ly") {
      //-----------------------------------------------------------------------------------
      // Sản phẩm trạng thái `đã bán` và đại lý chuyển về trạng thái 'lỗi cần bảo hành'
      if (status === "loi_can_bao_hanh") {
        // 0. Kiểm tra tất cả các sản phẩm có thuộc trạng thái `đã bán` hoặc `lỗi cần triệu hồi` hay không
        [invalidProducts, requiredStatuses] = allHasStatus(
          products,
          "da_ban",
          "loi_can_trieu_hoi",
          "da_tra_lai_bao_hanh_cho_khach_hang"
        );
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
          product.status = status;
          product.baohanh = baohanh;
          product.baohanh_count += 1;
        });
      }
      // -----------------------------------------------------------------------------------
      // Sản phẩm đã bảo hành xong và đã trở về đại lý
      else if (status === "da_bao_hanh_xong") {
        [invalidProducts, requiredStatuses] = allHasStatus(products, "dang_sua_chua_bao_hanh");
        products.forEach((product) => {
          product.status = status;
        });
      }
      //-----------------------------------------------------------------------------------
      // Gửi cho khách hàng nếu `đã bảo hành xong`
      else if (status === "da_tra_lai_bao_hanh_cho_khach_hang") {
        [invalidProducts, requiredStatuses] = allHasStatus(products, "da_bao_hanh_xong");
        products.forEach((product) => {
          product.status = status;
        });
      }
      //-----------------------------------------------------------------------------------
      // Sản phẩm đang ở chỗ khách hàng và đại lý cập nhật trạng thái `lỗi cần triệu hồi`
      else if (status === "loi_can_trieu_hoi") {
        [invalidProducts, requiredStatuses] = allHasStatus(products, "da_ban", "da_tra_lai_bao_hanh_cho_khach_hang");
        products.forEach((product) => {
          product.status = status;
        });
      }
      // -----------------------------------------------------------------------------------
      // Không trong các trạng thái xử lý của đại lý
      else {
        return res.status(400).json({
          errors: { message: `Người dùng loại ${user.account_type} không thể cập nhật sản phẩm ở trạng thái này!` },
        });
      }
    }
    // TRUNG TÂM BẢO HÀNH
    else if (user.account_type === "bao_hanh") {
      // -----------------------------------------------------------------------------------
      // Trung tâm bảo hành nhận sản phẩm `lỗi cần bảo hành` từ đại lý
      if (status === "dang_sua_chua_bao_hanh") {
        [invalidProducts, requiredStatuses] = allHasStatus(products, "loi_can_bao_hanh");
        products.forEach((product) => {
          product.status = status;
        });
      }
      // -----------------------------------------------------------------------------------
      // Sản phẩm đang bảo hành thì gặp lỗi và cần trả về nhà máy
      else if (status === "loi_can_tra_ve_nha_may") {
        [invalidProducts, requiredStatuses] = allHasStatus(products, "dang_sua_chua_bao_hanh");
        products.forEach((product) => {
          product.status = status;
        });
      } else {
        return res.status(400).json({
          errors: { message: `Người dùng loại ${user.account_type} không thể cập nhật sản phẩm ở trạng thái này!` },
        });
      }
    } else if (user.account_type === "san_xuat") {
      // -----------------------------------------------------------------------------------
      // Nhà máy nhận sản phẩm bảo hành lỗi từ trung tâm bảo hành
      if (status === "loi_da_dua_ve_co_so_san_xuat") {
        [invalidProducts, requiredStatuses] = allHasStatus(products, "loi_can_tra_ve_nha_may");
        products.forEach((product) => {
          product.status = status;
        });
      } else {
        return res.status(400).json({
          errors: { message: `Người dùng loại ${user.account_type} không thể cập nhật sản phẩm ở trạng thái này!` },
        });
      }
    }

    if (invalidProducts.length > 0) {
      return res.status(400).json({
        errors: {
          product_ids: `Không có sản phẩm nào được cập nhật! Các sản phẩm phải đang ở trạng thái '${requiredStatuses!}'! ID: [${invalidProducts.map(
            (product) => product.id
          )}]`,
          products: invalidProducts,
        },
      });
    }

    // Cập nhật sản phẩm
    const updatedProducts = await productRepo.save(products);
    return res.status(200).json(updatedProducts);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

const router = Router();

router.get("/", protectRoute, restrictTo("admin", "bao_hanh", "dai_ly", "san_xuat"), getProducts);
router.post("/", protectRoute, restrictTo("san_xuat"), createProducts);
router.post("/exportToDaily", protectRoute, restrictTo("san_xuat"), exportToDaily);
router.post("/sellToCustomer", protectRoute, restrictTo("dai_ly"), sellToCustomer);
router.post("/updateProductsStatus", protectRoute, restrictTo("bao_hanh", "dai_ly", "san_xuat"), updateProductsStatus);

// Các route có params
router.get("/:id", protectRoute, restrictTo("admin", "bao_hanh", "dai_ly", "san_xuat"), getProduct);

export default router;
