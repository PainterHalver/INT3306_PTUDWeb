import { Exclude } from "class-transformer";
import { Length, Validate, validateOrReject } from "class-validator";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from "typeorm";

import { AccountType } from "../../helpers/types";
import { IsAccountType } from "../../helpers/validators";
import BaseEntity from "./Entity";
import IHasAddressAndProducts from "./interfaces/IHasAdressAndProducts";
import { Product } from "./Product";

@Entity({ name: "users" })
export class User extends BaseEntity implements IHasAddressAndProducts {
  @Column({ nullable: false })
  name: string;

  @Length(3, 255, { message: "Username cần phải có trên 3 ký tự" })
  @Column({ unique: true, nullable: false })
  username: string;

  @Exclude()
  @Column({ nullable: false })
  password: string;

  @Column({ nullable: false })
  @Validate(IsAccountType, { message: "Không đúng loại tài khoản" })
  account_type: AccountType;

  @Column({ nullable: false })
  address: string;

  // Khi user bị xóa thì set user_id của các sản phẩm của user đó thành null
  @OneToMany(() => Product, (product) => product.sanxuat, { onDelete: "SET NULL" })
  @OneToMany(() => Product, (product) => product.daily, { onDelete: "SET NULL" })
  @OneToMany(() => Product, (product) => product.baohanh, { onDelete: "SET NULL" })
  products: Product[];

  // Kiểm tra account_type có hợp lệ hay không trước khi lưu vào database
  @BeforeInsert()
  @BeforeUpdate()
  async validate() {
    await validateOrReject(this);
  }
}
