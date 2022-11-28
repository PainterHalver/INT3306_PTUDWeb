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
          model: "iRobot Roomba i7",
          description: "Robot hút bụi thông minh",
          warranty_months: 12,
        },
        {
          name: "Roomba",
          model: "iRobot Roomba i7 Plus",
          description: "Robot hút bụi thông minh",
          warranty_months: 24,
        }, {
          name: "",
          model: "",
          description: "",
          warranty_months: 12,
          os: "ios 16",
          camera: "",
          cpu: "",
          ram: "",
          storage: "",
          battery: ""
        }
      ]);
    } catch (error) {
      console.log(error);
    }
  }
}
