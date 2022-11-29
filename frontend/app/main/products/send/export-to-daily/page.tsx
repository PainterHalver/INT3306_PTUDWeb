"use client";

import { AxiosResponse } from "axios";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

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
  const [dailyUsers, setDailyUsers] = useState<User[]>([]);
  const [selectedDailyUserId, setSelectedDailyUserId] = useState<number | null>(null);

  // Dùng để trigger rerender các table
  const [keys, setKeys] = useState(sendStatuses.map((status, index) => index));

  const dispatch = useAppDispatch();
  const toast = useToast();

  const refreshTable = () => {
    setKeys((keys) => keys.map((key) => key + 1));
  };

  useEffect(() => {
    (async () => {
      try {
        dispatch("LOADING");
        const res = await axios.get("/users", {
          params: {
            account_type: "dai_ly",
            limit: 10000,
          },
        });
        const allUsers: User[] = res.data.users;
        setDailyUsers(allUsers.filter((u) => u.account_type === "dai_ly"));
      } catch (error) {
        console.log(error);
      } finally {
        dispatch("STOP_LOADING");
      }
    })();
  }, []);

  const exportToDaily = async (product_ids: number[], daily_id: number) => {
    try {
      dispatch("LOADING", "Đang cập nhật trạng thái...");
      const res = await axios.post<any, AxiosResponse<any, any>, SendPayload>("/products/send", {
        status: "dua_ve_dai_ly_ON_THE_WAY",
        daily_id,
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

  const exportToDailyHandler = async (e: FormEvent) => {
    try {
      e.preventDefault();
      await exportToDaily(selectedIds, selectedDailyUserId ?? dailyUsers[0].id);

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
      <form className="flex items-center my-3" onSubmit={exportToDailyHandler}>
        <div className="mr-2">
          <label htmlFor="daily_select">Đại lý: </label>
          <select name="daily_id" id="daily_select" className="border border-slate-900 focus:outline-none" onChange={(e) => setSelectedDailyUserId(parseInt(e.target.value))}>
            {dailyUsers.map((daily) => (
              <option value={daily.id} key={daily.id}>
                {daily.name}
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
    </div>
  );
}
