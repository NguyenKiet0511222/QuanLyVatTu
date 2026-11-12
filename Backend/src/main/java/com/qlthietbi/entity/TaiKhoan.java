package com.qlthietbi.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "dang_nhap")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaiKhoan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_dang_nhap")
    private Integer id;

    @Column(name = "ten_dang_nhap", length = 50, unique = true)
    private String tenDangNhap;

    @Column(name = "mat_khau", length = 255)
    private String matKhau;

    @Column(name = "id_nhan_vien")
    private Integer idNhanVien;

    @Column(name = "role", length = 50)
    private String role;
}
