"use client";

import React, { useEffect } from "react";

import axios from "../../../helpers/axios";
import { accountTypes, User } from "../../../helpers/types";
import { useAppDispatch } from "../../context-provider";
import Modal from "./Modal";

export default function Users() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [addUserModalOpen, setAddUserModalOpen] = React.useState<boolean>(false);
  const [addUserErrors, setAddUserErrors] = React.useState<string[]>([]);
  const searchButtonRef = React.useRef<HTMLButtonElement>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    (async function getUsers() {
      const res = await axios.get("/users");
      setUsers(res.data.users);
    })();
  }, []);

  const searchUsers = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      dispatch("LOADING");
      setUsers([]);

      const accountType = e.target[0].value;
      const res = await axios.get(`/users${accountType !== "all" ? `?accountType=${accountType}` : ""}`);
      setUsers(res.data.users);
    } catch (error) {
      console.log(error);
    } finally {
      dispatch("STOP_LOADING");
    }
  };

  const addUserHandler = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      const { username, account_name, password, account_type, address } = e.target as HTMLFormElement;
      dispatch("LOADING");
      const res = await axios.post("/users", {
        username: username.value,
        name: account_name.value,
        password: password.value,
        account_type: account_type.value,
        address: address.value,
      });

      // Tắt modal sau khi thêm thành công
      setAddUserModalOpen(false);

      // Load lại danh sách user
      searchButtonRef.current?.click();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setAddUserErrors(Object.values(error.response?.data.errors));
      }
      console.log(error);
    } finally {
      dispatch("STOP_LOADING");
    }
  };

  return (
    <div className="flex justify-center pt-5 ">
      <div className="w-[80%] flex flex-col">
        <div className="flex justify-start mb-3">
          <form onSubmit={searchUsers} className="flex">
            <label htmlFor="account_type_select">Loại tài khoản:</label>
            <select name="account_type" id="account_type_select" className="ml-2 border border-slate-900">
              <option value="all">Tất cả</option>
              {accountTypes.map((accountType) => (
                <option value={accountType} key={accountType}>
                  {accountType}
                </option>
              ))}
            </select>
            <button className="ml-2 button-classic" ref={searchButtonRef}>
              Tìm kiếm
            </button>
          </form>
          <button className="ml-auto button-classic" onClick={() => setAddUserModalOpen(true)}>
            Thêm tài khoản
          </button>
        </div>

        {users.length > 0 && (
          <table className="table w-full border border-collapse">
            <thead>
              <tr>
                <th>Tên người dùng</th>
                <th>Loại tài khoản</th>
                <th>Địa chỉ</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.username}>
                  <td>{user.username}</td>
                  <td>{user.account_type}</td>
                  <td>{user.address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={addUserModalOpen} setOpen={setAddUserModalOpen}>
        <div className="p-4 bg-white">
          <form className="flex flex-col min-w-[350px] text-md" onSubmit={addUserHandler} autoComplete="false">
            <label htmlFor="username">Tên tài khoản:</label>
            <input type="text" name="username" id="username" className="form-input" />
            <label htmlFor="name">Tên cơ sở:</label>
            <input type="text" name="account_name" id="account_name" className="form-input" />
            <label htmlFor="password">Mật khẩu:</label>
            <input type="password" name="password" id="password" className="form-input" autoComplete="new-password" />
            <label htmlFor="account_type">Loại tài khoản:</label>
            <select name="account_type" id="account_type" className="form-input">
              {accountTypes.map((accountType) => (
                <option value={accountType} key={accountType}>
                  {accountType}
                </option>
              ))}
            </select>
            <label htmlFor="address">Địa chỉ:</label>
            <input type="text" name="address" id="address" className="form-input" />
            <div className="flex items-center justify-end">
              <div className="text-red-500">
                {addUserErrors.map((error) => (
                  <p key={error}>{error}</p>
                ))}
              </div>
              <button className="mt-3 ml-auto button green" type="submit">
                Thêm
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
