import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { DataSource } from "typeorm";

import { ProductLine } from "../../src/entities/ProductLine";

export default class ProductLineSeeder implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
    try {
      console.log("Chạy Seeder cho bảng ProductLine");

      const repository = dataSource.getRepository(ProductLine);

      // Tạo dữ liệu mẫu
      await repository.insert([
        {
          name: "Roomba",
          description: "Robot hút bụi thông minh",
        },
      ]);
    } catch (error) {
      console.log(error);
    }
  }
}
