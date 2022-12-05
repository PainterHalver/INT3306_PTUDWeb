"use client";

import { AxiosResponse } from "axios";
import { usePathname } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import ConfirmModal from "../../../../../components/ConfirmModal";

import ProductByStatusTable from "../../../../../components/ProductByStatusTable";
import { useAppDispatch, useAuthContext } from "../../../../../contexts/appContext";
import { useToast } from "../../../../../contexts/toastContext";
import axios from "../../../../../helpers/axios";
import { SendPayload, updateableStatuses, User } from "../../../../../helpers/types";

export default function ExportProductsToDaily() {
  const { user } = useAuthContext();
  const pathname = usePathname();
  const sendStatuses = updateableStatuses[user.account_type].send;
  const routeStatus = sendStatuses.find((status) => status.href === pathname);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [baohanhUsers, setBaohanhUsers] = useState<User[]>([]);
  const [selectedBaohanhUserId, setSelectedBaohanhUserId] = useState<number | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);

  // Dùng để trigger rerender các table
  const [keys, setKeys] = useState(sendStatuses.map((status, index) => index));

  const dispatch = useAppDispatch();
  const toast = useToast();

  const refreshTable = () => {
    setKeys((keys) => keys.map((key) => key + keys.length));
  };

  useEffect(() => {
    (async () => {
      try {
        dispatch("LOADING");
        const res = await axios.get("/users", {
          params: {
            account_type: "bao_hanh",
            limit: 10000,
          },
        });
        const allUsers: User[] = res.data.users;
        setBaohanhUsers(allUsers.filter((u) => u.account_type === "bao_hanh"));
      } catch (error) {
        console.log(error);
      } finally {
        dispatch("STOP_LOADING");
      }
    })();
  }, []);

  const sendFaultyToBaohanh = async (product_ids: number[], baohanh_id: number) => {
    try {
      dispatch("LOADING", "Đang cập nhật trạng thái...");
      const res = await axios.post<any, AxiosResponse<any, any>, SendPayload>("/products/send", {
        status: "dang_sua_chua_bao_hanh_ON_THE_WAY",
        baohanh_id,
        product_ids,
      });

      toast.success("Cập nhật trạng thái thành công");
    } catch (error) {
      toast.error("Cập nhật trạng thái sản phẩm thất bại!");
      console.log(error);
    } finally {
      dispatch("STOP_LOADING");
    }
  };

  const sendFaultyToBaohanhHandler = async (e: FormEvent) => {
    e.preventDefault();

    // Báo lỗi nếu chưa có sản phẩm nào được chọn
    if (selectedIds.length === 0) {
      return toast.error("Chưa có sản phẩm nào được chọn!");
    }

    // Mở modal xác nhận
    setConfirmModalOpen(true);
  };

  const sendFaultyToBaohanhConfirmHandler = async () => {
    try {
      await sendFaultyToBaohanh(selectedIds, selectedBaohanhUserId ?? baohanhUsers[0].id);

      // Bỏ chọn tất cả sản phẩm
      setSelectedIds([]);

      // Rerender table
      refreshTable();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <p className="text-2xl">{routeStatus.label}</p>
      <hr className="border-t-slate-300" />
      <form className="flex items-center my-4" onSubmit={sendFaultyToBaohanhHandler}>
        <div className="mr-2">
          <label htmlFor="baohanh_select">Đại lý: </label>
          <select name="baohanh_id" id="baohanh_select" className="border border-slate-900 focus:outline-none" onChange={(e) => setSelectedBaohanhUserId(parseInt(e.target.value))}>
            {baohanhUsers.map((baohanh) => (
              <option value={baohanh.id} key={baohanh.id}>
                {baohanh.name}
              </option>
            ))}
          </select>
        </div>
        <button className="px-4 button-classic">Gửi</button>
      </form>
      <hr className="border-t-slate-300" />
      {routeStatus.from.map((status, index) => (
        <ProductByStatusTable key={keys[index]} status={status} selectedIds={selectedIds} setSelectedIds={setSelectedIds} />
      ))}
      <ConfirmModal open={confirmModalOpen} setOpen={setConfirmModalOpen} message={<ConfirmModalMessage product_ids={selectedIds} />} onConfirm={sendFaultyToBaohanhConfirmHandler} />
    </div>
  );
}

const ConfirmModalMessage = ({ product_ids }) => {
  return (
    <div className="flex flex-col items-center max-w-md">
      <p className="text-xl">Xác nhận gửi?</p>
      <p className="text-sm text-gray-500">ID: {JSON.stringify(product_ids)}</p>
    </div>
  );
};
