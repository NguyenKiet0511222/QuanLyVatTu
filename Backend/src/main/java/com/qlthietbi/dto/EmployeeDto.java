package com.qlthietbi.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDto {
    private Integer id;
    private String hoTen;
    private String chucVu;
    private String diaChi;
    private String soDienThoai;
    private String tenDangNhap;
    private String matKhau;
    private String role;
}
