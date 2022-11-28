export type User = {
  id: number;
  name: string;
  username: string;
  account_type: AccountType;
  address: string;
  token: string | undefined;
};

export type Productline = {
  id: number;
  name: string;
  model: string;
  description: string;
  warranty_months: number;
  product_count: number;
};

export type Product = {
  id: number;
  status: ProductStatus;
  product_line: Productline;
  sold_to_customer_date: string | null;
  exported_to_daily_date: string | null;
  baohanh_count: number;
  customer: Customer | null;
  sanxuat: User | null;
  daily: User | null;
  baohanh: User | null;
  possesser: User | Customer;
};

export type Customer = {
  id: number;
  name: string;
  address: string;
  phone: string;
};

/**
 * Các loại tài khoản
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
  "dua_ve_dai_ly_ON_THE_WAY",
  "dua_ve_dai_ly",
  "da_ban",
  "loi_can_bao_hanh",
  "dang_sua_chua_bao_hanh_ON_THE_WAY",
  "dang_sua_chua_bao_hanh",
  "da_bao_hanh_xong_ON_THE_WAY",
  "da_bao_hanh_xong",
  "da_tra_lai_bao_hanh_cho_khach_hang",
  "loi_can_tra_ve_nha_may",
  "loi_da_dua_ve_co_so_san_xuat_ON_THE_WAY",
  "loi_da_dua_ve_co_so_san_xuat",
  "loi_can_trieu_hoi",
  "het_thoi_gian_bao_hanh",
  "tra_lai_co_so_san_xuat",
] as const;
export type ProductStatus = typeof productStatuses[number];

export function isProductStatus(value: any): value is ProductStatus {
  return productStatuses.includes(value);
}

/**
 * Các trạng thái mà từng loại người dùng có thể gửi và nhận
 */
type updateableStatuses = {
  [keys in AccountType]: {
    send: {
      from: ProductStatus[];
      to: ProductStatus;
    }[];
    receive: {
      from: ProductStatus[];
      to: ProductStatus;
    }[];
  };
};

export const updateableStatuses: updateableStatuses = {
  admin: {
    send: [],
    receive: [],
  },
  san_xuat: {
    send: [
      {
        from: ["moi_san_xuat"],
        to: "dua_ve_dai_ly_ON_THE_WAY",
      },
    ],
    receive: [
      {
        from: ["loi_da_dua_ve_co_so_san_xuat_ON_THE_WAY"],
        to: "loi_da_dua_ve_co_so_san_xuat",
      },
      {
        from: ["dua_ve_dai_ly"],
        to: "tra_lai_co_so_san_xuat",
      },
    ],
  },
  dai_ly: {
    send: [
      {
        from: ["dua_ve_dai_ly"],
        to: "da_ban",
      },
      {
        from: ["loi_can_bao_hanh"],
        to: "dang_sua_chua_bao_hanh_ON_THE_WAY",
      },
      {
        from: ["da_bao_hanh_xong"],
        to: "da_tra_lai_bao_hanh_cho_khach_hang",
      },
      {
        from: ["loi_can_tra_ve_nha_may"],
        to: "loi_da_dua_ve_co_so_san_xuat_ON_THE_WAY",
      },
      {
        from: ["da_ban", "da_tra_lai_bao_hanh_cho_khach_hang"],
        to: "loi_can_trieu_hoi",
      },
    ],
    receive: [
      {
        from: ["dua_ve_dai_ly_ON_THE_WAY"],
        to: "dua_ve_dai_ly",
      },
      {
        from: ["da_ban", "loi_can_trieu_hoi", "da_tra_lai_bao_hanh_cho_khach_hang"],
        to: "loi_can_bao_hanh",
      },
      {
        from: ["da_bao_hanh_xong_ON_THE_WAY"],
        to: "da_bao_hanh_xong",
      },
    ],
  },
  bao_hanh: {
    send: [
      {
        from: ["dang_sua_chua_bao_hanh"],
        to: "da_bao_hanh_xong_ON_THE_WAY",
      },
      {
        from: ["dang_sua_chua_bao_hanh"],
        to: "loi_can_tra_ve_nha_may",
      },
    ],
    receive: [
      {
        from: ["dang_sua_chua_bao_hanh_ON_THE_WAY"],
        to: "dang_sua_chua_bao_hanh",
      },
    ],
  },
};
