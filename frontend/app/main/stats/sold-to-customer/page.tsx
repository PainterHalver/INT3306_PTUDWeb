"use client";
import { FormEvent, useEffect, useState } from "react";

import ProductlinesTable from "../../../../components/ProductlinesTable";
import { useAppDispatch } from "../../../../contexts/appContext";
import { useToast } from "../../../../contexts/toastContext";
import axios from "../../../../helpers/axios";
import { Productline } from "../../../../helpers/types";

import { Bar } from "react-chartjs-2";

export default function SoldToCustomerStats() {
  const [result, setResult] = useState<Productline[]>([]);
  const [total, setTotal] = useState(0);
  const [fromTime, setFromTime] = useState<number | undefined>(undefined);
  const [toTime, setToTime] = useState<number | undefined>(undefined);

  const dispatch = useAppDispatch();
  const toast = useToast();

  useEffect(() => {
    getSaleStats();
  }, []);

  const getSaleStats = async () => {
    try {
      dispatch("LOADING", "Lấy dữ liệu thống kê...");
      const res = await axios.get("/stats/soldToCustomerStats", {
        params: {
          from: fromTime ?? -9999999999999,
          to: toTime ?? 9999999999999,
          of_current_user: true,
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
    await getSaleStats();
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
          <Bar
            options={{
              responsive: true,
              plugins: {
                // legend: {
                //   position: "top" as const,
                // },
                title: {
                  display: true,
                  text: "Thống kê số lượng sản phẩm",
                },
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      return context.dataset?.data?.[context.dataIndex] + " sản phẩm";
                    },
                    beforeBody: (context) => {
                      return result[context[0].dataIndex].model;
                    },
                    title: (context) => `ID: ${context[0].label}`,
                  },
                },
              },
            }}
            data={{
              labels: result.map((productline) => productline.id),
              datasets: [
                {
                  label: "Số lượng sản phẩm",
                  data: result.map((productline) => productline.product_count),
                  backgroundColor: "rgba(53, 162, 235, 0.5)",
                },
              ],
            }}
          />
          <p className="mb-2 font-bold text-md">Tổng cộng: {total} loại sản phẩm</p>
          <ProductlinesTable productlines={result} />
        </>
      )}
    </>
  );
}
