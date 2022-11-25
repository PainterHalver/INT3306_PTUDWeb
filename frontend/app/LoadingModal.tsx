import React from "react";

type Props = {
  open: boolean;
};

export default function LoadingModal({ open }: Props) {
  return (
    <div>
      <div className={`fixed top-0 left-0 z-[100] items-center justify-center w-screen h-screen opacity-60 bg-slate-900 ${open ? "flex" : "hidden"}`}>
        <p className="text-3xl text-white">Loading...</p>
      </div>
    </div>
  );
}
