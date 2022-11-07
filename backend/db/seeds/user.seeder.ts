import { Seeder, SeederFactoryManager } from "typeorm-extension";
import { DataSource } from "typeorm";
import { User } from "../../src/entity/User";

export default class UserSeeder implements Seeder {
  public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<any> {
    const repository = dataSource.getRepository(User);

    // Xóa tất cả dữ liệu trong bảng
    await repository.clear();

    // Tạo dữ liệu mẫu
    await repository.insert([
      {
        username: "admin",
        name: "Admin BigCorp",
        password: "1111",
        account_type: "admin",
      },
      {
        username: "sanxuat",
        name: "Cơ sở sản xuất chi nhánh Hà Nội",
        password: "1111",
        account_type: "san_xuat",
      },
      {
        username: "daily",
        name: "Đại lý phân phối Nhất Nhất",
        password: "1111",
        account_type: "dai_ly",
      },
      {
        username: "baohanh",
        name: "Trung tâm bảo hành BigCorp chi nhánh Hà Nội",
        password: "1111",
        account_type: "bao_hanh",
      },
    ]);

    // ---------------------------------------------------

    // const userFactory = await factoryManager.get(User);
    // save 1 factory generated entity, to the database
    // await userFactory.save();

    // save 5 factory generated entities, to the database
    // await userFactory.saveMany(5);
  }
}
