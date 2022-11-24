# Bài tập lớn Phát triển ứng dụng web: ProductionMove

## Thành viên nhóm

- Lê Văn Hòa - 20020406
- Đào Đức Hiệp - 20020259
- Nguyễn Đức Anh - 20020095

## Stack sử dụng

- Stack Frontend: ...
- Stack Backend: ...
- Stack Overflow

## Vòng đời của sản phẩm

> Trong một vòng đời thì sản phẩm chỉ có thể thuộc 1 cơ sở, 1 đại lý, 1 người dùng nhưng trung tâm bảo hành không cố định tùy vào lựa chọn của đại lý lúc gửi đi bảo hành.

1. Ban điều hành BigCorp (admin) tạo ra dòng sản phẩm bao gồm tên, model, thời gian bảo hành theo tháng và các thuộc tính khác.
2. Cơ sở sản xuất tạo ra một số lượng sản phẩm từ một dòng sản phẩm. ➡️ `mới sản xuất`.
3. Cơ sở sản xuất gửi nhiều sản phẩm về cho đại lý được chọn. ➡️`đưa về đại lý`.
4. Đại lý bán 1 hoặc nhiều sản phẩm cho khách hàng. ➡️`đã bán`
5. Đại lý nhận sản phẩm cần bảo hành từ khách hàng khi có vấn đề. Đại lý chọn trung tâm bảo hành cần gửi sản phẩm tới. ➡️`lỗi cần bảo hành`
6. Trung tâm bảo hành nhận các sản phẫm từ đại lý và bắt đầu sửa chữa. ➡️`đang sửa chữa bảo hành`

### Bảo hành thành công

7. Đại lý nhận lại các sản phẩm đã bảo hành. ➡️`đã bảo hành xong`
8. Đại lý gửi lại các sản phẩm bảo hành xong cho khách hàng. ➡️`đã trả lại bảo hành cho khách hàng`

### Bảo hành không thành công

7. Trung tâm bảo hành báo sản phẫm lỗi không sửa được. Đại lý liên hệ với khách hàng để cung cấp sản phẩm thay thế. ➡️`lỗi cần trả về nhà máy`
8. Cơ sở sản xuất nhận lại sản phẩm lỗi từ trung tâm bảo hành. ➡️`lỗi đã đưa về cơ sở sản xuất`

### Các trường hợp khác

- Sản phẩm đang thuộc các trạng thái ở chỗ khách hàng và được triệu hồi. ➡️`lỗi cần triệu hồi`
- Sản phẩm đang ở chỗ khách hàng và hết bảo hành. ➡️`hết thời gian bảo hành`
- Đại lý trả lại sản phẩm cho nơi sản xuất vì lâu không bán được. ➡️`trả lại cơ sở sản xuất`

## Các chức năng đã cài đặt

## Tiêu chí chấm điểm

1. Các chức năng đã cài đặt: [Xem ở trên](#các-chức-năng-đã-cài-đặt)
2. 😉
3. Có GUI Responsive.
4. Hiệu năng:
   - Dùng React và fetch để tại lại bộ phận trang web, cập nhật DOM.
   - Backend API gửi JSON giao tiếp với frontend.
5. 👏
6. Xử lý nhập liệu:
   - Validate các input ở cả frontend và backend.
   - ...
   - ...
7. Xử lý phiên, xác thực, an ninh:
   - Dùng jwt để xác thực người dùng.
   - API có phân quyền.
   - Password được hash trước khi lưu vào database.
   - Không dùng raw SQL. Input được escape/sanitize bởi TypeORM.
8. Định tuyến URL:
   - Frontend: Dùng React Router để định tuyến URL.
   - Backend: REST API.
9. Cơ sở dữ liệu:
   - Thao tác theo lập trình hướng đối tượng: ORM và các [lớp đối tượng](./backend/src/entities/).
   - Các lớp validate trước khi lưu vào database: Frontend -> Controller của route API -> [Custom Validator](./backend/src/helpers/validators.ts), TypeORM, class-validator -> Database Constraints.
