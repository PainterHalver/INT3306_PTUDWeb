"use client";
import { FormEvent, useEffect, useState } from "react";
import { ProductlineStats, ProductStatus, productStatuses, User } from "../../../helpers/types";
import axios from "../../../helpers/axios";
import { useAppDispatch } from "../../context-provider";

export default function Stats() {
  const [result, setResult] = useState<ProductlineStats[]>([]);
  const [total, setTotal] = useState(0);
  const [sanxuatUsers, setSanxuatUsers] = useState<User[]>([]);
  const [baohanhUsers, setBaohanhUsers] = useState<User[]>([]);
  const [dailyUsers, setDailyUsers] = useState<User[]>([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedSanxuatUserId, setSelectedSanxuatUserId] = useState("");
  const [selectedBaohanhUserId, setSelectedBaohanhUserId] = useState("");
  const [selectedDailyUserId, setSelectedDailyUserId] = useState("");

  const dispatch = useAppDispatch();

  useEffect(() => {
    (async () => {
      const res = await axios.get("/users?limit=1000");
      const allUsers: User[] = res.data.users;
      setSanxuatUsers(allUsers.filter((u) => u.account_type === "san_xuat"));
      setBaohanhUsers(allUsers.filter((u) => u.account_type === "bao_hanh"));
      setDailyUsers(allUsers.filter((u) => u.account_type === "dai_ly"));
    })();
  }, []);

  const getStats = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log({ selectedStatus, selectedSanxuatUserId, selectedBaohanhUserId, selectedDailyUserId });

    try {
      dispatch("LOADING");
      const res = await axios.get("/stats", {
        params: {
          status: selectedStatus,
          sanxuat_id: selectedSanxuatUserId,
          baohanh_id: selectedBaohanhUserId,
          daily_id: selectedDailyUserId,
        },
      });

      setResult(res.data.result);
      setTotal(res.data.total);
    } catch (error) {
      console.log(error);
    } finally {
      dispatch("STOP_LOADING");
    }
  };

  return (
    <>
      <div className="flex justify-start mb-4 ">
        <form className="flex flex-col w-full" onSubmit={getStats}>
          <div>
            <label htmlFor="status_select" className="block">
              Trạng thái:
            </label>
            <select name="status" id="status_select" className="w-full border border-slate-900" onChange={(e) => setSelectedStatus(e.target.value)}>
              <option value="">Tất cả</option>
              {productStatuses.map((status) => (
                <option value={status} key={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:flex lg:mt-2 lg:mb-3">
            <div className="lg:grow">
              <label htmlFor="sanxuat_select" className="block">
                Sản xuất:
              </label>
              <select name="sanxuat_id" id="sanxuat_select" className="w-full border border-slate-900" onChange={(e) => setSelectedSanxuatUserId(e.target.value)}>
                <option value="">Tất cả</option>
                {sanxuatUsers.map((sanxuat) => (
                  <option value={sanxuat.id} key={sanxuat.id}>
                    {sanxuat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="lg:ml-2 lg:grow">
              <label htmlFor="daily_select" className="block">
                Đại lý:
              </label>
              <select name="daily_id" id="daily_select" className="w-full border border-slate-900" onChange={(e) => setSelectedDailyUserId(e.target.value)}>
                <option value="">Tất cả</option>
                {dailyUsers.map((daily) => (
                  <option value={daily.id} key={daily.id}>
                    {daily.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="lg:ml-2 lg:grow">
              <label htmlFor="baohanh_select" className="block">
                Bảo hành:
              </label>
              <select name="baohanh_id" id="baohanh_select" className="w-full border border-slate-900" onChange={(e) => setSelectedBaohanhUserId(e.target.value)}>
                <option value="">Tất cả</option>
                {baohanhUsers.map((baohanh) => (
                  <option value={baohanh.id} key={baohanh.id}>
                    {baohanh.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button className="self-end mt-2 ml-2 button-classic lg:mt-0">Tìm kiếm</button>
        </form>
      </div>

      {result.length > 0 && (
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
            {result.map((productlineStat) => (
              <tr key={productlineStat.id} className="cursor-pointer hover:bg-slate-300">
                <td>{productlineStat.id}</td>
                <td>{productlineStat.name}</td>
                <td>{productlineStat.model}</td>
                <td>{productlineStat.description}</td>
                <td>{productlineStat.warranty_months} tháng</td>
                <td>{productlineStat.product_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
