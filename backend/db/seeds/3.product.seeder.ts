import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { DataSource } from "typeorm";

import { Product } from "../../src/entities/Product";
import { User } from "../../src/entities/User";

export default class ProductSeeder implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
    const repository = dataSource.getRepository(Product);
    const userRepo = dataSource.getRepository(User);

    // Xóa tất cả dữ liệu trong bảng
    await repository.clear();

    // Tạo dữ liệu mẫu
    await repository.insert([
      {
        product_line: "Roomba",
        product_name: "iRobot Roomba i7",
        status: "moi_san_xuat",
        user: (await userRepo.findOneBy({ account_type: "san_xuat" })) as User,
      },
      {
        product_line: "Roomba",
        product_name: "iRobot Roomba i7 Plus",
        status: "moi_san_xuat",
        user: (await userRepo.findOneBy({ account_type: "san_xuat" })) as User,
      },
      {
        product_line: "Roomba",
        product_name: "iRobot Roomba i7",
        status: "dua_ve_dai_ly",
        user: (await userRepo.findOneBy({ account_type: "dai_ly" })) as User,
      },
    ]);
  }
}
