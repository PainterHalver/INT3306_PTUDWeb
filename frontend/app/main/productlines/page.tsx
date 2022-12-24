"use client";
import { FormEvent, useEffect, useState } from "react";
import ConfirmDeleteModal from "../../../components/ConfirmDeleteModal";
import Modal from "../../../components/Modal";

import { useAppDispatch } from "../../../contexts/appContext";
import { useToast } from "../../../contexts/toastContext";
import axios from "../../../helpers/axios";
import { Productline } from "../../../helpers/types";

export default function ProductLines() {
  const [productlines, setProductlines] = useState<Productline[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedProductline, setSelectedProductline] = useState<Productline | null>(null);
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
  const [addErrors, setAddErrors] = useState<string[]>([]);
  const [updateModalOpen, setUpdateModalOpen] = useState<boolean>(false);
  const [updateErrors, setUpdateErrors] = useState<string[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);

  // Add form states
  const [addName, setAddName] = useState<string>("");
  const [addModel, setAddModel] = useState<string>("");
  const [addDescription, setAddDescription] = useState<string>("");
  const [addWarrantyMonths, setAddWarrantyMonths] = useState<number>(0);
  const [addOs, setAddOs] = useState<string>("");
  const [addCamera, setAddCamera] = useState<string>("");
  const [addCpu, setAddCpu] = useState<string>("");
  const [addRam, setAddRam] = useState<string>("");
  const [addStorage, setAddStorage] = useState<string>("");
  const [addBattery, setAddBattery] = useState<string>("");
  const [addPrice, setAddPrice] = useState<string>("");

  const dispatch = useAppDispatch();
  const toast = useToast();

  useEffect(() => {
    getProductlines("");
  }, []);

  const getProductlines = async (query: string) => {
    try {
      dispatch("LOADING");
      // TODO: Pagination
      const res = await axios.get("/productlines", {
        params: {
          query,
          limit: 1000,
        },
      });
      setProductlines(res.data.product_lines);
    } catch (error) {
      console.log(error);
    } finally {
      dispatch("STOP_LOADING");
    }
  };

  const addProductline = async () => {
    try {
      dispatch("LOADING", "Thêm dòng sản phẩm...");
      const res = await axios.post("/productlines", {
        name: addName,
        model: addModel,
        description: addDescription,
        warranty_months: addWarrantyMonths,
        os: addOs,
        cpu: addCpu,
        ram: addRam,
        storage: addStorage,
        camera: addCamera,
        battery: addBattery,
        price: addPrice,
      });

      // Tắt modal sau khi thêm thành công
      setAddModalOpen(false);

      // Hiển thị toast
      toast.success("Thêm dòng sản phẩm thành công!");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setAddErrors(Object.values(error.response?.data.errors));
      }
      toast.error("Thêm dòng sản phẩm thất bại!");
      console.log(error);
    } finally {
      dispatch("STOP_LOADING");
    }
  };

  const updateProductline = async () => {
    try {
      dispatch("LOADING", "Cập nhật dòng sản phẩm...");
      const res = await axios.put(`/productlines/${selectedProductline?.id}`, {
        name: selectedProductline?.name,
        model: selectedProductline?.model,
        description: selectedProductline?.description,
        warranty_months: selectedProductline?.warranty_months,
      });

      // Tắt modal sau khi cập nhật thành công
      setUpdateModalOpen(false);

      // Hiển thị toast
      toast.success("Cập nhật dòng sản phẩm thành công!");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setUpdateErrors(Object.values(error.response?.data.errors));
      }
      toast.error("Cập nhật dòng sản phẩm thất bại!");
      console.log(error);
    } finally {
      dispatch("STOP_LOADING");
    }
  };

  const deleteProductline = async () => {
    try {
      dispatch("LOADING", "Xóa dòng sản phẩm...");
      const res = await axios.delete(`/productlines/${selectedProductline?.id}`);

      // Tắt modal sau khi xóa thành công, deleteModal không cần tắt vì tắt trong hàm onConfirm rồi
      setUpdateModalOpen(false);

      // Hiển thị toast
      toast.success("Xóa dòng sản phẩm thành công!");
    } catch (error) {
      console.log(error);
    } finally {
      dispatch("STOP_LOADING");
    }
  };

  const searchFormHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await getProductlines(searchQuery);
  };

  const addFormHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await addProductline();

    // Reset form
    setAddName("");
    setAddModel("");
    setAddDescription("");
    setAddWarrantyMonths(0);

    // Load lại danh sách dòng sản phẩm
    await getProductlines("");
  };

  const updateFormHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await updateProductline();

    // Load lại danh sách dòng sản phẩm
    await getProductlines("");
  };

  const deleteHandler = async () => {
    await deleteProductline();

    // Load lại danh sách dòng sản phẩm
    await getProductlines("");
  };

  return (
    <>
      <div className="flex justify-start mb-4 ">
        <form className="flex w-full" onSubmit={searchFormHandler}>
          <input placeholder="Tên, model hoặc mô tả" className="w-full px-2 py-1 border border-slate-900 focus:outline-none" onChange={(e) => setSearchQuery(e.target.value)} />
          <button className="ml-2 button-classic whitespace-nowrap">Tìm kiếm</button>
        </form>
      </div>
      <div className="flex mt-6 mb-3">
        <button className="ml-auto button-classic" onClick={() => setAddModalOpen(true)}>
          Thêm dòng sản phẩm
        </button>
      </div>
      {productlines.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th className="w-[10%]">ID</th>
              <th className="w-[20%]">Tên</th>
              <th className="w-[30%]">Model</th>
              <th className="w-[20%]">Bảo hành</th>
              <th className="w-[20%]">Tổng sản phẩm</th>
            </tr>
          </thead>
          <tbody>
            {productlines.map((productline) => (
              <tr
                key={productline.id}
                className="cursor-pointer hover:bg-slate-300"
                onClick={() => {
                  setSelectedProductline(productline);
                  setUpdateModalOpen(true);
                }}
              >
                <td>{productline.id}</td>
                <td>{productline.name}</td>
                <td>{productline.model}</td>
                <td>{productline.warranty_months} tháng</td>
                <td>{productline.product_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal open={addModalOpen} setOpen={setAddModalOpen}>
        <div className="p-4 bg-white">
          <h2 className="text-xl">Thêm dòng sản phẩm</h2>
          <hr className="my-1 border-t-slate-700" />
          <form className="flex flex-col min-w-[350px] text-md" onSubmit={addFormHandler} autoComplete="false">
            <label htmlFor="name">Tên dòng sản phẩm:</label>
            <input type="text" name="name" className="form-input" onChange={(e) => setAddName(e.target.value)} value={addName} />
            <label htmlFor="model">Tên Model:</label>
            <input type="text" name="model" className="form-input" onChange={(e) => setAddModel(e.target.value)} value={addModel} />
            <label htmlFor="os">OS:</label>
            <input type="text" name="os" className="form-input" onChange={(e) => setAddOs(e.target.value)} value={addOs} />
            <label htmlFor="cpu">CPU:</label>
            <input type="text" name="cpu" className="form-input" onChange={(e) => setAddCpu(e.target.value)} value={addCpu} />
            <label htmlFor="ram">RAM:</label>
            <input type="text" name="ram" className="form-input" onChange={(e) => setAddRam(e.target.value)} value={addRam} />
            <label htmlFor="storage">Storage:</label>
            <input type="text" name="storage" className="form-input" onChange={(e) => setAddStorage(e.target.value)} value={addStorage} />
            <label htmlFor="battery">Pin:</label>
            <input type="text" name="battery" className="form-input" onChange={(e) => setAddBattery(e.target.value)} value={addBattery} />
            <label htmlFor="camera">Camera:</label>
            <input type="text" name="camera" className="form-input" onChange={(e) => setAddCamera(e.target.value)} value={addCamera} />
            <label htmlFor="price">Giá:</label>
            <input type="text" name="price" className="form-input" onChange={(e) => setAddPrice(e.target.value)} value={addPrice} />
            <label htmlFor="description">Mô tả:</label>
            <input type="text" name="description" className="form-input" onChange={(e) => setAddDescription(e.target.value)} value={addDescription} />

            <label htmlFor="warranty_months">Thời hạn bảo hành (số tháng):</label>
            <input type="number" name="warranty_months" className="form-input" onChange={(e) => setAddWarrantyMonths(parseInt(e.target.value))} value={addWarrantyMonths} />
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

      {selectedProductline && (
        <Modal open={updateModalOpen} setOpen={setUpdateModalOpen}>
          <div className="p-4 bg-white">
            <h2 className="text-xl">Cập nhật dòng sản phẩm id: {selectedProductline.id}</h2>
            <hr className="my-1 border-t-slate-700" />
            <form className="flex flex-col min-w-[350px] text-md" onSubmit={updateFormHandler} autoComplete="false">
              <label htmlFor="name">Tên dòng sản phẩm:</label>
              <input type="text" name="name" className="form-input" onChange={(e) => setSelectedProductline({ ...selectedProductline, name: e.target.value })} value={selectedProductline.name} />
              <label htmlFor="model">Tên Model:</label>
              <input type="text" name="model" className="form-input" onChange={(e) => setSelectedProductline({ ...selectedProductline, model: e.target.value })} value={selectedProductline.model} />
              <label htmlFor="os">OS:</label>
              <input type="text" name="os" className="form-input" onChange={(e) => setSelectedProductline({ ...selectedProductline, os: e.target.value })} value={selectedProductline.os} />
              <label htmlFor="cpu">CPU:</label>
              <input type="text" name="cpu" className="form-input" onChange={(e) => setSelectedProductline({ ...selectedProductline, cpu: e.target.value })} value={selectedProductline.cpu} />
              <label htmlFor="ram">RAM:</label>
              <input type="text" name="ram" className="form-input" onChange={(e) => setSelectedProductline({ ...selectedProductline, ram: e.target.value })} value={selectedProductline.ram} />
              <label htmlFor="storage">Storage:</label>
              <input
                type="text"
                name="storage"
                className="form-input"
                onChange={(e) => setSelectedProductline({ ...selectedProductline, storage: e.target.value })}
                value={selectedProductline.storage}
              />
              <label htmlFor="battery">Pin:</label>
              <input
                type="text"
                name="battery"
                className="form-input"
                onChange={(e) => setSelectedProductline({ ...selectedProductline, battery: e.target.value })}
                value={selectedProductline.battery}
              />
              <label htmlFor="camera">Camera:</label>
              <input type="text" name="camera" className="form-input" onChange={(e) => setSelectedProductline({ ...selectedProductline, camera: e.target.value })} value={selectedProductline.camera} />
              <label htmlFor="price">Giá:</label>
              <input type="text" name="price" className="form-input" onChange={(e) => setSelectedProductline({ ...selectedProductline, price: e.target.value })} value={selectedProductline.price} />
              <label htmlFor="description">Mô tả:</label>
              <input
                type="text"
                name="description"
                className="form-input"
                onChange={(e) => setSelectedProductline({ ...selectedProductline, description: e.target.value })}
                value={selectedProductline.description}
              />
              <label htmlFor="warranty_months">Thời hạn bảo hành (số tháng):</label>
              <input
                type="number"
                name="warranty_months"
                className="form-input"
                onChange={(e) => setSelectedProductline({ ...selectedProductline, warranty_months: parseInt(e.target.value) })}
                value={selectedProductline.warranty_months}
              />
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

      <ConfirmDeleteModal
        open={deleteModalOpen}
        setOpen={setDeleteModalOpen}
        message={"Xóa một dòng sản phẩm sẽ xóa tất cả các sản phẩm của dòng sản phẩm đó. Bạn có chắc chắn muốn xóa?"}
        onConfirm={deleteHandler}
      />
    </>
  );
}
