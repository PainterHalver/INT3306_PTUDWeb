import "./globals.css";
import AuthProvider from "../contexts/appContext";
import { ToastProvider } from "../contexts/toastContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />
      <body>
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>

        {/* Background div */}
        <div className="fixed inset-0 z-[-20] " />
      </body>
    </html>
  );
}
