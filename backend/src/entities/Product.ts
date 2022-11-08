import { Expose } from "class-transformer";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { ProductStatus } from "../types";
import { Customer } from "./Customer";
import { User } from "./User";

@Entity({ name: "products" })
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  product_line: string;

  @Column({ nullable: false })
  product_name: string;

  @Column({ nullable: false })
  status: ProductStatus;

  @ManyToOne(() => Customer, (customer) => customer.products)
  customer: Customer;

  @ManyToOne(() => User, (user) => user.products)
  user: User;

  // Trả về đối tượng hiện tại mà sản phẩm này đang ở
  @Expose() get possesser(): User | Customer {
    return this.customer || this.user;
  }
}
