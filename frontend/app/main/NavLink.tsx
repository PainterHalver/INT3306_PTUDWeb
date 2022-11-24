"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

type Props = {
  children: React.ReactNode;
  href: string;
};

export default function NavLink({ children, href, ...props }: Props) {
  const pathname = usePathname();

  return (
    <Link href={href} className={`px-2 py-1 nav-link ${pathname === href ? "nav-link-focused" : ""}`} {...props}>
      {children}
    </Link>
  );
}
