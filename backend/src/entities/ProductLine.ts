import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { Product } from "./Product";

@Entity({ name: "product_lines" })
export class ProductLine {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => Product, (product) => product.product_line)
  products: Product[];
}
