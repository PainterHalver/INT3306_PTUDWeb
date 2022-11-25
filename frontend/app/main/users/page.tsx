"use client";

import React, { useEffect, useRef, useState } from "react";

import axios from "../../../helpers/axios";
import { accountTypes, User } from "../../../helpers/types";
import { useAppDispatch } from "../../context-provider";
import Modal from "../../Modal";

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [addUserModalOpen, setAddUserModalOpen] = useState<boolean>(false);
  const [updateUserModalOpen, setUpdateUserModalOpen] = useState<boolean>(false);
  const [addUserErrors, setAddUserErrors] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    (async function getUsers() {
      try {
        dispatch("LOADING");
        const res = await axios.get("/users");
        setUsers(res.data.users);
      } catch (error) {
        console.log(error);
      } finally {
        dispatch("STOP_LOADING");
      }
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

      // Ở đây chứ không phải trong finally vì searchButtonRef click đã có rồi
      dispatch("STOP_LOADING");
      console.log(error);
    }
  };

  return (
    <>
      <div className="flex justify-start mb-4">
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
        <table className="table">
          <thead>
            <tr>
              <th>Tên người dùng</th>
              <th>Tên cơ sở</th>
              <th>Loại tài khoản</th>
              <th>Địa chỉ</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.username}
                className="cursor-pointer hover:bg-slate-300"
                onClick={() => {
                  setSelectedUser(user);
                  setUpdateUserModalOpen(true);
                }}
              >
                <td>{user.username}</td>
                <td>{user.name}</td>
                <td>{user.account_type}</td>
                <td>{user.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <UserUpdateModal user={selectedUser} open={updateUserModalOpen} setOpen={setUpdateUserModalOpen} searchButtonRef={searchButtonRef} />
      <Modal open={addUserModalOpen} setOpen={setAddUserModalOpen}>
        <div className="p-4 bg-white">
          <h2 className="text-xl">Thêm tài khoản</h2>
          <hr className="my-1 border-t-slate-700" />
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
    </>
  );
}

type UserUpdateModalProps = {
  user?: User;
  open: boolean;
  setOpen: (open: boolean) => void;
  searchButtonRef: React.RefObject<HTMLButtonElement>;
};

function UserUpdateModal({ user, open, setOpen, searchButtonRef }: UserUpdateModalProps) {
  const [errors, setErrors] = useState<string[]>([]);
  const [shouldDelete, setShouldDelete] = useState<boolean>(false);
  const dispatch = useAppDispatch();

  const updateUserHandler = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      const { username, account_name, password, account_type, address } = e.target as HTMLFormElement;
      dispatch("LOADING");
      const res = await axios.put(`/users/${user.id}`, {
        username: username.value,
        name: account_name.value,
        password: password.value,
        account_type: account_type.value,
        address: address.value,
      });

      // Tắt modal sau khi thêm thành công
      setOpen(false);

      // Load lại danh sách user
      searchButtonRef.current?.click();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrors(Object.values(error.response?.data.errors));
      }
      dispatch("STOP_LOADING");
      console.log(error);
    }
  };

  // Reset nút `xóa` mỗi khi mở hoặc đóng modal
  useEffect(() => {
    setShouldDelete(false);
  }, [open]);

  const deleteHandler = async () => {
    if (!shouldDelete) {
      return setShouldDelete(true);
    }

    // Xóa user
    try {
      dispatch("LOADING");
      await axios.delete(`/users/${user.id}`);
      setOpen(false);
      searchButtonRef.current?.click();
    } catch (error) {
      dispatch("STOP_LOADING");
      console.log(error);
    }
  };

  return (
    <Modal open={open} setOpen={setOpen}>
      <div className="p-4 bg-white">
        <h2 className="text-xl">Cập nhật tài khoản id {user?.id}</h2>
        <hr className="my-1 border-t-slate-700" />
        <form className="flex flex-col min-w-[350px] text-md" onSubmit={updateUserHandler} autoComplete="false">
          <label htmlFor="username">Tên tài khoản:</label>
          <input type="text" name="username" id="username" className="form-input" defaultValue={user?.username} />
          <label htmlFor="name">Tên cơ sở:</label>
          <input type="text" name="account_name" id="account_name" className="form-input" defaultValue={user?.name} />
          <label htmlFor="password">Mật khẩu: (để trống là giữ nguyên)</label>
          <input type="password" name="password" id="password" className="form-input" autoComplete="new-password" />
          <label htmlFor="account_type">Loại tài khoản:</label>
          <select name="account_type" id="account_type" className="form-input" defaultValue={user?.account_type}>
            {accountTypes.map((accountType) => (
              <option value={accountType} key={accountType}>
                {accountType}
              </option>
            ))}
          </select>
          <label htmlFor="address">Địa chỉ:</label>
          <input type="text" name="address" id="address" className="form-input" defaultValue={user?.address} />
          <div className="flex items-center justify-end">
            <div className="mr-2 text-red-500">
              {errors.map((error) => (
                <span key={error}>{error}</span>
              ))}
            </div>
            <button className="mt-3 ml-auto button-classic" type="submit">
              Cập nhật
            </button>
            {shouldDelete ? (
              <button className="mt-3 ml-3 button-classic-red" onClick={deleteHandler} type="button">
                Xác nhận xóa
              </button>
            ) : (
              <button className="mt-3 ml-3 button-classic" onClick={deleteHandler} type="button">
                Xóa
              </button>
            )}
          </div>
        </form>
      </div>
    </Modal>
  );
}
