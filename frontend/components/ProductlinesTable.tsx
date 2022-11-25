import { Productline } from "../helpers/types";

type Props = {
  productlines: Productline[];
};
export default function ProductlinesTable({ productlines }: Props) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Tên</th>
          <th>Model</th>
          <th>Mô tả</th>
          <th>Bảo hành</th>
          <th>Tổng sản phẩm</th>
        </tr>
      </thead>
      <tbody>
        {productlines.map((productline) => (
          <tr key={productline.id} className="cursor-pointer hover:bg-slate-300">
            <td>{productline.id}</td>
            <td>{productline.name}</td>
            <td>{productline.model}</td>
            <td>{productline.description}</td>
            <td>{productline.warranty_months} tháng</td>
            <td>{productline.product_count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
