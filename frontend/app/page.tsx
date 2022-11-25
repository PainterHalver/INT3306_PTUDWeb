import LoginForm from "../components/LoginForm";

export default async function Home() {
  return (
    <div className="relative flex items-start justify-center w-screen h-screen bg-cover bg-login">
      <div className="absolute flex gap-6 top-[20%] w-[90%] max-w-[1100px]">
        <div className="flex-col items-center justify-center flex-grow-[2] text-blue-primary font-bold weight hidden lg:flex">
          <img src="https://testonline.uet.vnu.edu.vn/logos/s1_logo.png" alt="logo" />
          <p className="mt-4 mb-1 text-[14pt] uppercase">ECorp's Production Move</p>
          <p className="text-[18.5pt] uppercase">Hệ thống quản lý vòng đời sản phẩm</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
