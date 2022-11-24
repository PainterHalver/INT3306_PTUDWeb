"use client";

import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useAuthContext, useAuthDispatch } from "../auth-provider";

export default function Main() {
  const { authenticated, loading } = useAuthContext();
  const dispatch = useAuthDispatch();
  const router = useRouter();

  useEffect(() => {
    console.log({ authenticated, loading });
    if (!loading && !authenticated) {
      router.push("/");
    }
  }, [loading]);

  const logout = () => {
    console.log("first");
    localStorage.removeItem("token");
    dispatch("LOGOUT");

    // Chuyển hướng đến trang đăng nhập
    router.push("/");
  };

  return (
    <div>
      <button onClick={logout} className="button green">
        Logout
      </button>
    </div>
  );
}
