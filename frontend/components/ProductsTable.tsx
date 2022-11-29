import { Product, readableProductStatuses } from "../helpers/types";

type Props = {
  products: Product[];
};
export default function ProductsTable({ products }: Props) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th className="w-[8%]">ID</th>
          <th className="w-[30%]">Dòng sản phẩm</th>
          <th className="w-[12%]">Trạng thái</th>
          <th className="w-[40%]">Địa điểm hiện tại</th>
          <th className="w-[10%]">Số lần bảo hành</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <tr key={product.id} className="cursor-pointer hover:bg-slate-300">
            <td>{product.id}</td>
            <td>{product.product_line.model}</td>
            <td>{readableProductStatuses[product.status]}</td>
            <td>{product.possesser.address}</td>
            <td>{product.baohanh_count} lần</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
