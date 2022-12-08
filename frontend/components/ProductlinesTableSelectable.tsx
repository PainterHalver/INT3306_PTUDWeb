import classNames from "classnames";
import { Dispatch, FormEvent, SetStateAction, useEffect, useState } from "react";
import { useAppDispatch } from "../contexts/appContext";
import axios from "../helpers/axios";
import { Productline } from "../helpers/types";

type Props = {
  selectedIds: number[];
  setSelectedIds: Dispatch<SetStateAction<number[]>>;
};

export default function ProductlinesTableSelectable({ selectedIds, setSelectedIds }: Props) {
  const dispatch = useAppDispatch();
  const [productlines, setProductlines] = useState<Productline[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const getProductlines = async (query: string) => {
    try {
      dispatch("LOADING");
      // TODO: Pagination
      const res = await axios.get("/productlines", {
        params: {
          query,
          limit: 1000,
        },
      });
      setProductlines(res.data.product_lines);
    } catch (error) {
      console.log(error);
    } finally {
      dispatch("STOP_LOADING");
    }
  };

  useEffect(() => {
    getProductlines("");
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
    const allIds = productlines.map((product) => product.id);
    if (productlines.every((p) => selectedIds.includes(p.id))) {
      setSelectedIds((oldSelectedIds) => oldSelectedIds.filter((id) => !allIds.includes(id)));
      console.log("first");
    } else {
      const set = new Set([...selectedIds, ...allIds]);
      setSelectedIds(Array.from(set));
      console.log("second");
    }
  };

  const searchFormHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await getProductlines(searchQuery);
  };

  return (
    <div className="mt-3">
      <form className="flex w-full" onSubmit={searchFormHandler}>
        <input placeholder="Tên, model hoặc mô tả" className="w-full px-2 py-1 border border-slate-900 focus:outline-none" onChange={(e) => setSearchQuery(e.target.value)} />
        <button className="ml-2 button-classic whitespace-nowrap">Tìm kiếm</button>
      </form>
      <div className="flex mt-3">
        <button className="ml-auto button-classic" onClick={toggleSelectAll}>
          {productlines.every((p) => selectedIds.includes(p.id)) ? "Bỏ chọn tất cả" : "Chọn tất cả"}
        </button>
      </div>
      <table className="table mt-2">
        <thead>
          <tr>
            <th className="w-[10%]">ID</th>
            <th className="w-[20%]">Tên</th>
            <th className="w-[20%]">Model</th>
            <th className="w-[30%]">Mô tả</th>
            <th className="w-[13%]">Bảo hành</th>
            <th className="w-[13%]">Tổng sản phẩm</th>
          </tr>
        </thead>
        <tbody>
          {productlines.map((productline) => (
            <tr
              key={productline.id}
              className={classNames("cursor-pointer hover:bg-slate-300", {
                "bg-orange-200 hover:bg-orange-300": selectedIds.includes(productline.id),
              })}
              onClick={() => toggleSelect(productline.id)}
            >
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
    </div>
  );
}
