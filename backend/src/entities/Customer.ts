import { IsPhoneNumber } from "class-validator";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import IHasAddressAndProducts from "./interfaces/IHasAdressAndProducts";
import { Product } from "./Product";

@Entity({ name: "customers" })
export class Customer implements IHasAddressAndProducts {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @IsPhoneNumber("VN", { message: "Số điện thoại không hợp lệ" })
  @Column({ unique: true, nullable: false })
  phone: string;

  @Column({ nullable: false })
  address: string;

  @OneToMany(() => Product, (product) => product.customer)
  products: Product[];
}
