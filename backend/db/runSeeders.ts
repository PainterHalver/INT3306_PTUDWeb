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
    entities: [User, Customer, Product],
  };

  const dataSource = new DataSource(options);
  await dataSource.initialize();

  runSeeders(dataSource, {
    seeds: ["db/seeds/**/*{.ts,.js}"],
    factories: ["db/factories/**/*{.ts,.js}"],
  });
})();
