import classNames from "classnames";
import React, { ReactNode } from "react";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  message?: ReactNode;
};

export default function ConfirmModal({ open, setOpen, onConfirm, onCancel, message }: Props) {
  const closeThis = (e) => {
    // Chỉ đóng khi click vào ngoài modal
    if (e.target === e.currentTarget) {
      setOpen(false);
    }
  };

  const confirm = () => {
    setOpen(false);
    if (onConfirm) {
      onConfirm();
    }
  };

  const cancel = () => {
    setOpen(false);
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div>
      <div
        className={classNames("fixed top-0 left-0 z-20 items-center justify-center w-screen h-screen ", {
          flex: open,
          hidden: !open,
        })}
        onMouseDown={closeThis}
      >
        <div className="fixed top-0 left-0 items-center justify-center w-screen h-screen pointer-events-none opacity-60 bg-slate-900"></div>
        <div className="z-[60] bg-white p-3 flex flex-col max-w-sm">
          <div>{message || "Bạn có chắc chắn?"}</div>
          <div className="flex mt-2">
            <button className="w-full mr-2 button-classic whitespace-nowrap" onClick={cancel}>
              Hủy
            </button>
            <button className="w-full ml-2 button-classic whitespace-nowrap" onClick={confirm}>
              Đồng ý
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
