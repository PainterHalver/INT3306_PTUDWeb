import { User } from "./entities/User";

/**
 * Dùng để lưu thông tin của user trong token
 */
export type JWTUserPayload = {
  username: string;
  account_type: User["account_type"];
};

/**
 * Các loại tài khoản
 */
export type AccountType = "admin" | "san_xuat" | "dai_ly" | "bao_hanh";

/**
 * Các trạng thái của sản phẩm
 */
export type ProductStatus =
  | "moi_san_xuat"
  | "dua_ve_dai_ly"
  | "da_ban"
  | "loi_can_bao_hanh"
  | "dang_sua_chua_bao_hanh"
  | "da_bao_hanh_xong"
  | "da_tra_lai_bao_hanh_cho_khach_hang"
  | "loi_can_tra_ve_nha_may"
  | "loi_da_dua_ve_co_so_san_xuat"
  | "loi_can_trieu_hoi"
  | "het_thoi_gian_bao_hanh"
  | "tra_lai_co_so_san_xuat";
