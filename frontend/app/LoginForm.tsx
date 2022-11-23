"use client";
import { redirect } from "next/navigation";
import React, { FormEvent, useRef, useState } from "react";

import axios from "../helpers/axios";
import { User } from "../helpers/types";
import { useAuthContext, useAuthDispatch } from "./auth-provider";

export default function LoginForm() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const formRef = useRef<HTMLFormElement>(null);

  const dispatch = useAuthDispatch();
  const { authenticated } = useAuthContext();

  if (authenticated) {
    redirect("/main");
  }

  const login = async (e: FormEvent) => {
    try {
      e.preventDefault();
      setLoading(true);
      setError(false);
      const formData = new FormData(formRef.current!);
      const username = formData.get("username");
      const password = formData.get("password");

      const res = await axios.post<User>("/auth/login", { username, password });

      // Lưu token vào localStorage
      console.log(res);
      localStorage.setItem("token", res.data.token!);

      // Lưu user vào context
      dispatch("LOGIN", res.data);

      // Chuyển hướng đến trang chủ
      window.location.href = "/main";
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(true);
      }
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
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
  );
}
