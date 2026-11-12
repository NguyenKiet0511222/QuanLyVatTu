package com.qlthietbi.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "nguoi_muon")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NguoiMuon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_nguoi_muon")
    private Integer id;

    @Column(name = "id_nhan_vien")
    private Integer idNhanVien;

    @Column(name = "ho_ten", length = 100)
    private String name;

    @Column(name = "ngay_sinh")
    private LocalDate ngaySinh;

    @Column(name = "dia_chi", length = 100)
    private String diaChi;

    @Column(name = "so_dien_thoai", length = 15)
    private String soDienThoai;

    @Column(name = "email", length = 50)
    private String email;
}
