import React from "react";

type Props = {
  open: boolean;
  message?: string;
};

export default function LoadingModal({ open, message }: Props) {
  return (
    <div>
      <div className={`fixed top-0 left-0 z-10 items-center justify-center w-screen h-screen ${open ? "flex" : "hidden"}`}>
        <div className="fixed top-0 left-0 items-center justify-center w-screen h-screen pointer-events-none opacity-60 bg-slate-900"></div>
        <div className="z-50">
          <p className="text-3xl text-white">{message || "Đang tải..."}</p>
        </div>
      </div>
    </div>
  );
}
