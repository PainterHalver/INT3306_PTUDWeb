"use client";

import { redirect } from "next/navigation";
import React from "react";
import { useAuthContext } from "../auth-provider";

export default function Main() {
  const { authenticated } = useAuthContext();

  if (!authenticated) {
    redirect("/");
  }

  const logout = () => {
    console.log("first");
    localStorage.removeItem("token");

    // Chuyển hướng đến trang đăng nhập
    window.location.href = "/";
  };

  return (
    <div>
      <button onClick={logout} className="button green">
        Logout
      </button>
    </div>
  );
}
