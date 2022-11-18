import { CronJob } from "cron";
import { In } from "typeorm";

import { AppDataSource } from "../data-source";
import { Product } from "../entities/Product";
import { warrantyStillValid } from "./utils";

/**
 * Job cập nhật trạng thái bảo hành chạy mỗi ngày lúc 00:00
 * Chưa test
 */
export const updateBaohanhStatusJob = new CronJob("0 0 * * *", async () => {
  // Lấy danh sách bảo hành hết hạn
  const productRepo = AppDataSource.getRepository(Product);
  const products = await productRepo.find({
    where: { status: In(["da_ban", "da_tra_lai_bao_hanh_cho_khach_hang", "loi_can_trieu_hoi"]) },
    relations: ["product_line", "customer"],
  });
  const needUpdateProducts = products.filter((product) => !warrantyStillValid(product));
  // Cập nhật trạng thái
  needUpdateProducts.forEach((product) => {
    product.status = "het_thoi_gian_bao_hanh";
  });
  const updatedProducts = await productRepo.save(needUpdateProducts);
  console.log(`${updatedProducts.length} sản phẩm đã hết hạn bảo hành!`);
});
