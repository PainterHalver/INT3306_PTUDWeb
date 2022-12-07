"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AccountType } from "../../helpers/types";
import { useAuthContext, useAppDispatch } from "../../contexts/appContext";
import NavLink from "../../components/NavLink";

type NavLinks = {
  label: string;
  href: string;
  restrictTo: AccountType[];
}[];

const navlinks: NavLinks = [
  {
    href: "/main/users",
    label: "Quản lý người dùng",
    restrictTo: ["admin"],
  },
  {
    href: "/main/productlines",
    label: "Quản lý danh mục dòng sản phẩm",
    restrictTo: ["admin"],
  },
  {
    href: "/main/customers",
    label: "Khách hàng",
    restrictTo: ["admin", "san_xuat", "bao_hanh", "dai_ly"],
  },
  {
    href: "/main/products",
    label: "Sản phẩm",
    restrictTo: ["admin", "san_xuat", "bao_hanh", "dai_ly"],
  },
  {
    href: "/main/products/create",
    label: "Nhập kho",
    restrictTo: ["san_xuat"],
  },
  {
    href: "/main/products/send",
    label: "Gửi sản phẩm",
    restrictTo: ["san_xuat", "bao_hanh", "dai_ly"],
  },
  {
    href: "/main/products/receive",
    label: "Nhận sản phẩm",
    restrictTo: ["san_xuat", "bao_hanh", "dai_ly"],
  },
  {
    href: "/main/stats",
    label: "Thống kê chung",
    restrictTo: ["admin", "san_xuat", "bao_hanh", "dai_ly"],
  },
  {
    href: "/main/stats/export-to-daily",
    label: "Thống kê hàng xuất cho đại lý",
    restrictTo: ["san_xuat"],
  },
  {
    href: "/main/stats/sold-to-customer",
    label: "Thống kê hàng đã bán",
    restrictTo: ["dai_ly"],
  },
  {
    href: "/main/stats/error",
    label: "Thống kê hàng lỗi",
    restrictTo: ["san_xuat"],
  },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { authenticated, loading, user } = useAuthContext();
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !authenticated) {
      router.push("/");
    }
  }, [loading]);

  const logout = () => {
    localStorage.removeItem("token");
    dispatch("LOGOUT");

    // Chuyển hướng đến trang đăng nhập
    router.push("/");
  };

  return (
    <>
      <nav className="flex justify-end w-full px-5 py-2 bg-blue-primary">
        <p className="text-white">Xin chào, {user?.name}</p>
        <button onClick={logout} className="ml-auto link">
          Đăng xuất
        </button>
      </nav>
      <nav className="flex w-full bg-green-secondary">
        {navlinks
          .filter((link) => link.restrictTo.includes(user?.account_type as AccountType))
          .map((link) => (
            <NavLink key={link.href} href={link.href}>
              {link.label}
            </NavLink>
          ))}
      </nav>
      <div className="flex justify-center pt-5 ">
        <div className="w-[95%] lg:w-[80%] flex flex-col mb-5">{authenticated ? children : "Đang lấy thông tin người dùng..."}</div>
      </div>
    </>
  );
}
