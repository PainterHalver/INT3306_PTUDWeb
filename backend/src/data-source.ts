import "reflect-metadata";
import { DataSource, DataSourceOptions } from "typeorm";
import { SeederOptions } from "typeorm-extension";

import { Product } from "./entities/Product";
import { User } from "./entities/User";
import { Customer } from "./entities/Customer";
import { ProductLine } from "./entities/ProductLine";

const options: DataSourceOptions & SeederOptions = {
  type: "sqlite",
  database: "./db/production_move.db",
  synchronize: true,
  logging: true,
  entities: [User, Customer, ProductLine, Product],
  migrations: [],
  subscribers: [],
};

export const AppDataSource = new DataSource(options);
