import { DataSource, DataSourceOptions } from "typeorm";
import { runSeeders } from "typeorm-extension";

import { Customer } from "../src/entities/Customer";
import { Product } from "../src/entities/Product";
import { User } from "../src/entities/User";

(async () => {
  const options: DataSourceOptions = {
    type: "sqlite",
    database: "./db/production_move.db",
    synchronize: true,
    logging: false,
    entities: [User, Customer, Product],
  };

  // Xóa tất cả dữ liệu trong database
  let dataSource = new DataSource(options);
  await dataSource.initialize();
  await dataSource.dropDatabase();
  await dataSource.destroy();

  // Khởi tạo lại database và chạy seeders
  dataSource = new DataSource(options);
  await dataSource.initialize();
  await runSeeders(dataSource, {
    seeds: ["db/seeds/**/*{.ts,.js}"],
    factories: ["db/factories/**/*{.ts,.js}"],
  });
})();
