import { instanceToPlain } from "class-transformer";
import { DataSource } from "typeorm";
import { Seeder, SeederFactoryManager } from "typeorm-extension";

import { randomElement } from "../../helpers/utils";
import { Customer } from "../../src/entities/Customer";
import { Product } from "../../src/entities/Product";
import { ProductLine } from "../../src/entities/ProductLine";
import { User } from "../../src/entities/User";
export default class ProductSeeder implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
    try {
      console.log("Chạy Seeder cho bảng Product");

      const repository = dataSource.getRepository(Product);
      const userRepo = dataSource.getRepository(User);
      const customerRepo = dataSource.getRepository(Customer);
      const productLineRepo = dataSource.getRepository(ProductLine);

      // Lấy các loại user và productLine mẫu
      const sanxuatUser = (await userRepo.findOneBy({ account_type: "san_xuat" })) as User;
      const dailyUser = (await userRepo.findOneBy({ account_type: "dai_ly" })) as User;
      const baohanhUser = (await userRepo.findOneBy({ account_type: "bao_hanh" })) as User;
      const roombaProductLines = (await productLineRepo.findBy({ name: "Roomba" })) as ProductLine[];
      const customers = await customerRepo.find();

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
          exported_to_daily_date: new Date("2022-10-10"),
        },
      ]);

      // Tạo các sản phẩm bán cho khách hàng
      // TODO: Chỉnh type không để any
      let soldProducts: any[] = [];
      for (let i = 0; i < customers.length * 2; i++) {
        const customer = randomElement(customers);
        const productLine = randomElement(roombaProductLines);
        const startDate = new Date("2022-10-10");
        const now = new Date();

        // Ngày sản xuất ngẫu nhiên từ 10/10/2022 đến hiện tại
        const exported_to_daily_date = new Date(
          startDate.getTime() + Math.random() * (now.getTime() - startDate.getTime())
        );
        // Ngày bán ngẫu nhiên từ ngày sản xuất đến hiện tại
        const sold_to_customer_date = new Date(
          exported_to_daily_date.getTime() + Math.random() * (now.getTime() - exported_to_daily_date.getTime())
        );

        const product = {
          product_line: productLine,
          status: "da_ban",
          sanxuat: sanxuatUser,
          daily: dailyUser,
          customer: customer,
          exported_to_daily_date,
          sold_to_customer_date,
        };

        soldProducts.push(product);
      }
      await repository.insert(soldProducts);

      console.log("Kiểm tra user validator");
      const products: Product[] = await repository.find({
        relations: ["sanxuat", "daily", "baohanh", "customer", "product_line"],
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
