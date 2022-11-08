import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { DataSource } from "typeorm";

import { User } from "../../src/entities/User";

export default class UserSeeder implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
    const repository = dataSource.getRepository(User);

    // Xóa tất cả dữ liệu trong bảng
    // await repository.clear();

    // Tạo dữ liệu mẫu
    await repository.insert([
      {
        username: "admin",
        name: "Admin BigCorp",
        password: "b59c67bf196a4758191e42f76670ceba", // md5 của "1111"
        account_type: "admin",
        address: "Số 185 Giảng Võ, Đống Đa, Hà Nội",
      },
      {
        username: "sanxuat",
        name: "Cơ sở sản xuất chi nhánh Hà Nội",
        password: "b59c67bf196a4758191e42f76670ceba", // md5 của "1111"
        account_type: "san_xuat",
        address: "25 Lý Thường Kiệt, P. Phan Chu Trinh, Q. Hoàn Kiếm, Hà Nội",
      },
      {
        username: "daily",
        name: "Đại lý phân phối Nhất Nhất",
        password: "b59c67bf196a4758191e42f76670ceba", // md5 của "1111"
        account_type: "dai_ly",
        address: "Số 136 Kim Ngưu, P.Thanh Nhàn, Q.Hai Bà Trưng, Hà Nội,",
      },
      {
        username: "baohanh",
        name: "Trung tâm bảo hành BigCorp chi nhánh Hà Nội",
        password: "b59c67bf196a4758191e42f76670ceba", // md5 của "1111"
        account_type: "bao_hanh",
        address: "115 Thái Hà, Q. Đống Đa, Hà Nội",
      },
    ]);

    // Dùng factory để tạo dữ liệu mẫu
    // ---------------------------------------------------

    // const userFactory = await factoryManager.get(User);
    // save 1 factory generated entity, to the database
    // await userFactory.save();

    // save 5 factory generated entities, to the database
    // await userFactory.saveMany(5);
  }
}
