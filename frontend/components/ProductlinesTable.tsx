import { Productline } from "../helpers/types";

type Props = {
  productlines: Productline[];
};
export default function ProductlinesTable({ productlines }: Props) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th className="w-[8%]">ID</th>
          <th className="w-[16%]">Tên</th>
          <th className="w-[30%]">Model</th>
          <th className="w-[40%]">Mô tả</th>
          <th className="w-[14%]">Bảo hành</th>
          <th className="w-[13%]">Tổng sản phẩm</th>
        </tr>
      </thead>
      <tbody>
        {productlines.map((productline) => (
          <tr key={productline.id} className="text-center cursor-pointer hover:bg-slate-300">
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
