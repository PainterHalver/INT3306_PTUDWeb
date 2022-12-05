"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

import ConfirmModal from "../../../../../components/ConfirmModal";
import axios from "../../../../../helpers/axios";
import ProductByStatusTable from "../../../../../components/ProductByStatusTable";
import { useAppDispatch, useAuthContext } from "../../../../../contexts/appContext";
import { useToast } from "../../../../../contexts/toastContext";
import { ReceivePayload, updateableStatuses } from "../../../../../helpers/types";
import { AxiosResponse } from "axios";

export default function ExportProductsToDaily() {
  const { user } = useAuthContext();
  const pathname = usePathname();
  const receiveStatuses = updateableStatuses[user.account_type].receive;
  const routeStatus = receiveStatuses.find((status) => status.href === pathname);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);

  // Dùng để trigger rerender các table
  const [keys, setKeys] = useState(receiveStatuses.map((status, index) => index));

  const toast = useToast();
  const dispatch = useAppDispatch();

  const refreshTable = () => {
    setKeys((keys) => keys.map((key) => key + keys.length));
  };

  const receiveFaultyProducts = async (product_ids: number[]) => {
    try {
      dispatch("LOADING", "Đang cập nhật trạng thái...");
      const res = await axios.post<any, AxiosResponse<any, any>, ReceivePayload>("/products/receive", {
        status: "loi_can_bao_hanh",
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

  const confirmReceive = async () => {
    try {
      await receiveFaultyProducts(selectedIds);

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
          Nhận
        </button>
      </div>
      <hr className="border-t-slate-300" />
      {routeStatus.from.map((status, index) => (
        <ProductByStatusTable key={keys[index]} status={status} selectedIds={selectedIds} setSelectedIds={setSelectedIds} />
      ))}
      <ConfirmModal open={confirmModalOpen} setOpen={setConfirmModalOpen} message={<ConfirmReceiveModalMessage product_ids={selectedIds} />} onConfirm={confirmReceive} />
    </div>
  );
}

const ConfirmReceiveModalMessage = ({ product_ids }) => {
  return (
    <div className="flex flex-col items-center max-w-md">
      <p className="text-xl">Xác nhận đã nhận?</p>
      <p className="text-sm text-gray-500">ID: {JSON.stringify(product_ids)}</p>
    </div>
  );
};
