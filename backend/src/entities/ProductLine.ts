import { Exclude, Expose } from "class-transformer";
import { IsNumber, validateOrReject } from "class-validator";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from "typeorm";

import { AppDataSource } from "../data-source";
import BaseEntity from "./Entity";
import { Product } from "./Product";

@Entity({ name: "product_lines" })
export class ProductLine extends BaseEntity {
  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false, unique: true })
  model: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: false, type: "int" })
  @IsNumber({ allowNaN: false }, { message: "Thời hạn bảo hành phải là số" })
  warranty_months: number;

  @Exclude()
  @OneToMany(() => Product, (product) => product.product_line)
  products: Product[];

  /**
   * Hiển thị số lượng sản phẩm của dòng sản phẩm
   * Khi dùng @Expose() thì phải có toJSON() để trả về response
   * Phải thêm relations vào query để lấy được số lượng sản phẩm
   */
  @Expose() get product_count(): number {
    return this.products?.length;
  }

  async getProductCount(): Promise<number> {
    const productRepo = AppDataSource.getRepository(Product);
    const count = await productRepo
      .createQueryBuilder("product")
      .where("product_line_id = :id", { id: this.id })
      .getCount();
    return count;
  }

  @BeforeInsert()
  @BeforeUpdate()
  async validate() {
    await validateOrReject(this);
  }
}
