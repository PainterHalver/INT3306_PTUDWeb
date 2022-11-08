import { Expose } from "class-transformer";
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

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

  // Kiểm tra loại user đúng là tương thích với trạng thái của sản phẩm
  // FIXME: Có vẻ Listener này không hoạt động
  @BeforeInsert()
  @BeforeUpdate()
  validateStatusAndPossesser() {
    try {
      console.log("Hello");
      const { status, customer, user } = this;
      if (status === "moi_san_xuat" && user?.account_type !== "san_xuat") {
        throw new Error("Sản phẩm mới sản xuất phải ở kho của cơ sở sản xuất");
      } else if (status === "dua_ve_dai_ly" && user?.account_type !== "dai_ly") {
        throw new Error("Sản phẩm đưa về đại lý phải ở kho của đại lý");
      } else if (status === "da_ban" && !customer) {
        throw new Error("Sản phẩm đã bán phải do người dùng sở hữu");
      } else if (status === "loi_can_bao_hanh" && user?.account_type !== "dai_ly") {
        throw new Error("Sản phẩm lỗi cần bảo hành ở đại lý đã nhận lại từ khách hàng");
      } else if (status === "dang_sua_chua_bao_hanh" && user?.account_type !== "bao_hanh") {
        throw new Error("Sản phẩm đang sửa chữa bảo hành phải ở cơ sở bảo hành");
      } else if (status === "da_bao_hanh_xong" && user?.account_type !== "dai_ly") {
        throw new Error("Sản phẩm đã bảo hành xong phải ở kho của đại lý");
      } else if (status === "da_tra_lai_bao_hanh_cho_khach_hang" && !customer) {
        throw new Error("Sản phẩm đã trả lại cho khách hàng phải trả lại cho người dùng");
      } else if (status === "loi_can_tra_ve_nha_may" && user?.account_type !== "bao_hanh") {
        throw new Error("Sản phẩm lỗi cần trả về nhà máy phải ở cơ sở bảo hành");
      } else if (status === "loi_da_dua_ve_co_so_san_xuat" && user?.account_type !== "san_xuat") {
        throw new Error("Sản phẩm lỗi đã đưa về nơi sản xuất phải ở cơ sở sản xuất");
      } else if (status === "loi_can_trieu_hoi" && !customer) {
        throw new Error("Sản phẩm lỗi cần triệu hồi phải đang ở chỗ của người dùng");
      } else if (status === "het_thoi_gian_bao_hanh" && !customer) {
        throw new Error("Sản phẩm hết thời gian bảo hành phải đang ở chỗ của người dùng");
      } else if (status === "tra_lai_co_so_san_xuat" && user?.account_type !== "san_xuat") {
        throw new Error("Sản phẩm trả lại cơ sở sản xuất phải ở cơ sở sản xuất");
      }
    } catch (error) {
      console.log(error);
    }
  }
}
