import { Expose } from "class-transformer";
import { Validate, validateOrReject } from "class-validator";
import { BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { IsBaoHanhUser, IsDaiLyUser, IsSanXuatUser } from "../../helpers/decorators";

import { ProductStatus } from "../../helpers/types";
import { Customer } from "./Customer";
import { ProductLine } from "./ProductLine";
import { User } from "./User";

@Entity({ name: "products" })
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ProductLine, (product_line) => product_line.products, { onDelete: "CASCADE" })
  @JoinColumn({ name: "product_line_id" })
  product_line: ProductLine;

  @Column({ nullable: false })
  status: ProductStatus;

  @ManyToOne(() => Customer, (customer) => customer.products, { onDelete: "SET NULL" })
  @JoinColumn({ name: "customer_id" })
  customer: Customer;

  @ManyToOne(() => User, (user) => user.products)
  @Validate(IsSanXuatUser, { message: "Người dùng không thuộc loại san_xuat" })
  @JoinColumn({ name: "sanxuat_id" })
  sanxuat: User;

  @ManyToOne(() => User, (user) => user.products)
  @Validate(IsDaiLyUser, { message: "Người dùng không thuộc loại dai_ly" })
  @JoinColumn({ name: "daily_id" })
  daily: User;

  @ManyToOne(() => User, (user) => user.products)
  @Validate(IsBaoHanhUser, { message: "Người dùng không thuộc loại bao_hanh" })
  @JoinColumn({ name: "baohanh_id" })
  baohanh: User;

  /**
   * Trả về User hiện tại mà sản phẩm này đang ở
   */
  @Expose()
  get possesser(): User | Customer {
    const customerStatuses: ProductStatus[] = [
      "da_ban",
      "da_tra_lai_bao_hanh_cho_khach_hang",
      "loi_can_trieu_hoi",
      "het_thoi_gian_bao_hanh",
    ];
    const sanxuatStatuses: ProductStatus[] = ["moi_san_xuat", "loi_da_dua_ve_co_so_san_xuat", "tra_lai_co_so_san_xuat"];
    const dailyStatuses: ProductStatus[] = ["dua_ve_dai_ly", "loi_can_bao_hanh", "da_bao_hanh_xong"];
    const baohanhStatuses: ProductStatus[] = ["dang_sua_chua_bao_hanh", "loi_can_tra_ve_nha_may"];

    if (customerStatuses.includes(this.status)) {
      return this.customer;
    } else if (sanxuatStatuses.includes(this.status)) {
      return this.sanxuat;
    } else if (dailyStatuses.includes(this.status)) {
      return this.daily;
    }
    return this.baohanh;
  }

  /**
   * Kiểm tra loại user đúng là tương thích với trạng thái của sản phẩm
   */
  @BeforeInsert()
  @BeforeUpdate()
  async validateStatusAndPossesser() {
    // FIXME: Có vẻ Listener này không hoạt động
    await validateOrReject(this);
    try {
      process.stdout.write(`Validate sản phẩm id ${this.id}... `);
      const { status, customer, sanxuat, baohanh, daily } = this;
      if (status === "moi_san_xuat" && (!sanxuat || sanxuat.account_type !== "san_xuat")) {
        throw new Error("Sản phẩm mới sản xuất phải ở kho của cơ sở sản xuất");
      } else if (status === "dua_ve_dai_ly" && (!daily || daily.account_type !== "dai_ly")) {
        throw new Error("Sản phẩm đưa về đại lý phải ở kho của đại lý");
      } else if (status === "da_ban" && !customer) {
        throw new Error("Sản phẩm đã bán phải do người dùng sở hữu");
      } else if (status === "loi_can_bao_hanh" && (!daily || daily.account_type !== "dai_ly")) {
        throw new Error("Sản phẩm lỗi cần bảo hành ở đại lý đã nhận lại từ khách hàng");
      } else if (status === "dang_sua_chua_bao_hanh" && (!baohanh || baohanh.account_type !== "bao_hanh")) {
        throw new Error("Sản phẩm đang sửa chữa bảo hành phải ở cơ sở bảo hành");
      } else if (status === "da_bao_hanh_xong" && (!daily || daily.account_type !== "dai_ly")) {
        throw new Error("Sản phẩm đã bảo hành xong phải ở kho của đại lý");
      } else if (status === "da_tra_lai_bao_hanh_cho_khach_hang" && !customer) {
        throw new Error("Sản phẩm đã trả lại cho khách hàng phải trả lại cho người dùng");
      } else if (status === "loi_can_tra_ve_nha_may" && (!baohanh || baohanh.account_type !== "bao_hanh")) {
        throw new Error("Sản phẩm lỗi cần trả về nhà máy phải ở cơ sở bảo hành");
      } else if (status === "loi_da_dua_ve_co_so_san_xuat" && (!sanxuat || sanxuat.account_type !== "san_xuat")) {
        throw new Error("Sản phẩm lỗi đã đưa về nơi sản xuất phải ở cơ sở sản xuất");
      } else if (status === "loi_can_trieu_hoi" && !customer) {
        throw new Error("Sản phẩm lỗi cần triệu hồi phải đang ở chỗ của người dùng");
      } else if (status === "het_thoi_gian_bao_hanh" && !customer) {
        throw new Error("Sản phẩm hết thời gian bảo hành phải đang ở chỗ của người dùng");
      } else if (status === "tra_lai_co_so_san_xuat" && (!sanxuat || sanxuat.account_type !== "san_xuat")) {
        throw new Error("Sản phẩm trả lại cơ sở sản xuất phải ở cơ sở sản xuất");
      }
      console.log("OK");
    } catch (error) {
      console.log(error);
    }
  }
}
