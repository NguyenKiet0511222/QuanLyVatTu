package com.qlthietbi.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponseData {
    private String tenDangNhap;
    private String hoTen;
    private String role;
    private String matKhau;
    private String token;
}
