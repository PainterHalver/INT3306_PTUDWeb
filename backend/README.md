# Chạy

> trên node 18.x

1. `npm install`

2. `npm run seed`

3. `npm start`

## Notes

1. Cở sở sản xuất tạo một DÒNG SẢN PHẨM, sau đó tạo ra nhiều sản phẩm thuộc dòng sản phẩm bằng api.
2. Nếu api call có lỗi thì trả về 1 object có property `errors` chứa thông tin các trường bị lỗi hoặc chứa `message` nếu là lỗi chung.
3. Hiện tại nơi nhận sản phẩm sẽ là nơi cập nhật trạng thái sản phẩm. Trạng thái sản phẩm khi đang trên đường sẽ được cài đặt sau.
4. Khi sản phẩm phát hiện lỗi thì cơ sở sản xuất nhận về, và đại lý có trách nhiệm bàn gửi sản phẩm mới thay thế cho khách hàng.
