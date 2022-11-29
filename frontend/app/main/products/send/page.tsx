"use client";

import Link from "next/link";

import { useAuthContext } from "../../../../contexts/appContext";
import { updateableStatuses } from "../../../../helpers/types";

export default function SendProducts() {
  const { user } = useAuthContext();
  const sendStatuses = updateableStatuses[user.account_type].send;

  return (
    <div className="grid grid-cols-2 gap-2 ">
      {sendStatuses.map((status) => (
        <Link href={status.href} key={status.label} className="p-2 text-center button-classic">
          <h2>{status.label}</h2>
        </Link>
      ))}
    </div>
  );
}
