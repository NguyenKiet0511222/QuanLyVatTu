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

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "chuc_vu", length = 50)
    private String chucVu;

    @Column(name = "dia_chi", length = 100)
    private String diaChi;

    @Column(name = "so_dien_thoai", length = 15)
    private String soDienThoai;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getHoTen() {
        return hoTen;
    }

    public void setHoTen(String hoTen) {
        this.hoTen = hoTen;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getChucVu() {
        return chucVu;
    }

    public void setChucVu(String chucVu) {
        this.chucVu = chucVu;
    }

    public String getDiaChi() {
        return diaChi;
    }

    public void setDiaChi(String diaChi) {
        this.diaChi = diaChi;
    }

    public String getSoDienThoai() {
        return soDienThoai;
    }

    public void setSoDienThoai(String soDienThoai) {
        this.soDienThoai = soDienThoai;
    }
}