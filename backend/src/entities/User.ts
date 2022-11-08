import { Exclude } from "class-transformer";
import { Length } from "class-validator";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { AccountType } from "../types";
import IHasAddressAndProducts from "./interfaces/IHasAdressAndProducts";
import { Product } from "./Product";

@Entity({ name: "users" })
export class User implements IHasAddressAndProducts {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Length(3, 255, { message: "Username cần phải có trên 3 ký tự" })
  @Column({ unique: true, nullable: false })
  username: string;

  @Exclude()
  @Column({ nullable: false })
  password: string;

  @Column({ nullable: false })
  account_type: AccountType;

  @Column({ nullable: false })
  address: string;

  // Khi user bị xóa thì set user_id của các sản phẩm của user đó thành null
  @OneToMany(() => Product, (product) => product.user, { onDelete: "SET NULL" })
  products: Product[];
}
