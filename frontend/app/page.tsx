"use client";
import { FormEvent, useRef, useState } from "react";

import axios from "../helpers/axios";

export default function Home() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState(null);
  const formRef = useRef<HTMLFormElement>(null);

  const login = async (e: FormEvent) => {
    try {
      e.preventDefault();
      setLoading(true);
      setError(null);
      const formData = new FormData(formRef.current!);
      const username = formData.get("username");
      const password = formData.get("password");

      const res = await axios.post("/auth/login", { username, password });
      console.log(res.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data);
      }
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-start justify-center w-screen h-screen bg-cover bg-login">
      <div className="absolute flex gap-6 top-[20%] w-[90%] max-w-[1100px]">
        <div className="flex-col items-center justify-center flex-grow-[2] text-blue-primary font-bold weight hidden lg:flex">
          <img src="https://testonline.uet.vnu.edu.vn/logos/s1_logo.png" alt="logo" />
          <p className="mt-4 mb-1 text-[14pt] uppercase">BigCorp's Production Move</p>
          <p className="text-[18.5pt] uppercase">Hệ thống quản lý vòng đời sản phẩm</p>
        </div>
        <div className="flex flex-col bg-card flex-grow-[1] border border-card-border px-3 py-5 min-w-[350px] lg:max-w-[370px]">
          <h3 className="mb-1 uppercase text-green-primary">Đăng nhập hệ thống</h3>
          <hr className="border-t-gray-400" />
          <div className="flex flex-col px-2 mt-2">
            <form id="login-form" onSubmit={login} className="flex flex-col mt-2 mb-4" ref={formRef}>
              <input type="text" placeholder="Tên tài khoản" className="mb-4 input" name="username" />
              <input type="password" placeholder="Mật khẩu" className="input" name="password" />
            </form>
            <hr />
            <div className="flex justify-end w-full pl-2 pr-2 mt-4">
              <p className={`text-[16px] text-red-500 ${error || "invisible"}`}>Tên đăng nhập hoặc mật khẩu không đúng.</p>
              <button form="login-form" type="submit" className="self-center ml-5 button green min-w-fit" disabled={loading}>
                Đăng nhập
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
