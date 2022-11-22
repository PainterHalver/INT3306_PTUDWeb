"use client";
import { FormEvent, useRef } from "react";

import axios from "../helpers/axios";

export default function Home() {
  const formRef = useRef<HTMLFormElement>(null);

  const login = async (e: FormEvent) => {
    try {
      e.preventDefault();
      const formData = new FormData(formRef.current!);
      console.log(axios.defaults.baseURL);
      const username = formData.get("username");
      const password = formData.get("password");

      const res = await axios.post("/auth/login", { username, password });
      console.log(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="relative flex items-start justify-center w-screen h-screen bg-cover bg-login">
      <div className="absolute flex gap-6 top-[20%] w-[60%] max-w-[1200px]">
        <div className="flex flex-col items-center justify-center flex-grow-[2] text-blue-primary font-bold weight">
          <img src="https://testonline.uet.vnu.edu.vn/logos/s1_logo.png" alt="logo" />
          <p className="mt-4 mb-1 text-[14pt] uppercase">BigCorp's Production Move</p>
          <p className="text-[18.5pt] uppercase">Hệ thống quản lý vòng đời sản phẩm</p>
        </div>
        <div className="flex flex-col bg-card flex-grow-[1] border border-card-border px-3 py-5 min-w-[350px]">
          <h3 className="mb-1 uppercase text-green-primary">Đăng nhập hệ thống</h3>
          <hr className="border-t-gray-400" />
          <form id="login-form" className="flex flex-col p-2 my-2" onSubmit={login} ref={formRef}>
            <input type="text" placeholder="Tên tài khoản" className="mb-4 input" name="username" />
            <input type="password" placeholder="Mật khẩu" className="input" name="password" />
          </form>
          <hr />
          <div className="pr-4 mt-4 text-right">
            <button form="login-form" type="submit" className="button green">
              Đăng nhập
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
