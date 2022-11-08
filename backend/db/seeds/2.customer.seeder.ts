import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { DataSource } from "typeorm";

import { Customer } from "../../src/entities/Customer";

export default class CustomerSeeder implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
    const repository = dataSource.getRepository(Customer);

    // Xóa tất cả dữ liệu trong bảng
    // await repository.clear();

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
        name: "Lê Văn A",
        phone: "0986666333",
        address: "E6 Phạm Hùng, Mễ Trì, Nam Từ Liêm, Hà Nội",
      },
    ]);
  }
}
