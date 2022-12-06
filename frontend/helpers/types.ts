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
export const readableProductStatuses = {
  moi_san_xuat: "Mới sản xuất",
  dua_ve_dai_ly_ON_THE_WAY: "Đưa về đại lý (Đang vận chuyển)",
  dua_ve_dai_ly: "Đưa về đại lý",
  da_ban: "Đã bán",
  loi_can_bao_hanh: "Lỗi cần bảo hành",
  dang_sua_chua_bao_hanh_ON_THE_WAY: "Đang sửa chữa bảo hành (Đang vận chuyển)",
  dang_sua_chua_bao_hanh: "Đang sửa chữa bảo hành",
  da_bao_hanh_xong_ON_THE_WAY: "Đã bảo hành xong (Đang vận chuyển)",
  da_bao_hanh_xong: "Đã bảo hành xong",
  da_tra_lai_bao_hanh_cho_khach_hang: "Đã trả lại bảo hành cho khách hàng",
  loi_can_tra_ve_nha_may: "Lỗi cần trả về nhà máy",
  loi_da_dua_ve_co_so_san_xuat_ON_THE_WAY: "Lỗi đã đưa về cơ sở sản xuất (Đang vận chuyển)",
  loi_da_dua_ve_co_so_san_xuat: "Lỗi đã đưa về cơ sở sản xuất",
  loi_can_trieu_hoi: "Lỗi cần triệu hồi",
  het_thoi_gian_bao_hanh: "Hết thời gian bảo hành",
  tra_lai_co_so_san_xuat: "Trả lại cơ sở sản xuất",
};
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
      label: string;
      href: string;
    }[];
    receive: {
      from: ProductStatus[];
      to: ProductStatus;
      label: string;
      href: string;
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
        label: "Xuất sản phẩm tới đại lý",
        href: "/main/products/send/export-to-daily",
      },
    ],
    receive: [
      {
        from: ["loi_da_dua_ve_co_so_san_xuat_ON_THE_WAY"],
        to: "loi_da_dua_ve_co_so_san_xuat",
        label: "Nhận lại sản phẩm lỗi",
        href: "/main/products/receive/faulty-product-from-baohanh",
      },
      {
        from: ["dua_ve_dai_ly"],
        to: "tra_lai_co_so_san_xuat",
        label: "Nhận sản phẩm không bán được",
        href: "/main/products/receive/unsold-product",
      },
    ],
  },
  dai_ly: {
    send: [
      {
        from: ["dua_ve_dai_ly"],
        to: "da_ban",
        label: "Bán cho khách hàng",
        href: "/main/products/send/sell-to-customer",
      },
      {
        from: ["loi_can_bao_hanh"],
        to: "dang_sua_chua_bao_hanh_ON_THE_WAY",
        label: "Gửi tới trung tâm bảo hành",
        href: "/main/products/send/to-warranty",
      },
      {
        from: ["da_bao_hanh_xong"],
        to: "da_tra_lai_bao_hanh_cho_khach_hang",
        label: "Trả lại sản phẩm bảo hành cho khách hàng",
        href: "/main/products/send/return-warranty-to-customer",
      },
      {
        from: ["loi_can_tra_ve_nha_may"],
        to: "loi_da_dua_ve_co_so_san_xuat_ON_THE_WAY",
        label: "Gửi sản phẩm bảo hành lỗi về nhà máy",
        href: "/main/products/send/return-warranty-to-factory",
      },
      {
        from: ["da_ban", "da_tra_lai_bao_hanh_cho_khach_hang"],
        to: "loi_can_trieu_hoi",
        label: "Triệu hồi sản phẩm lỗi",
        href: "/main/products/send/recall",
      },
    ],
    receive: [
      {
        from: ["dua_ve_dai_ly_ON_THE_WAY"],
        to: "dua_ve_dai_ly",
        label: "Nhận sản phẩm mới từ nhà máy",
        href: "/main/products/receive/new-products",
      },
      {
        from: ["da_ban", "loi_can_trieu_hoi", "da_tra_lai_bao_hanh_cho_khach_hang"],
        to: "loi_can_bao_hanh",
        label: "Nhận sản phẩm lỗi từ khách hàng",
        href: "/main/products/receive/faulty-products-from-customer",
      },
      {
        from: ["da_bao_hanh_xong_ON_THE_WAY"],
        to: "da_bao_hanh_xong",
        label: "Nhận sản phẩm đã sửa chữa từ trung tâm bảo hành",
        href: "/main/products/receive/warranty-products",
      },
    ],
  },
  bao_hanh: {
    send: [
      {
        from: ["dang_sua_chua_bao_hanh"],
        to: "da_bao_hanh_xong_ON_THE_WAY",
        label: "Gửi sản phẩm đã sửa chữa về đại lý",
        href: "/main/products/send/warranty-back-to-daily",
      },
      {
        from: ["dang_sua_chua_bao_hanh"],
        to: "loi_can_tra_ve_nha_may",
        label: "Đánh dấu sản phẩm lỗi cần trả về nhà máy",
        href: "/main/products/send/error-back-to-factory",
      },
    ],
    receive: [
      {
        from: ["dang_sua_chua_bao_hanh_ON_THE_WAY"],
        to: "dang_sua_chua_bao_hanh",
        label: "Nhận sản phẩm lỗi từ đại lý",
        href: "/main/products/receive/faulty-products-from-daily",
      },
    ],
  },
};

/**
 * Type cho payload của route gửi và nhận
 */
export type SendPayload = {
  status: ProductStatus;
  product_ids: number[];
  daily_id?: number;
  customer_id?: number;
  baohanh_id?: number;
};

export type ReceivePayload = {
  status: ProductStatus;
  product_ids: number[];
};
