import { Exclude } from "class-transformer";
import { Length } from "class-validator";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

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
  account_type: "admin" | "san_xuat" | "dai_ly" | "bao_hanh";

  @Column({ nullable: false })
  address: string;

  @OneToMany(() => Product, (product) => product.user)
  products: Product[];
}
