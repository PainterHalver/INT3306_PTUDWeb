import { Request, Response, Router } from "express";
import { protectRoute, restrictTo } from "../middlewares/auth";

const getProducts = async (req: Request, res: Response) => {
  try {
  } catch (error) {
    console.log("GET_PRODUCTS", error);
    res.status(500).json({ error: "Lỗi hệ thống!" });
  }
};

const router = Router();

router.get("/", protectRoute, restrictTo("admin"), getProducts);

export default router;
