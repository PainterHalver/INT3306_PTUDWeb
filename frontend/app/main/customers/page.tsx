"use client";
import { FormEvent, useEffect, useState } from "react";
import ConfirmDeleteModal from "../../../components/ConfirmDeleteModal";
import Modal from "../../../components/Modal";

import { useAppDispatch, useAuthContext } from "../../../contexts/appContext";
import { useToast } from "../../../contexts/toastContext";
import axios from "../../../helpers/axios";
import { Customer, Productline } from "../../../helpers/types";

export default function ProductLines() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [nameQuery, setNameQuery] = useState<string>("");
  const [phoneQuery, setPhoneQuery] = useState<string>("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
  const [addErrors, setAddErrors] = useState<string[]>([]);
  const [updateModalOpen, setUpdateModalOpen] = useState<boolean>(false);
  const [updateErrors, setUpdateErrors] = useState<string[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);

  // Add form states
  const [addName, setAddName] = useState<string>("");
  const [addPhone, setAddPhone] = useState<string>("");
  const [addAddress, setAddAddress] = useState<string>("");

  const dispatch = useAppDispatch();
  const { user } = useAuthContext();
  const toast = useToast();

  useEffect(() => {
    getCustomers();
  }, []);

  const getCustomers = async (nameQuery: string = "", phoneQuery: string = "") => {
    try {
      dispatch("LOADING");
      // TODO: Pagination
      const res = await axios.get("/customers", {
        params: {
          name: nameQuery,
          phone: phoneQuery,
        },
      });
      setCustomers(res.data.customers);
    } catch (error) {
      console.log(error);
    } finally {
      dispatch("STOP_LOADING");
    }
  };

  const addCustomer = async () => {
    try {
      dispatch("LOADING", "Thêm khách hàng...");
      const res = await axios.post("/customers", {
        name: addName,
        phone: addPhone,
        address: addAddress,
      });

      // Tắt modal sau khi thêm thành công
      setAddModalOpen(false);

      // Hiển thị toast
      toast.success("Thêm khách hàng thành công!");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setAddErrors(Object.values(error.response?.data.errors));
      }
      toast.error("Thêm khách hàng thất bại!");
      console.log(error);
    } finally {
      dispatch("STOP_LOADING");
    }
  };

  const updateCustomer = async () => {
    try {
      dispatch("LOADING", "Cập nhật khách hàng...");
      const res = await axios.put(`/customers/${selectedCustomer?.id}`, {
        name: selectedCustomer?.name,
        phone: selectedCustomer?.phone,
        address: selectedCustomer?.address,
      });

      // Tắt modal sau khi cập nhật thành công
      setUpdateModalOpen(false);

      // Hiển thị toast
      toast.success("Cập nhật khách hàng thành công!");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setUpdateErrors(Object.values(error.response?.data.errors));
      }
      toast.error("Cập nhật khách hàng thất bại!");
      console.log(error);
    } finally {
      dispatch("STOP_LOADING");
    }
  };

  const deleteCustomer = async () => {
    try {
      dispatch("LOADING", "Xóa khách hàng...");
      const res = await axios.delete(`/customers/${selectedCustomer?.id}`);

      // Tắt modal sau khi xóa thành công, deleteModal không cần tắt vì tắt trong hàm onConfirm rồi
      setUpdateModalOpen(false);

      // Hiển thị toast
      toast.success("Xóa khách hàng thành công!");
    } catch (error) {
      console.log(error);
    } finally {
      dispatch("STOP_LOADING");
    }
  };

  const searchFormHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await getCustomers(nameQuery, phoneQuery);
  };

  const addFormHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await addCustomer();

    // Reset form
    setAddName("");
    setAddPhone("");
    setAddAddress("");

    // Load lại danh sách khách hàng
    await getCustomers();
  };

  const updateFormHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await updateCustomer();

    // Load lại danh sách khách hàng
    await getCustomers();
  };

  const deleteHandler = async () => {
    await deleteCustomer();

    // Load lại danh sách khách hàng
    await getCustomers();
  };

  return (
    <>
      <div className="flex justify-start mb-4 ">
        <form className="flex flex-col w-full gap-2 lg:flex-row" onSubmit={searchFormHandler}>
          <input placeholder="Tên khách hàng" className="w-full px-2 py-1 border border-slate-900 focus:outline-none" onChange={(e) => setNameQuery(e.target.value)} value={nameQuery} />
          <input placeholder="Số điện thoại" className="w-full px-2 py-1 border border-slate-900 focus:outline-none" onChange={(e) => setPhoneQuery(e.target.value)} value={phoneQuery} />
          <button className="button-classic whitespace-nowrap">Tìm kiếm</button>
        </form>
      </div>

      {user.account_type === "dai_ly" && (
        <div className="flex mt-6 mb-3">
          <button className="ml-auto button-classic" onClick={() => setAddModalOpen(true)}>
            Thêm khách hàng
          </button>
        </div>
      )}

      {customers.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th className="w-[7%]">ID</th>
              <th className="w-[20%]">Tên</th>
              <th className="w-[23%]">Số điện thoại</th>
              <th className="w-[50%]">Địa chỉ</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((productline) => (
              <tr
                key={productline.id}
                className="cursor-pointer hover:bg-slate-300"
                onClick={() => {
                  // Chỉ cho phép đại lý sửa xóa khách hàng
                  if (user.account_type !== "dai_ly") {
                    return;
                  }
                  setSelectedCustomer(productline);
                  setUpdateModalOpen(true);
                }}
              >
                <td>{productline.id}</td>
                <td>{productline.name}</td>
                <td>{productline.phone}</td>
                <td>{productline.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal open={addModalOpen} setOpen={setAddModalOpen}>
        <div className="p-4 bg-white">
          <h2 className="text-xl">Thêm khách hàng</h2>
          <hr className="my-1 border-t-slate-700" />
          <form className="flex flex-col min-w-[350px] text-md" onSubmit={addFormHandler} autoComplete="false">
            <label htmlFor="name">Tên khách hàng:</label>
            <input type="text" name="name" className="form-input" onChange={(e) => setAddName(e.target.value)} value={addName} />
            <label htmlFor="phone">Số điện thoại:</label>
            <input type="text" name="phone" className="form-input" onChange={(e) => setAddPhone(e.target.value)} value={addPhone} />
            <label htmlFor="address">Địa chỉ:</label>
            <input type="text" name="address" className="form-input" onChange={(e) => setAddAddress(e.target.value)} value={addAddress} />
            <div className="flex items-center justify-end">
              <div className="text-red-500">
                {addErrors.map((error) => (
                  <p key={error}>{error}</p>
                ))}
              </div>
              <button className="mt-3 ml-auto button green" type="submit">
                Thêm
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {selectedCustomer && (
        <Modal open={updateModalOpen} setOpen={setUpdateModalOpen}>
          <div className="p-4 bg-white">
            <h2 className="text-xl">Cập nhật khách hàng id: {selectedCustomer.id}</h2>
            <hr className="my-1 border-t-slate-700" />
            <form className="flex flex-col min-w-[350px] text-md" onSubmit={updateFormHandler} autoComplete="false">
              <label htmlFor="name">Tên khách hàng:</label>
              <input type="text" name="name" className="form-input" onChange={(e) => setSelectedCustomer({ ...selectedCustomer, name: e.target.value })} value={selectedCustomer.name} />
              <label htmlFor="phone">Số điện thoại:</label>
              <input type="text" name="phone" className="form-input" onChange={(e) => setSelectedCustomer({ ...selectedCustomer, phone: e.target.value })} value={selectedCustomer.phone} />
              <label htmlFor="address">Địa chỉ:</label>
              <input type="text" name="address" className="form-input" onChange={(e) => setSelectedCustomer({ ...selectedCustomer, address: e.target.value })} value={selectedCustomer.address} />
              <div className="flex items-center justify-end">
                <div className="text-red-500">
                  {updateErrors.map((error) => (
                    <p key={error}>{error}</p>
                  ))}
                </div>
                <button className="mt-3 ml-auto button-classic" type="submit">
                  Cập nhật
                </button>
                <button className="mt-3 ml-3 button-classic" type="button" onClick={() => setDeleteModalOpen(true)}>
                  Xóa
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      <ConfirmDeleteModal open={deleteModalOpen} setOpen={setDeleteModalOpen} message={"Bạn có chắc chắn muốn xóa khách hàng này?"} onConfirm={deleteHandler} />
    </>
  );
}
