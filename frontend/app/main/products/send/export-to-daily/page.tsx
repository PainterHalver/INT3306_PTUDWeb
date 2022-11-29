"use client";

import { usePathname } from "next/navigation";
import { useAppDispatch, useAuthContext } from "../../../../../contexts/appContext";
import { Product, ProductStatus, readableProductStatuses, updateableStatuses } from "../../../../../helpers/types";
import axios from "../../../../../helpers/axios";
import { useEffect, useState } from "react";
import ProductsTable from "../../../../../components/ProductsTable";

export default function ExportProductsToDaily() {
  const { user } = useAuthContext();
  const pathname = usePathname();
  const sendStatuses = updateableStatuses[user.account_type].send;
  const routeStatus = sendStatuses.find((status) => status.href === pathname);

  return (
    <div>
      <p className="text-2xl">{routeStatus.label}</p>
      {routeStatus.from.map((status) => (
        <ProductByStatusTable key={status} status={status} />
      ))}
    </div>
  );
}

function ProductByStatusTable({ status }: { status: ProductStatus }) {
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

  return (
    <div className="mt-3">
      <p>
        Các sản phẩm ở trạng thái <strong>{readableProductStatuses[status]}:</strong>
      </p>
      <table className="table mt-1">
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
          {products.map((product, index) => (
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
    </div>
  );
}
