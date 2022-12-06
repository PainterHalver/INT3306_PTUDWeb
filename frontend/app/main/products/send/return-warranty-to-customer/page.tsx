"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

import { AxiosResponse } from "axios";
import ConfirmModal from "../../../../../components/ConfirmModal";
import ProductByStatusTable from "../../../../../components/ProductByStatusTable";
import { useAppDispatch, useAuthContext } from "../../../../../contexts/appContext";
import { useToast } from "../../../../../contexts/toastContext";
import axios from "../../../../../helpers/axios";
import { SendPayload, updateableStatuses } from "../../../../../helpers/types";

export default function WarrantyBackToCustomer() {
  const { user } = useAuthContext();
  const pathname = usePathname();
  const sendStatuses = updateableStatuses[user.account_type].send;
  const routeStatus = sendStatuses.find((status) => status.href === pathname);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);

  // Dùng để trigger rerender các table
  const [keys, setKeys] = useState(sendStatuses.map((status, index) => index));

  const toast = useToast();
  const dispatch = useAppDispatch();

  const refreshTable = () => {
    setKeys((keys) => keys.map((key) => key + keys.length));
  };

  const sendWarrantyBackToCustomer = async (product_ids: number[]) => {
    try {
      dispatch("LOADING", "Đang cập nhật trạng thái...");
      const res = await axios.post<any, AxiosResponse<any, any>, SendPayload>("/products/send", {
        status: "da_tra_lai_bao_hanh_cho_khach_hang",
        product_ids,
      });
      toast.success("Cập nhật trạng thái thành công!");
      refreshTable();
    } catch (error) {
      toast.error("Cập nhật trạng thái thất bại!");
    }
  };

  const showConfirmModal = () => {
    // Nếu không có sản phẩm nào được chọn thì không hiển thị modal
    if (selectedIds.length === 0) {
      return toast.error("Chưa có sản phẩm nào được chọn!");
    }

    setConfirmModalOpen(true);
  };

  const confirmSend = async () => {
    try {
      await sendWarrantyBackToCustomer(selectedIds);

      // Sau khi nhận thành công thì reset selectedIds
      setSelectedIds([]);

      refreshTable();
    } catch (error) {
      console.log(error);
      toast.error("Có lỗi xảy ra!");
    }
  };

  return (
    <div>
      <div className="flex mb-2">
        <p className="text-2xl">{routeStatus.label}</p>
        <button className="px-4 ml-auto button-classic" onClick={showConfirmModal}>
          Gửi
        </button>
      </div>
      <hr className="border-t-slate-300" />
      {routeStatus.from.map((status, index) => (
        <ProductByStatusTable key={keys[index]} status={status} selectedIds={selectedIds} setSelectedIds={setSelectedIds} />
      ))}
      <ConfirmModal open={confirmModalOpen} setOpen={setConfirmModalOpen} message={<ConfirmReceiveModalMessage product_ids={selectedIds} />} onConfirm={confirmSend} />
    </div>
  );
}

const ConfirmReceiveModalMessage = ({ product_ids }) => {
  return (
    <div className="flex flex-col items-center max-w-md">
      <p className="text-xl">Xác nhận đã gửi?</p>
      <p className="text-sm text-gray-500">ID: {JSON.stringify(product_ids)}</p>
    </div>
  );
};
