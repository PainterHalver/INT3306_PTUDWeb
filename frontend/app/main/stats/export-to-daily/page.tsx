"use client";
import { FormEvent, useEffect, useState } from "react";
import ProductlinesTable from "../../../../components/ProductlinesTable";

import axios from "../../../../helpers/axios";
import { Productline, productStatuses, readableProductStatuses, User } from "../../../../helpers/types";
import { useAppDispatch } from "../../../../contexts/appContext";
import { useToast } from "../../../../contexts/toastContext";

export default function ExportToDailyStats() {
  const [result, setResult] = useState<Productline[]>([]);
  const [total, setTotal] = useState(0);
  const [fromTime, setFromTime] = useState<number | undefined>(undefined);
  const [toTime, setToTime] = useState<number | undefined>(undefined);

  const dispatch = useAppDispatch();
  const toast = useToast();

  useEffect(() => {
    getExportStats();
  }, []);

  const getExportStats = async () => {
    try {
      dispatch("LOADING", "Lấy dữ liệu thống kê...");
      const res = await axios.get("/stats/exportToDailyStats", {
        params: {
          from: fromTime ?? -9999999999999,
          to: toTime ?? 9999999999999,
        },
      });

      setResult(res.data.result);
      setTotal(res.data.total);
    } catch (error) {
      toast.error("Lỗi khi tải dữ liệu");
      console.log(error);
    } finally {
      dispatch("STOP_LOADING");
    }
  };

  const statsFormHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await getExportStats();
  };

  return (
    <>
      <div className="flex justify-start mb-4 ">
        <form className="flex items-center w-full" onSubmit={statsFormHandler}>
          <label htmlFor="fromTime" className="block">
            Từ ngày:
          </label>
          <input name="fromTime" type="date" className="px-1 mx-2 border border-slate-900 focus:outline-none" onChange={(e) => setFromTime(new Date(e.target.value).getTime())} />
          <label htmlFor="fromTime" className="block">
            đến ngày:
          </label>
          <input name="fromTime" type="date" className="px-1 mx-2 border border-slate-900 focus:outline-none" onChange={(e) => setToTime(new Date(e.target.value).getTime())} />
          <button className="self-end h-full ml-2 button-classic">Tìm kiếm</button>
        </form>
      </div>
      <hr className="mb-2 border-t-slate-400" />

      {result.length > 0 && (
        <>
          <p className="mb-2 font-bold text-md">Tổng cộng: {total} loại sản phẩm</p>
          <ProductlinesTable productlines={result} />
        </>
      )}
    </>
  );
}
