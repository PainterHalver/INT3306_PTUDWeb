import { Product } from "../helpers/types";

type Props = {
  products: Product[];
};
export default function ProductsTable({ products }: Props) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Dòng sản phẩm</th>
          <th>Trạng thái</th>
          <th>Địa điểm hiện tại</th>
          <th>Số lần bảo hành</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <tr key={product.id} className="cursor-pointer hover:bg-slate-300">
            <td>{product.id}</td>
            <td>{product.product_line.model}</td>
            <td>{product.status}</td>
            <td>{product.possesser.address}</td>
            <td>{product.baohanh_count} lần</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
