import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

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

  @ManyToOne(() => Customer, (customer) => customer.products)
  customer: Customer;

  @ManyToOne(() => User, (user) => user.products)
  user: User;
}
