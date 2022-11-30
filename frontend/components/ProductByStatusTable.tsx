import classNames from "classnames";
import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { useAppDispatch } from "../contexts/appContext";
import axios from "../helpers/axios";
import { ProductStatus, Product, readableProductStatuses } from "../helpers/types";

type Props = {
  status: ProductStatus;
  selectedIds: number[];
  setSelectedIds: Dispatch<SetStateAction<number[]>>;
};

export default function ProductByStatusTable({ status, selectedIds, setSelectedIds }: Props) {
  const dispatch = useAppDispatch();
  const [products, setProducts] = useState<Product[]>([]);

  const getCurrentUserProductsByStatus = async (status: ProductStatus) => {
    try {
      dispatch("LOADING");
      const res = await axios.get(`/products`, {
        params: {
          status,
          of_current_user: true,
          limit: 10000,
        },
      });
      setProducts(res.data.products);
    } catch (error) {
      console.log(error);
    } finally {
      dispatch("STOP_LOADING");
    }
  };

  useEffect(() => {
    getCurrentUserProductsByStatus(status);
  }, []);

  const toggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const toggleSelectAll = () => {
    // Chỉ toggle các sản phẩm thuộc bảng hiện tại
    const allIds = products.map((product) => product.id);
    if (products.every((p) => selectedIds.includes(p.id))) {
      setSelectedIds((oldSelectedIds) => oldSelectedIds.filter((id) => !allIds.includes(id)));
      console.log("first");
    } else {
      const set = new Set([...selectedIds, ...allIds]);
      setSelectedIds(Array.from(set));
      console.log("second");
    }
  };

  return (
    <div className="mt-3">
      <div className="flex">
        <p>
          Các sản phẩm ở trạng thái <strong>{readableProductStatuses[status]}:</strong>
        </p>
        <button className="ml-auto button-classic" onClick={toggleSelectAll}>
          {products.every((p) => selectedIds.includes(p.id)) ? "Bỏ chọn tất cả" : "Chọn tất cả"}
        </button>
      </div>
      <table className="table mt-2">
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
            <tr
              key={product.id}
              onClick={() => toggleSelect(product.id)}
              className={classNames("cursor-pointer hover:bg-slate-300", {
                "bg-orange-200 hover:bg-orange-300": selectedIds.includes(product.id),
              })}
            >
              <td>{product.id}</td>
              <td>{product.product_line.model}</td>
              <td>{readableProductStatuses[product.status]}</td>
              <td>{product.possesser ? product.possesser.address : "Đang vận chuyển"}</td>
              <td>{product.baohanh_count} lần</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
