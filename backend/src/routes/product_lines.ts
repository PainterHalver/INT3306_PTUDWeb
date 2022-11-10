import { Request, Response, Router } from "express";

import { AppDataSource } from "../data-source";
import { ProductLine } from "../entities/ProductLine";
import { protectRoute, restrictTo } from "../middlewares/auth";

/**
 * Lấy danh sách các dòng sản phẩm.
 */
const getProductLines = async (req: Request, res: Response) => {
  try {
    // TODO: Filter nếu cần

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
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
    });
    const totalPages = Math.ceil(count / limit);

    // Trả về danh sách product_lines
    return res.json({ page, totalPages, count, product_lines });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Lỗi hệ thống!" });
  }
};

/**
 * Tạo một dòng sản phẩm mới.
 */
const createProductLine = async (req: Request, res: Response) => {
  try {
    const { name, model, description } = req.body;

    // Validate dữ liệu
    let errors: any = {};
    if (!name) errors.name = "Tên dòng sản phẩm không được để trống";
    if (!model) errors.model = "Tên sản phẩm (model) không được để trống";
    if (Object.keys(errors).length > 0) {
      return res.status(400).json(errors);
    }

    // Check xem name đã tồn tại chưa
    const productLineRepo = AppDataSource.getRepository(ProductLine);
    const productLine = await productLineRepo.findOneBy({ name });
    if (productLine) {
      return res.status(400).json({ name: "Tên dòng sản phẩm đã tồn tại" });
    }

    // Tạo ProductLine mới
    const newProductLine = productLineRepo.create({
      name,
      model,
      description,
    });
    const savedProductLine = await productLineRepo.save(newProductLine);

    // Trả về ProductLine mới
    return res.status(201).json(savedProductLine);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Lỗi hệ thống!" });
  }
};

/**
 * Cập nhật thông tin một dòng sản phẩm.
 */
const updateProductLine = async (req: Request, res: Response) => {
  try {
    const { name, model, description } = req.body;
    const { id } = req.params;

    // Validate dữ liệu
    let errors: any = {};
    if (!name) errors.name = "Tên dòng sản phẩm không được để trống";
    if (!id || isNaN(parseInt(id))) errors.id = "ID không hợp lệ";
    if (!model) errors.model = "Tên sản phẩm (model) không được để trống";
    if (Object.keys(errors).length > 0) {
      return res.status(400).json(errors);
    }

    // Check xem ProductLine có tồn tại không
    const productLineRepo = AppDataSource.getRepository(ProductLine);
    const productLine = await productLineRepo.findOneBy({ id: parseInt(id) });
    if (!productLine) {
      return res.status(404).json({ error: "Không tìm thấy dòng sản phẩm" });
    }

    // Cập nhật ProductLine
    productLine.name = name;
    productLine.model = model;
    productLine.description = description;
    const updatedProductLine = await productLineRepo.save(productLine);
    const product_count = await updatedProductLine.getProductCount();

    // Trả về ProductLine mới
    return res.json({ ...updatedProductLine, product_count });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Lỗi hệ thống!" });
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
      return res.status(400).json(errors);
    }

    // Check xem ProductLine có tồn tại không
    const productLineRepo = AppDataSource.getRepository(ProductLine);
    const productLine = await productLineRepo.findOneBy({ id: parseInt(id) });
    if (!productLine) {
      return res.status(404).json({ error: "Không tìm thấy dòng sản phẩm" });
    }

    // Xóa ProductLine
    await productLineRepo.delete({ id: parseInt(id) });

    return res.status(204).json({ message: "Xóa thành công" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Lỗi hệ thống!" });
  }
};

const router = Router();

router.get("/", protectRoute, restrictTo("admin"), getProductLines);
router.post("/", protectRoute, restrictTo("admin"), createProductLine);
router.put("/:id", protectRoute, restrictTo("admin"), updateProductLine);
router.delete("/:id", protectRoute, restrictTo("admin"), deleteProductLine);

export default router;
