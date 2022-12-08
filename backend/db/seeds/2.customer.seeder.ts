import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { DataSource } from "typeorm";

import { Customer } from "../../src/entities/Customer";
import names from "../mock_datas/vietnamese_names";
import addresses from "../mock_datas/addresses";
import { randomElement } from "../../src/helpers/utils";

export default class CustomerSeeder implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
    console.log("Chạy Seeder cho bảng Customer");
    const repository = dataSource.getRepository(Customer);

    // Tạo dữ liệu mẫu
    await repository.insert([
      {
        name: "Lê Văn A",
        phone: "0987654321",
        address: "Số 116 Giảng Võ, Đống Đa, Hà Nội",
      },
      {
        name: "Nguyễn Thị B",
        phone: "0987123321",
        address: "155 Nguyễn Hoàng, Mỹ Đình, Nam Từ Liêm, Hà Nội",
      },
      {
        name: "Trần Minh C",
        phone: "0986666333",
        address: "E6 Phạm Hùng, Mễ Trì, Nam Từ Liêm, Hà Nội",
      },
    ]);

    // Tạo dữ liệu ngẫu nhiên
    const customers = [];
    for (let i = 0; i < 10; i++) {
      const phone = "098765" + (1000 + i);

      customers.push({
        name: randomElement(names),
        phone: phone,
        address: randomElement(addresses),
      });
    }

    await repository.insert(customers);
  }
}
