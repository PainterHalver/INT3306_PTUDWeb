/**
 * Trả về một phần tử ngẫu nhiên trong mảng
 * @param arr mảng cần lấy phần tử
 * @returns phần tử ngẫu nhiên trong mảng
 */
export const randomElement = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};
