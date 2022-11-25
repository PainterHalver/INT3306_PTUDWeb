"use client";
import classNames from "classnames";
import React, { useState } from "react";

type Toast = {
  id: number;
  message: string;
  type: "success" | "error";
};

type ToastContext = {
  success: (message: string) => void;
  error: (message: string) => void;
  remove: (id: number) => void;
};

const ToastContext = React.createContext<ToastContext>(null);

// Provider
// ==============================

let toastCount = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const timeout = (id: number) => {
    // Xóa toast sau 3s
    setTimeout(() => {
      console.log({ id, toasts });
      remove(id);
    }, 3000);
  };

  const success = (message: string) => {
    const id = toastCount++;
    const toast: Toast = { message, id, type: "success" };
    setToasts((old) => [...old, toast]);
    timeout(id);
  };

  const error = (message: string) => {
    const id = toastCount++;
    const toast: Toast = { message, id, type: "error" };
    setToasts((old) => [...old, toast]);
    timeout(id);
  };

  const remove = (id: number) => {
    setToasts((old) => old.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ success, error, remove }}>
      {children}
      <div className="fixed bottom-0 right-0">
        {toasts.map(({ message, id, type }) => (
          <div
            key={id}
            onClick={() => remove(id)}
            className={classNames("p-3 m-3 cursor-pointer text-white", {
              "bg-green-500": type === "success",
              "bg-red-500": type === "error",
            })}
          >
            {message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Consumer
// ==============================

export const useToast = () => React.useContext(ToastContext);
