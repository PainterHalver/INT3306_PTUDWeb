import { Request, Response, Router } from "express";
import { Like } from "typeorm";
import { z } from "zod";

import { AppDataSource } from "../data-source";
import { ProductLine } from "../entities/ProductLine";
import { protectRoute, restrictTo } from "../middlewares/auth";
import { errorHandler } from "../helpers/errorHandler";

/**
 * Lấy danh sách các dòng sản phẩm.
 */
const getProductLines = async (req: Request, res: Response) => {
  try {
    // TODO: Filter nếu cần

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const query = (req.query.query as string) || "";
    const offset = (page - 1) * limit;

    // Lấy danh sách ProductLine
    const productLineRepo = AppDataSource.getRepository(ProductLine);
    const [product_lines, count] = await productLineRepo.findAndCount({
      skip: offset,
      take: limit,
      order: {
        id: "ASC",
      },
      relations: ["products"],
      where: [{ name: Like(`%${query}%`) }, { model: Like(`%${query}%`) }, { description: Like(`%${query}%`) }],
    });
    const totalPages = Math.ceil(count / limit);

    // Trả về danh sách product_lines
    return res.json({ page, totalPages, count, product_lines });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

/**
 * Lấy một dòng sản phẩm theo ID.
 */
const getProductLine = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate dữ liệu
    let errors: any = {};
    if (!id || isNaN(parseInt(id))) errors.id = "ID không hợp lệ";
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    // Lấy ProductLine
    const productLineRepo = AppDataSource.getRepository(ProductLine);
    const productLine = await productLineRepo.findOne({
      where: { id: parseInt(id) },
      relations: ["products"],
    });
    if (!productLine) {
      return res.status(404).json({ errors: { message: "Không tìm thấy dòng sản phẩm" } });
    }

    // Trả về ProductLine
    return res.json(productLine);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

const productlineRequestSchema = z.object({
  name: z.string().min(1, "Tên dòng sản phẩm không được để trống").max(255),
  model: z.string().min(1, "Tên sản phẩm (model) không được để trống").max(255),
  description: z.string().optional(),
  warranty_months: z.number().min(1, "Thời gian bảo hành không được để trống"),
  os: z.string().optional(),
  cpu: z.string().optional(),
  ram: z.string().optional(),
  storage: z.string().optional(),
  camera: z.string().optional(),
  battery: z.string().optional(),
  price: z.coerce.string().regex(/^\d+$/, "Giá sản phẩm phải là số (nhập dạng string hoặc number đều được)").optional(),
});

/**
 * Tạo một dòng sản phẩm mới.
 */
const createProductLine = async (req: Request, res: Response) => {
  try {
    const { name, model, description, warranty_months, os, cpu, ram, storage, camera, battery, price } =
      productlineRequestSchema.parse(req.body);

    // Check xem name đã tồn tại chưa
    const productLineRepo = AppDataSource.getRepository(ProductLine);
    const productLine = await productLineRepo.findOneBy({ model });
    if (productLine) {
      return res.status(400).json({ errors: { model: "Tên Model đã tồn tại" } });
    }

    // Tạo ProductLine mới
    const newProductLine = productLineRepo.create({
      name,
      model,
      description,
      warranty_months,
      os,
      cpu,
      ram,
      storage,
      camera,
      battery,
      price,
    });
    const savedProductLine = await productLineRepo.save(newProductLine);

    // Trả về ProductLine mới
    return res.status(201).json(savedProductLine);
  } catch (error) {
    errorHandler(error, req, res);
  }
};

/**
 * Cập nhật thông tin một dòng sản phẩm.
 */
const updateProductLine = async (req: Request, res: Response) => {
  try {
    const { name, model, description, warranty_months, os, cpu, ram, storage, camera, battery, price } =
      productlineRequestSchema.parse(req.body);
    const { id } = req.params;

    // Validate dữ liệu
    let errors: any = {};
    if (!id || isNaN(parseInt(id))) errors.id = "ID không hợp lệ";
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    // Check xem ProductLine có tồn tại không
    const productLineRepo = AppDataSource.getRepository(ProductLine);
    const productLine = await productLineRepo.findOneBy({ id: parseInt(id) });
    if (!productLine) {
      return res.status(404).json({ errors: { message: "Không tìm thấy dòng sản phẩm" } });
    }

    // Cập nhật ProductLine
    productLine.name = name;
    productLine.model = model;
    productLine.description = description || productLine.description;
    productLine.warranty_months = warranty_months;
    productLine.os = os || productLine.os;
    productLine.cpu = cpu || productLine.cpu;
    productLine.ram = ram || productLine.ram;
    productLine.storage = storage || productLine.storage;
    productLine.camera = camera || productLine.camera;
    productLine.battery = battery || productLine.battery;
    productLine.price = price || productLine.price;
    const updatedProductLine = await productLineRepo.save(productLine);
    const product_count = await updatedProductLine.getProductCount();

    // Trả về ProductLine mới
    return res.json({ ...updatedProductLine, product_count });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

/**
 * Xóa một dòng sản phẩm.
 */
const deleteProductLine = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate dữ liệu
    let errors: any = {};
    if (!id || isNaN(parseInt(id))) errors.id = "ID không hợp lệ";
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    // Check xem ProductLine có tồn tại không
    const productLineRepo = AppDataSource.getRepository(ProductLine);
    const productLine = await productLineRepo.findOneBy({ id: parseInt(id) });
    if (!productLine) {
      return res.status(404).json({ errors: { message: "Không tìm thấy dòng sản phẩm" } });
    }

    // Xóa ProductLine
    await productLineRepo.delete({ id: parseInt(id) });

    return res.status(204).json({ message: "Xóa thành công" });
  } catch (error) {
    errorHandler(error, req, res);
  }
};

const router = Router();

router.get("/", protectRoute, restrictTo("admin", "bao_hanh", "dai_ly", "san_xuat"), getProductLines);
router.post("/", protectRoute, restrictTo("admin"), createProductLine);

// Các route có params
router.get("/:id", protectRoute, restrictTo("admin"), getProductLine);
router.put("/:id", protectRoute, restrictTo("admin"), updateProductLine);
router.delete("/:id", protectRoute, restrictTo("admin"), deleteProductLine);

export default router;
