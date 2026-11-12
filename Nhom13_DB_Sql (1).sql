DROP DATABASE IF EXISTS qlvt;
CREATE DATABASE IF NOT EXISTS qlvt;
USE qlvt;

CREATE TABLE IF NOT EXISTS nhan_vien (
    id_nhan_vien INT PRIMARY KEY AUTO_INCREMENT,
    ho_ten NVARCHAR(100) NOT NULL,
    chuc_vu NVARCHAR(50),
    dia_chi NVARCHAR(100),
    so_dien_thoai NVARCHAR(15)
);

CREATE TABLE IF NOT EXISTS dang_nhap (
    id_dang_nhap INT PRIMARY KEY AUTO_INCREMENT,
    ten_dang_nhap NVARCHAR(50) UNIQUE NOT NULL,
    mat_khau NVARCHAR(255) NOT NULL,
    id_nhan_vien INT,
    role NVARCHAR(20),
    FOREIGN KEY (id_nhan_vien) REFERENCES nhan_vien(id_nhan_vien)
);

CREATE TABLE IF NOT EXISTS nguoi_muon (
    id_nguoi_muon INT PRIMARY KEY AUTO_INCREMENT,
    id_nhan_vien INT,
    ho_ten NVARCHAR(100) NOT NULL,
    ngay_sinh DATE,
    dia_chi NVARCHAR(100),
    so_dien_thoai NVARCHAR(15),
    email NVARCHAR(50),
    FOREIGN KEY (id_nhan_vien) REFERENCES nhan_vien(id_nhan_vien)
);

CREATE TABLE IF NOT EXISTS thiet_bi (
    id_thiet_bi INT PRIMARY KEY AUTO_INCREMENT,
    ten_thiet_bi NVARCHAR(100) NOT NULL,
    loai_thiet_bi NVARCHAR(50),
    tinh_trang NVARCHAR(50) DEFAULT 'GOOD',
    vi_tri NVARCHAR(255)
);

CREATE TABLE IF NOT EXISTS muon_tra (
    id_muon_tra INT PRIMARY KEY AUTO_INCREMENT,
    id_nguoi_muon INT,
    ngay_muon DATE DEFAULT (CURRENT_DATE),
    ngay_tra DATE,
    FOREIGN KEY (id_nguoi_muon) REFERENCES nguoi_muon(id_nguoi_muon)
);

CREATE TABLE IF NOT EXISTS chi_tiet_muon_tra (
    id_chi_tiet INT PRIMARY KEY AUTO_INCREMENT,
    id_muon_tra INT,
    id_thiet_bi INT,
    trang_thai NVARCHAR(50),
    FOREIGN KEY (id_muon_tra) REFERENCES muon_tra(id_muon_tra),
    FOREIGN KEY (id_thiet_bi) REFERENCES thiet_bi(id_thiet_bi)
);

CREATE TABLE IF NOT EXISTS bao_tri (
    id INT PRIMARY KEY AUTO_INCREMENT,
    description TEXT,
    status NVARCHAR(50) DEFAULT 'IN_PROGRESS',
    id_thiet_bi INT,
    ngay_bat_dau DATE DEFAULT (CURRENT_DATE),
    FOREIGN KEY (id_thiet_bi) REFERENCES thiet_bi(id_thiet_bi)
);

INSERT INTO nhan_vien (ho_ten, chuc_vu, so_dien_thoai) 
VALUES ('Nguyễn Anh Kiệt', 'Quản trị viên', '0123456789');

INSERT INTO nhan_vien (ho_ten, chuc_vu, so_dien_thoai) 
VALUES ('Trần Văn Đạo', 'Nhân viên vận hành', '0987654321');

INSERT INTO nhan_vien (ho_ten, chuc_vu, so_dien_thoai) 
VALUES ('Lê Hoàng Duy', 'Nhân viên kỹ thuật', '0912345678');

INSERT INTO dang_nhap (ten_dang_nhap, mat_khau, id_nhan_vien, role) 
VALUES ('admin', '123456', 1, 'ADMIN');

INSERT INTO dang_nhap (ten_dang_nhap, mat_khau, id_nhan_vien, role) 
VALUES ('staff1', '123456', 2, 'STAFF');

INSERT INTO dang_nhap (ten_dang_nhap, mat_khau, id_nhan_vien, role) 
VALUES ('staff2', '123456', 3, 'STAFF');

UPDATE dang_nhap 
SET role = 'ADMIN' 
WHERE ten_dang_nhap = 'admin';

INSERT INTO nguoi_muon (ho_ten, id_nhan_vien) 
VALUES ('Sinh viên A', 1);

INSERT INTO thiet_bi (ten_thiet_bi, vi_tri) 
VALUES ('Laptop Dell Precision', 'Phòng máy 301');