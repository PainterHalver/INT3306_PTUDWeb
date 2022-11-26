import classNames from "classnames";
import React from "react";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  message?: string;
};

export default function ConfirmDeleteModal({ open, setOpen, onConfirm, onCancel, message }: Props) {
  const closeThis = (e) => {
    // Chỉ đóng khi click vào ngoài modal
    if (e.target === e.currentTarget) {
      setOpen(false);
    }
  };

  const confirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    setOpen(false);
  };

  const cancel = () => {
    if (onCancel) {
      onCancel();
    }
    setOpen(false);
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
          <div>{message || "Bạn có chắc chắn muốn xóa?"}</div>
          <div className="flex mt-2">
            <button className="w-full mr-2 button-classic" onClick={cancel}>
              Hủy
            </button>
            <button className="w-full ml-2 button-classic-red" onClick={confirm}>
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
