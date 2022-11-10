import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";

import { Product } from "../../src/entities/Product";
import { ProductLine } from "../../src/entities/ProductLine";
import { User } from "../../src/entities/User";

export default class ProductSeeder implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
    try {
      console.log("Chạy Seeder cho bảng Product");

      const repository = dataSource.getRepository(Product);
      const userRepo = dataSource.getRepository(User);
      const productLineRepo = dataSource.getRepository(ProductLine);

      // Lấy các loại user và productLine mẫu
      const sanxuatUser = (await userRepo.findOneBy({ account_type: "san_xuat" })) as User;
      const dailyUser = (await userRepo.findOneBy({ account_type: "dai_ly" })) as User;
      const baohanhUser = (await userRepo.findOneBy({ account_type: "bao_hanh" })) as User;
      const roombaProductLines = (await productLineRepo.findBy({ name: "Roomba" })) as ProductLine[];

      // Tạo dữ liệu mẫu
      await repository.insert([
        {
          product_line: roombaProductLines[0],
          status: "moi_san_xuat",
          sanxuat: sanxuatUser,
        },
        {
          product_line: roombaProductLines[0],
          status: "moi_san_xuat",
          sanxuat: sanxuatUser,
        },
        {
          product_line: roombaProductLines[1],
          status: "dua_ve_dai_ly",
          sanxuat: sanxuatUser,
          daily: dailyUser,
        },
      ]);

      console.log("Kiểm tra user validator");
      const products: Product[] = await repository.find({
        relations: ["sanxuat", "daily", "baohanh"],
      });
      await Promise.all(
        products.map(async (product) => {
          await product.validateStatusAndPossesser();
        })
      );
    } catch (error) {
      console.log(error);
    }
  }
}
