import { IsPhoneNumber, validateOrReject } from "class-validator";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from "typeorm";

import BaseEntity from "./Entity";
import IHasAddressAndProducts from "./interfaces/IHasAdressAndProducts";
import { Product } from "./Product";

@Entity({ name: "customers" })
export class Customer extends BaseEntity implements IHasAddressAndProducts {
  @Column({ nullable: false })
  name: string;

  @IsPhoneNumber("VN", { message: "Số điện thoại không hợp lệ" })
  @Column({ unique: true, nullable: false })
  phone: string;

  @Column({ nullable: false })
  address: string;

  // Khi customer bị xóa thì set customer_id của các sản phẩm của customer đó thành null
  @OneToMany(() => Product, (product) => product.customer, { onDelete: "SET NULL" })
  products: Product[];

  @BeforeInsert()
  @BeforeUpdate()
  async validate() {
    await validateOrReject(this);
  }
}
