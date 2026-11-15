DROP DATABASE IF EXISTS qlvt;
CREATE DATABASE IF NOT EXISTS qlvt CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE qlvt;

CREATE TABLE IF NOT EXISTS nhan_vien (
    id_nhan_vien INT PRIMARY KEY AUTO_INCREMENT,
    ho_ten NVARCHAR(100) NOT NULL,
    email VARCHAR(100),
    chuc_vu NVARCHAR(50),
    dia_chi NVARCHAR(100),
    so_dien_thoai VARCHAR(15)
);

CREATE TABLE IF NOT EXISTS dang_nhap (
    id_dang_nhap INT PRIMARY KEY AUTO_INCREMENT,
    ten_dang_nhap VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100),
    mat_khau VARCHAR(255) NOT NULL,
    id_nhan_vien INT,
    role VARCHAR(20) DEFAULT 'STAFF',
    trang_thai VARCHAR(30) DEFAULT 'ACTIVE',
    reset_token VARCHAR(100),
    reset_token_expiry DATETIME,
    FOREIGN KEY (id_nhan_vien) REFERENCES nhan_vien(id_nhan_vien)
);

CREATE TABLE IF NOT EXISTS phong_hoc (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ma_phong VARCHAR(50) UNIQUE NOT NULL,
    ten_phong NVARCHAR(100) NOT NULL,
    vi_tri NVARCHAR(150),
    suc_chua INT DEFAULT 40,
    trang_thai VARCHAR(50) DEFAULT 'ACTIVE',
    mo_ta TEXT
);

CREATE TABLE IF NOT EXISTS thiet_bi (
    id_thiet_bi INT PRIMARY KEY AUTO_INCREMENT,
    ma_thiet_bi VARCHAR(50) UNIQUE,
    ten_thiet_bi NVARCHAR(100) NOT NULL,
    loai_thiet_bi NVARCHAR(50),
    tinh_trang VARCHAR(50) DEFAULT 'GOOD',
    id_phong INT,
    ma_phong VARCHAR(50),
    ngay_nhap DATE DEFAULT (CURRENT_DATE),
    ly_do_thanh_ly TEXT,
    ngay_thanh_ly DATE,
    mo_ta TEXT
);

CREATE TABLE IF NOT EXISTS muon_tra (
    id_muon_tra INT PRIMARY KEY AUTO_INCREMENT,
    ma_phieu VARCHAR(50),
    student_id VARCHAR(50),
    student_name NVARCHAR(100),
    phone_number VARCHAR(20),
    email VARCHAR(100),
    device_id INT,
    ma_thiet_bi VARCHAR(50),
    item_borrowed TEXT,
    so_luong INT DEFAULT 1,
    phong_hoc VARCHAR(50),
    muc_dich TEXT,
    nguoi_tao NVARCHAR(100),
    status VARCHAR(50) DEFAULT 'PENDING',
    ngay_muon DATE DEFAULT (CURRENT_DATE),
    ngay_tra_du_kien DATE,
    ngay_tra DATE,
    ly_do_tu_choi TEXT,
    tinh_trang_luc_giao NVARCHAR(100),
    tinh_trang_khi_tra NVARCHAR(100),
    ghi_chu_tra TEXT
);

CREATE TABLE IF NOT EXISTS bao_tri (
    id INT PRIMARY KEY AUTO_INCREMENT,
    description TEXT,
    status VARCHAR(50) DEFAULT 'PENDING',
    image_url LONGTEXT,
    phong_hoc VARCHAR(50),
    nguoi_bao_loi NVARCHAR(100),
    ngay_bao_loi DATE DEFAULT (CURRENT_DATE),
    ngay_bao_tri DATE,
    noi_dung_sua_chua TEXT,
    chi_phi DOUBLE,
    ket_qua_nghiem_thu VARCHAR(50),
    ly_do_nghiem_thu TEXT,
    ngay_nghiem_thu DATE,
    id_thiet_bi INT,
    FOREIGN KEY (id_thiet_bi) REFERENCES thiet_bi(id_thiet_bi)
);

CREATE TABLE IF NOT EXISTS lich_su_thao_tac (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nguoi_thuc_hien NVARCHAR(100),
    vai_tro VARCHAR(50),
    thao_tac NVARCHAR(100),
    doi_tuong NVARCHAR(150),
    chi_tiet TEXT,
    thoi_gian DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS thong_bao (
    id INT PRIMARY KEY AUTO_INCREMENT,
    noi_dung NVARCHAR(500),
    loai VARCHAR(50),
    ten_thiet_bi NVARCHAR(100),
    phong_hoc VARCHAR(50),
    reference_id INT,
    thoi_gian DATETIME DEFAULT CURRENT_TIMESTAMP,
    da_doc BOOLEAN DEFAULT FALSE
);

-- Dữ liệu khởi tạo (Seed Data)
INSERT INTO nhan_vien (ho_ten, email, chuc_vu, dia_chi, so_dien_thoai) 
VALUES ('Nguyễn Anh Kiệt', 'admin@uni.edu.vn', 'Cán bộ quản lý thiết bị', 'Cầu Giấy, Hà Nội', '0901234567'),
       ('Trần Văn Đạo', 'daotv@uni.edu.vn', 'Giảng viên CNTT', 'Đống Đa, Hà Nội', '0987654321'),
       ('Lê Hoàng Duy', 'duylh@uni.edu.vn', 'Nhân viên kỹ thuật', 'Thanh Xuân, Hà Nội', '0912345678');

INSERT INTO dang_nhap (ten_dang_nhap, email, mat_khau, id_nhan_vien, role, trang_thai)
VALUES ('admin', 'admin@uni.edu.vn', '123456', 1, 'ADMIN', 'ACTIVE'),
       ('staff1', 'daotv@uni.edu.vn', '123456', 2, 'STAFF', 'ACTIVE'),
       ('staff2', 'duylh@uni.edu.vn', '123456', 3, 'STAFF', 'ACTIVE');

INSERT INTO phong_hoc (ma_phong, ten_phong, vi_tri, suc_chua, trang_thai, mo_ta)
VALUES ('A101', 'Phòng học lý thuyết A101', 'Tầng 1, Tòa A', 60, 'ACTIVE', 'Trang bị máy chiếu, âm thanh tiêu chuẩn'),
       ('A102', 'Phòng học đa năng A102', 'Tầng 1, Tòa A', 80, 'ACTIVE', 'Phòng học chất lượng cao'),
       ('B201', 'Phòng thực hành máy tính B201', 'Tầng 2, Tòa B', 45, 'ACTIVE', 'Phòng Lab CNTT 45 máy'),
       ('B202', 'Phòng hội thảo B202', 'Tầng 2, Tòa B', 120, 'ACTIVE', 'Hội trường nhỏ phục vụ seminar'),
       ('C301', 'Phòng Lab Điện tử C301', 'Tầng 3, Tòa C', 40, 'MAINTENANCE', 'Đang nâng cấp hệ thống điều hòa'),
       ('C302', 'Phòng Studio Đa phương tiện C302', 'Tầng 3, Tòa C', 35, 'ACTIVE', 'Trang bị Camera, Đèn Studio');
