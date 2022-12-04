"use client";
import { AxiosResponse } from "axios";
import classNames from "classnames";
import { FormEvent, useEffect, useState } from "react";
import ConfirmDeleteModal from "../../../../../components/ConfirmDeleteModal";
import ConfirmModal from "../../../../../components/ConfirmModal";
import Modal from "../../../../../components/Modal";

import { useAppDispatch, useAuthContext } from "../../../../../contexts/appContext";
import { useToast } from "../../../../../contexts/toastContext";
import axios from "../../../../../helpers/axios";
import { Customer, SendPayload } from "../../../../../helpers/types";

export default function SellToCustomer() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [nameQuery, setNameQuery] = useState<string>("");
  const [phoneQuery, setPhoneQuery] = useState<string>("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [idInputValue, setIdInputValue] = useState<number>(0);
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [errorModalOpen, setErrorModalOpen] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);

  const dispatch = useAppDispatch();
  const toast = useToast();

  useEffect(() => {
    getCustomers();
  }, []);

  const getCustomers = async (nameQuery: string = "", phoneQuery: string = "") => {
    try {
      dispatch("LOADING");
      // TODO: Pagination
      const res = await axios.get("/customers", {
        params: {
          name: nameQuery,
          phone: phoneQuery,
        },
      });
      setCustomers(res.data.customers);
    } catch (error) {
      console.log(error);
    } finally {
      dispatch("STOP_LOADING");
    }
  };

  const sellProducts = async (product_ids: number[], customer_id: number) => {
    try {
      dispatch("LOADING", "Đang cập nhật trạng thái...");
      const res = await axios.post<any, AxiosResponse<any, any>, SendPayload>("/products/send", {
        status: "da_ban",
        customer_id,
        product_ids,
      });

      toast.success("Cập nhật trạng thái thành công!");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrors(Object.values(error.response?.data.errors));
        setErrorModalOpen(true);
        toast.error("Cập nhật trạng thái thất bại!");
      }
      toast.error("Lỗi không xác định!");
      console.log(error);
    } finally {
      dispatch("STOP_LOADING");
    }
  };

  const searchFormHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await getCustomers(nameQuery, phoneQuery);
  };

  const addSelectedId = () => {
    if (idInputValue && !selectedIds.includes(idInputValue)) {
      setSelectedIds([...selectedIds, idInputValue]);
    }
  };

  const sellProductsHandler = () => {
    if (!selectedCustomer) {
      toast.error("Vui lòng chọn khách hàng!");
      return;
    }

    if (selectedIds.length === 0) {
      toast.error("Vui lòng chọn sản phẩm!");
      return;
    }

    setConfirmModalOpen(true);
  };

  const sellProductsConfirmHandler = async () => {
    await sellProducts(selectedIds, selectedCustomer!.id);
    setSelectedIds([]);
    setSelectedCustomer(null);
  };

  return (
    <>
      <div className="flex gap-2">
        <div className="grow">
          <div className="flex items-center mb-2">
            <label>ID sản phẩm: </label>
            <input type="number" placeholder="ID" className="px-1 ml-2 border border-slate-900 focus:outline-none" value={idInputValue} onChange={(e) => setIdInputValue(parseInt(e.target.value))} />
            <button className="ml-2 button-classic" onClick={addSelectedId}>
              Thêm
            </button>
          </div>
          <p>Danh sách id sản phẩm: {JSON.stringify(selectedIds)}</p>
          <p>Khách hàng được chọn: {selectedCustomer && `${selectedCustomer.name} (${selectedCustomer.phone})`}</p>
        </div>
        <button className="px-6 button-classic" onClick={sellProductsHandler}>
          Bán
        </button>
      </div>
      <hr className="my-3 border-t-slate-400" />
      <div className="flex justify-start mb-4 ">
        <form className="flex flex-col w-full gap-2 lg:flex-row" onSubmit={searchFormHandler}>
          <input placeholder="Tên khách hàng" className="w-full px-2 py-1 border border-slate-900 focus:outline-none" onChange={(e) => setNameQuery(e.target.value)} value={nameQuery} />
          <input placeholder="Số điện thoại" className="w-full px-2 py-1 border border-slate-900 focus:outline-none" onChange={(e) => setPhoneQuery(e.target.value)} value={phoneQuery} />
          <button className="button-classic whitespace-nowrap">Tìm kiếm</button>
        </form>
      </div>

      {customers.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th className="w-[7%]">ID</th>
              <th className="w-[20%]">Tên</th>
              <th className="w-[23%]">Số điện thoại</th>
              <th className="w-[50%]">Địa chỉ</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr
                key={customer.id}
                className={classNames("cursor-pointer hover:bg-slate-300", {
                  "bg-orange-200 hover:bg-orange-300": selectedCustomer && selectedCustomer.id === customer.id,
                })}
                onClick={() => {
                  setSelectedCustomer(customer);
                }}
              >
                <td>{customer.id}</td>
                <td>{customer.name}</td>
                <td>{customer.phone}</td>
                <td>{customer.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <ConfirmModal open={confirmModalOpen} setOpen={setConfirmModalOpen} message={"Bạn có chắc chắn muốn bán sản phẩm?"} onConfirm={sellProductsConfirmHandler} />

      <Modal open={errorModalOpen} setOpen={setErrorModalOpen}>
        <div className="bg-white">
          {errors.map((error) => {
            return <p className="text-red-500">{error}</p>;
          })}
        </div>
      </Modal>
    </>
  );
}
