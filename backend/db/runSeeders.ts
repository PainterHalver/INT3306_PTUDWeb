import { DataSource, DataSourceOptions } from "typeorm";
import { runSeeders } from "typeorm-extension";
import { User } from "../src/entity/User";

(async () => {
  const options: DataSourceOptions = {
    type: "sqlite",
    database: "./db/production_move.db",
    entities: [User],
  };

  const dataSource = new DataSource(options);
  await dataSource.initialize();

  runSeeders(dataSource, {
    seeds: ["db/seeds/**/*{.ts,.js}"],
    factories: ["db/factories/**/*{.ts,.js}"],
  });
})();
