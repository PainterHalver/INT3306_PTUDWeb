"use client";

import Link from "next/link";

import { useAuthContext } from "../../../../contexts/appContext";
import { updateableStatuses } from "../../../../helpers/types";

export default function SendProducts() {
  const { user } = useAuthContext();
  const receiveStatuses = updateableStatuses[user.account_type].receive;

  return (
    <div className="grid grid-cols-2 gap-2 ">
      {receiveStatuses.map((status) => (
        <Link href={status.href} key={status.label} className="p-2 text-center button-classic">
          <h2>{status.label}</h2>
        </Link>
      ))}
    </div>
  );
}
