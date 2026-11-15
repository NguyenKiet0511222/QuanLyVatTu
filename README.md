# Hệ Thống Quản Lý Thiết Bị Và Vật Tư (Equipment & Asset Management System)

Dự án phần mềm quản lý toàn diện vòng đời thiết bị, vật tư, quy trình mượn - trả và bảo dưỡng sửa chữa thiết bị dành cho tổ chức / doanh nghiệp.

---

## 🛠 Công nghệ sử dụng (Tech Stack)

### Backend
- **Ngôn ngữ:** Java 17
- **Framework:** Spring Boot 3.3.4
- **ORM / Persistence:** Spring Data JPA, Hibernate
- **Database:** MySQL
- **Bảo mật:** JWT (JSON Web Token)
- **Công cụ hỗ trợ:** Lombok, Maven

### Frontend
- **Framework / Thư viện:** React 19, React Router DOM v7
- **Build Tool:** Vite
- **UI Kit:** Ant Design (AntD v6), Ant Design Icons
- **HTTP Client:** Axios
- **Xử lý thời gian:** Dayjs

---

## 🚀 Các tính năng chính

1. **Quản lý thiết bị & vật tư:**
   - Theo dõi danh mục thiết bị, tình trạng hoạt động (Tốt, Hỏng, Đang bảo trì,...), phân loại và vị trí lưu trữ (phòng máy, kho).
2. **Quy trình Mượn - Trả:**
   - Tạo phiếu mượn thiết bị, gán người mượn và nhân viên xử lý.
   - Quản lý chi tiết danh sách thiết bị mượn, ngày mượn, ngày hẹn trả và trạng thái hoàn trả.
3. **Quản lý bảo trì & sửa chữa:**
   - Ghi nhận yêu cầu và tiến độ xử lý bảo trì (IN_PROGRESS, COMPLETED,...).
   - Mô tả sự cố và thống kê thiết bị cần sửa chữa.
4. **Quản lý nhân sự & người mượn:**
   - Danh sách nhân viên, tài khoản người mượn.
5. **Xác thực & Phân quyền:**
   - Đăng nhập bảo mật sử dụng JWT.
   - Phân quyền theo vai trò (`ADMIN`, `STAFF`).
6. **Bảng điều khiển (Dashboard):**
   - Thống kê tổng số thiết bị, số thiết bị đang mượn, số thiết bị đang bảo trì và thông báo hệ thống.

---

## 📦 Hướng dẫn cài đặt & Khởi chạy

### 1. Cơ sở dữ liệu (MySQL)
- Mở MySQL Workbench hoặc trình quản lý cơ sở dữ liệu.
- Chạy script SQL: `Nhom13_DB_Sql (1).sql` để khởi tạo database `qlvt` và dữ liệu mẫu.
- Cấu hình thông tin kết nối tại `Backend/src/main/resources/application.properties`:
  ```properties
  spring.datasource.url=jdbc:mysql://localhost:3306/qlvt?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true&characterEncoding=UTF-8
  spring.datasource.username=root
  spring.datasource.password=<your_password>
  ```

### 2. Khởi chạy Backend
```bash
cd Backend
mvn spring-boot:run
```
*Backend API chạy tại:* `http://localhost:8081/api`

### 3. Khởi chạy Frontend
```bash
cd Frontend
npm install
npm run dev
```
*Giao diện người dùng chạy tại:* `http://localhost:5173` (hoặc cổng hiển thị trên terminal).

