package com.qlthietbi.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "nhan_vien")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NhanVien {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_nhan_vien")
    private Integer id;

    @Column(name = "ho_ten", length = 100, nullable = false)
    private String hoTen;

    @Column(name = "chuc_vu", length = 50)
    private String chucVu;

    @Column(name = "dia_chi", length = 100)
    private String diaChi;

    @Column(name = "so_dien_thoai", length = 15)
    private String soDienThoai;
}
