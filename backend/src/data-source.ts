import "reflect-metadata";
import { DataSource, DataSourceOptions } from "typeorm";
import { SeederOptions } from "typeorm-extension";

import { User } from "./entity/User";

const options: DataSourceOptions & SeederOptions = {
  type: "sqlite",
  database: "./db/production_move.db",
  synchronize: true,
  logging: false,
  entities: [User],
  migrations: [],
  subscribers: [],
};

export const AppDataSource = new DataSource(options);
