"use client";
import { FormEvent, useEffect, useState } from "react";

import { useAppDispatch } from "../../../../contexts/appContext";
import { useToast } from "../../../../contexts/toastContext";
import axios from "../../../../helpers/axios";
import { Productline, User } from "../../../../helpers/types";

import { Bar } from "react-chartjs-2";
import Modal from "../../../../components/Modal";
import ProductlinesTableSelectable from "../../../../components/ProductlinesTableSelectable";

export default function FaultyProductStats() {
  const [result, setResult] = useState<Productline[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [dailyUsers, setDailyUsers] = useState<User[]>([]);
  const [selectedDailyUserId, setSelectedDailyUserId] = useState<number | null>(null);
  const [sanxuatUsers, setSanxuatUsers] = useState<User[]>([]);
  const [selectedSanxuatUserId, setSelectedSanxuatUserId] = useState<number | null>(null);
  const [selectIdsModalOpen, setSelectIdsModalOpen] = useState<boolean>(false);

  const dispatch = useAppDispatch();
  const toast = useToast();

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
        setSanxuatUsers(allUsers.filter((u) => u.account_type === "san_xuat"));
      } catch (error) {
        console.log(error);
      } finally {
        dispatch("STOP_LOADING");
      }
    })();
  }, []);

  const getFaultyProductsStats = async () => {
    try {
      dispatch("LOADING", "Lấy dữ liệu thống kê...");
      const res = await axios.post("/stats/errorStats", {
        product_line_ids: selectedIds,
        sanxuat_id: selectedSanxuatUserId || sanxuatUsers[0].id,
        daily_id: selectedDailyUserId || dailyUsers[0].id,
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
    await getFaultyProductsStats();
  };

  return (
    <>
      <div className="flex justify-start mb-4 ">
        <form className="flex flex-col items-center w-full lg:flex-row" onSubmit={statsFormHandler}>
          <div className="flex w-full gap-2 my-1 lg:mr-3 lg:mx-0 lg:w-auto">
            <p className="whitespace-nowrap">Chọn các dòng sản phẩm:</p>
            <button className="button-classic whitespace-nowrap" onClick={() => setSelectIdsModalOpen(true)} type="button">
              {selectedIds.length === 0 ? "Chọn" : JSON.stringify(selectedIds).length > 20 ? `${selectedIds.length} dòng sản phẩm` : JSON.stringify(selectedIds)}
            </button>
          </div>
          <div className="flex flex-col w-full my-1 lg:mr-2 lg:mx-0 lg:w-auto lg:block">
            <label htmlFor="daily_select">Đại lý: </label>
            <select name="daily_id" id="daily_select" className="border border-slate-900 focus:outline-none" onChange={(e) => setSelectedDailyUserId(parseInt(e.target.value))}>
              {dailyUsers.map((daily) => (
                <option value={daily.id} key={daily.id}>
                  {daily.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col w-full my-1 lg:mr-2 lg:mx-0 lg:w-auto lg:block">
            <label htmlFor="sanxuat_select">Cơ sở sản xuất: </label>
            <select name="sanxuat_id" id="sanxuat_select" className="border border-slate-900 focus:outline-none" onChange={(e) => setSelectedSanxuatUserId(parseInt(e.target.value))}>
              {sanxuatUsers.map((sanxuat) => (
                <option value={sanxuat.id} key={sanxuat.id}>
                  {sanxuat.name}
                </option>
              ))}
            </select>
          </div>

          <button className="self-end h-full mt-2 ml-2 lg:mt-0 button-classic whitespace-nowrap">Tìm kiếm</button>
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
                      return context.dataset?.data?.[context.dataIndex] + "% sản phẫm đã hoặc đang lỗi";
                    },
                    beforeBody: (context) => {
                      return `${result[context[0].dataIndex].model}\n${result[context[0].dataIndex].product_count} sản phẩm lỗi\n${
                        result[context[0].dataIndex].total_product_count
                      } sản phẩm tổng cộng`;
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
                  label: "Tỉ lệ sản phẩm lỗi",
                  data: result.map((productline) => ((productline.product_count / productline.total_product_count) * 100).toFixed(2)),
                  backgroundColor: "rgba(255, 0, 80, 0.5)",
                },
              ],
            }}
          />
          <p className="mb-2 font-bold text-md">Tổng cộng: {total} loại sản phẩm</p>
          <table className="table">
            <thead>
              <tr>
                <th className="w-[8%]">ID</th>
                <th className="w-[16%]">Tên</th>
                <th className="w-[30%]">Model</th>
                <th className="w-[14%]">Số sản phẩm lỗi</th>
                <th className="w-[14%]">Tổng sản phẩm</th>
                <th className="w-[15%]">Tỷ lệ lỗi</th>
              </tr>
            </thead>
            <tbody>
              {result.map((productline) => (
                <tr key={productline.id} className="text-center cursor-pointer hover:bg-slate-300">
                  <td>{productline.id}</td>
                  <td>{productline.name}</td>
                  <td>{productline.model}</td>
                  <td>{productline.product_count}</td>
                  <td>{productline.total_product_count}</td>
                  <td>{((productline.ratio || 0) * 100).toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <Modal open={selectIdsModalOpen} setOpen={setSelectIdsModalOpen}>
        <div className="max-h-[90vh] lg:max-w-[60vw] p-2 bg-white overflow-scroll">
          <ProductlinesTableSelectable selectedIds={selectedIds} setSelectedIds={setSelectedIds} />
        </div>
      </Modal>
    </>
  );
}
