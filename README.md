# Bài tập lớn Phát triển ứng dụng web: ProductionMove

## Thành viên nhóm

- Lê Văn Hòa - 20020406
- Đào Đức Hiệp - 20020259
- Nguyễn Đức Anh - 20020095

## Stack sử dụng

- Stack Backend: Typescript, TypeORM (sqlite), NodeJS, ExpressJS
- Stack Frontend: Typescript, Next.js, TailwindCSS
- Stack Overflow

## Tiêu chí chấm điểm

1. Các chức năng đã cài đặt: [Xem ở dưới](#các-chức-năng-đã-cài-đặt)
2. 😉
3. Responsive GUI.
4. Hiệu năng:
   - Dùng React, axios và Next.js layout để tại lại bộ phận trang web, cập nhật DOM.
   - Backend API gửi JSON giao tiếp với frontend.
5. 👏
6. Xử lý nhập liệu:
   - Validate các input.
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

## Các chức năng đã cài đặt

```diff
! Cam: Đã cài đặt ở backend
+ Xanh: Đã cài đặt ở backend + frontend
```

```diff
**Ban điều hành BigCorp**

+ Quản lý danh mục dòng sản phẩm.
+ Cấp tài khoản và quản lý danh mục các cơ sở sản xuất, đại lý phân phối và trung tâm bảo hành.
+ Theo dõi và xem thống kê sản phẩm trên toàn quốc, theo trạng thái và theo cơ sở sản xuất, đại lý phân phối và trung tâm bảo hành.

**Cơ sở sản xuất**

+ Nhập các lô sản phẩm mới vừa sản xuất vào kho.
+ Xuất sản phẩm cho đại lý.
! Nhận các sản phẩm lỗi về từ các trung tâm bảo hành.
! Thống kê và báo cáo số liệu sản phẩm theo từng loại (trạng thái), theo tháng, quý, năm.
! Thống kê và phân tích số lượng sản phẩm bán ra hàng tháng, quý, năm.
! Thống kê tỉ lệ sản phẩm bị lỗi theo dòng sản phẩm, cơ sở sản xuất, đại lý phân phối.

**Đại lý phân phối**

+ Nhập sản phẩm mới về từ cơ sở sản xuất. Sản phẩm nhập về được lưu tại kho (riêng, nội bộ) của đại lý.
+ Bán sản phẩm cho khách hàng.
+ Nhận lại sản phẩm cần bảo hành và chuyển đến trung tâm bảo hành.
! Nhận lại sản phẩm từ trung tâm bảo hành để trả cho khách hàng.
! Thống kê và báo cáo số liệu sản phẩm theo từng loại (trạng thái liên), theo tháng, quý, năm.
! Thống kê và phân tích số lượng sản phẩm bán ra hàng tháng, quý, năm.

**Trung tâm bảo hành**

+ Nhận các sản phẩm bảo hành hoặc triệu hồi từ đại lý.
! Trả sản phẩm đã sửa chữa xong cho đại lý.
! Chuyển sản phẩm bảo hành lỗi không thể sửa chữa về cơ sở sản xuất.
! Thống kê và báo cáo số liệu sản phẩm theo từng loại (trạng thái), theo tháng, quý, năm.
```

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
- 4 trạng thái đang trên đường vận chuyển và chuyển thành trạng thái chính thức khi nhận được: `đưa về đại lý (đang trên đường)`, `đang sửa chữa bảo hành (đang trên đường)`, `đã bảo hành xong (đang trên đường)`, `lỗi đã đưa về cơ sở sản xuất (đang trên đường)`
