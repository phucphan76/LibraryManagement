# Hệ Thống Quản Lý Thư Viện (PERN Stack)

Ứng dụng Quản lý Thư viện hoàn chỉnh sử dụng **PERN Stack** (PostgreSQL, Express, React, Node.js). Hệ thống tích hợp phân hệ dành cho Thủ thư (quản lý sách, quản lý độc giả, mượn trả sách, báo cáo thống kê) và phân hệ dành cho Độc giả (tìm kiếm sách, xem chi tiết sách, theo dõi lịch sử mượn trả cá nhân).

## Công Nghệ Sử Dụng

- **Frontend:** React, Vite, Lucide React (Icons), Glassmorphism UI (Vanilla CSS).
- **Backend:** Node.js, Express, PG (PostgreSQL client), Bcrypt (Mã hóa mật khẩu), JWT (Xác thực phân quyền).
- **Database:** PostgreSQL (Có sẵn Triggers tự động hóa nghiệp vụ mượn sách, trả sách và tính phí phạt).

---

## Cấu Trúc Thư Mục Chính

```text
├── client/                 # Mã nguồn Frontend (React)
├── server/                 # Mã nguồn Backend (Express)
│   ├── routes/             # Định tuyến API (auth, readers...)
│   ├── middleware/         # Middleware bảo mật (JWT auth)
│   ├── db.js               # Kết nối PostgreSQL
│   ├── .env.example        # Bản sao hướng dẫn cấu hình môi trường
│   └── index.js            # Entrypoint của server
├── library_management_db.sql # Script khởi tạo Database mẫu
└── README.md               # Hướng dẫn sử dụng
```

---

## Hướng Dẫn Cài Đặt và Chạy Dự Án

### Bước 1: Khởi Tạo Cơ Sở Dữ Liệu
1. Mở PostgreSQL và tạo một database mới:
   ```sql
   CREATE DATABASE library_db;
   ```
2. Chạy toàn bộ script trong file `library_management_db.sql` trên database `library_db` vừa tạo để khởi tạo schema, tables, triggers, functions và dữ liệu mẫu.

### Bước 2: Cấu Hình và Chạy Backend Server
1. Đi tới thư mục `server/`:
   ```bash
   cd server
   ```
2. Cài đặt các thư viện cần thiết:
   ```bash
   npm install
   ```
3. Tạo file cấu hình môi trường `.env` từ file `.env.example`:
   ```bash
   cp .env.example .env
   ```
   *Mở file `.env` ra và điền thông tin tài khoản PostgreSQL của bạn.*
4. Chạy Backend server:
   ```bash
   npm start
   ```
   *Server sẽ chạy ở địa chỉ [http://localhost:5000](http://localhost:5000).*

### Bước 3: Cài Đặt và Chạy Frontend
1. Đi tới thư mục `client/`:
   ```bash
   cd ../client
   ```
2. Cài đặt các thư viện:
   ```bash
   npm install
   ```
3. Chạy môi trường phát triển (Dev):
   ```bash
   npm run dev
   ```
   *Frontend sẽ chạy ở địa chỉ [http://localhost:5173](http://localhost:5173).*

---

## Tài Khoản Đăng Nhập Mẫu

Bạn có thể sử dụng các tài khoản có sẵn dưới đây để truy cập vào hệ thống:

| Vai trò | Tên đăng nhập | Mật khẩu | Phân quyền truy cập |
|---|---|---|---|
| **Thủ thư (Admin)** | `admin` | `123456` | Dashboard thống kê, Quản lý sách, Mượn/Trả sách, Quản lý Độc giả |
| **Độc giả (Reader)** | *Bạn có thể tự Đăng ký một tài khoản mới trên giao diện!* | *Tự đặt* | Khám phá thư viện, Xem chi tiết kệ sách, Theo dõi lịch sử mượn trả cá nhân |

## Các Tính Năng Nổi Bật

1. **Transaction & Trigger:** Đăng ký độc giả tự động liên kết tài khoản user thông qua Database Transaction; mượn/trả sách tự cập nhật số lượng tồn kho tự động bằng Database Triggers.
2. **Bảo mật tối đa:** Mã hóa một chiều mật khẩu bằng thuật toán Bcrypt, cấp Token bảo mật JWT để bảo vệ hệ thống API.
3. **Phân quyền Route:** Router của React chặn tuyệt đối các truy cập trái phép của khách chưa đăng nhập hoặc độc giả cố tình vào trang quản trị.
