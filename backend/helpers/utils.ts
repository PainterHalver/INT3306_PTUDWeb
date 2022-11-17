import { Product } from "../src/entities/Product";

/**
 * Trả về một phần tử ngẫu nhiên trong mảng
 * @param arr mảng cần lấy phần tử
 * @returns phần tử ngẫu nhiên trong mảng
 */
export const randomElement = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

/**
 * Kiểm tra sản phẩm có còn bảo hành hay không
 * @param product Sản phẩm cần kiểm tra
 * @returns sản phẩm có hết hạn bảo hành hay không
 */
export const warrantyStillValid = (product: Product): boolean => {
  if (!product.product_line) throw new Error(`Product truyền vào hàm 'warrantyStillValid' không có product_line`);

  const warrantyExpiredDate = new Date(product.sold_to_customer_date.getMonth() + product.product_line.warranty_months);

  return warrantyExpiredDate.getTime() < new Date().getTime();
};
