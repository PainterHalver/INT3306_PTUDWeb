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
          name: "iPhone",
          model: "iPhone XXXXXS ULTRA MAX PRO 10TB",
          description: "",
          warranty_months: 120,
          os: "ios 19",
          camera: "128MP",
          cpu: "itel i9",
          ram: "28GB + 4GB",
          storage: "10TB",
          battery: "22000mAh",
          price: "150000"
        }
      ]);
    } catch (error) {
      console.log(error);
    }
  }
}
