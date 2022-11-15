import { User } from "../src/entities/User";

/**
 * Dùng để lưu thông tin của user trong token
 */
export type JWTUserPayload = {
  username: string;
  account_type: User["account_type"];
};

/**
 * Các loại tài khoản
 * https://dev.to/hansott/how-to-check-if-string-is-member-of-union-type-1j4m
 */
export const accountTypes = ["admin", "san_xuat", "dai_ly", "bao_hanh"] as const;
export type AccountType = typeof accountTypes[number];

export function isAccountType(value: any): value is AccountType {
  return accountTypes.includes(value);
}

/**
 * Các trạng thái của sản phẩm
 */
export const productStatuses = [
  "moi_san_xuat",
  "dua_ve_dai_ly",
  "da_ban",
  "loi_can_bao_hanh",
  "dang_sua_chua_bao_hanh",
  "da_bao_hanh_xong",
  "da_tra_lai_bao_hanh_cho_khach_hang",
  "loi_can_tra_ve_nha_may",
  "loi_da_dua_ve_co_so_san_xuat",
  "loi_can_trieu_hoi",
  "het_thoi_gian_bao_hanh",
  "tra_lai_co_so_san_xuat",
] as const;
export type ProductStatus = typeof productStatuses[number];

export function isProductStatus(value: any): value is ProductStatus {
  return productStatuses.includes(value);
}
