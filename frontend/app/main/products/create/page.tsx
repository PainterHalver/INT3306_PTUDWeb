"use client";
import axios from "axios";
import { FormEvent, useEffect, useState } from "react";

import Modal from "../../../../components/Modal";
import { Productline } from "../../../../helpers/types";
import { useAppDispatch } from "../../../../contexts/appContext";
import { useToast } from "../../../../contexts/toastContext";

export default function CreateProducts() {
  const [productlines, setProductlines] = useState<Productline[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
  const [selectedProductline, setSelectedProductline] = useState<Productline | null>(null);
  const [addAmount, setAddAmount] = useState<number>(0);

  const dispatch = useAppDispatch();
  const toast = useToast();

  useEffect(() => {
    getProductlines("");
  }, []);

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

  const searchFormHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await getProductlines(searchQuery);
  };

  const createProducts = async () => {
    try {
      dispatch("LOADING", "Thêm sản phẩm vào kho...");
      await axios.post("/products", {
        productline_id: selectedProductline?.id,
        amount: addAmount,
      });

      toast.success("Thêm sản phẩm thành công");

      // Refresh lại danh sách sản phẩm
      await getProductlines(searchQuery);
    } catch (error) {
      console.log(error);
    } finally {
      dispatch("STOP_LOADING");
    }
  };

  const createFormHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await createProducts();
    setAddModalOpen(false);
  };

  return (
    <>
      <div className="flex justify-start mb-4 ">
        <form className="flex w-full" onSubmit={searchFormHandler}>
          <input placeholder="Tên, model hoặc mô tả" className="w-full px-2 py-1 border border-slate-900 focus:outline-non" onChange={(e) => setSearchQuery(e.target.value)} />
          <button className="ml-2 button-classic whitespace-nowrap">Tìm kiếm</button>
        </form>
      </div>
      {productlines.length > 0 && (
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
              <tr
                key={productline.id}
                className="cursor-pointer hover:bg-slate-300"
                onClick={() => {
                  setSelectedProductline(productline);
                  setAddModalOpen(true);
                }}
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
      )}

      {selectedProductline && (
        <Modal open={addModalOpen} setOpen={setAddModalOpen}>
          <div className="p-4 bg-white">
            <p className="text-xl">Nhập lô vào kho</p>
            <p className="text-sm opacity-90">ID dòng sản phẩm: {selectedProductline.id}</p>
            <hr className="my-2 border-t-slate-700" />
            <form className="flex flex-col max-w-[350px] text-md mt-4" autoComplete="false" onSubmit={createFormHandler}>
              <div>
                <label htmlFor="amount" className="mr-2">
                  Số lượng:
                </label>
                <input type="number" className="form-input" name="amount" min="1" onChange={(e) => setAddAmount(parseInt(e.target.value))} />
              </div>

              <button className="mt-3 ml-auto button-classic" type="submit">
                Thêm
              </button>
            </form>
          </div>
        </Modal>
      )}
    </>
  );
}
