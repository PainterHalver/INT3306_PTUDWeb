import classNames from "classnames";
import React from "react";

type Props = {
  children: React.ReactNode;
  open: boolean;
  setOpen: (open: boolean) => void;
};

export default function Modal({ children, open, setOpen }: Props) {
  const closeThis = (e) => {
    // Chỉ đóng khi click vào ngoài modal
    if (e.target === e.currentTarget) {
      setOpen(false);
    }
  };

  return (
    <div>
      <div
        className={classNames("fixed top-0 left-0 z-10 items-center justify-center w-screen h-screen ", {
          flex: open,
          hidden: !open,
        })}
        onMouseDown={closeThis}
      >
        <div className="fixed top-0 left-0 items-center justify-center w-screen h-screen pointer-events-none opacity-60 bg-slate-900"></div>
        <div className="z-50">{children}</div>
      </div>
    </div>
  );
}
