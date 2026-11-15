package com.qlthietbi.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "phong_hoc")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhongHoc {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ma_phong", length = 50, unique = true, nullable = false)
    private String maPhong;

    @Column(name = "ten_phong", length = 100, nullable = false)
    private String tenPhong;

    @Column(name = "vi_tri", length = 150)
    private String viTri;

    @Column(name = "suc_chua")
    private Integer sucChua;

    @Builder.Default
    @Column(name = "trang_thai", length = 50)
    private String trangThai = "ACTIVE"; // ACTIVE, MAINTENANCE, INACTIVE

    @Column(name = "mo_ta", columnDefinition = "TEXT")
    private String moTa;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getMaPhong() {
        return maPhong;
    }

    public void setMaPhong(String maPhong) {
        this.maPhong = maPhong;
    }

    public String getTenPhong() {
        return tenPhong;
    }

    public void setTenPhong(String tenPhong) {
        this.tenPhong = tenPhong;
    }

    public String getViTri() {
        return viTri;
    }

    public void setViTri(String viTri) {
        this.viTri = viTri;
    }

    public Integer getSucChua() {
        return sucChua;
    }

    public void setSucChua(Integer sucChua) {
        this.sucChua = sucChua;
    }

    public String getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(String trangThai) {
        this.trangThai = trangThai;
    }

    public String getMoTa() {
        return moTa;
    }

    public void setMoTa(String moTa) {
        this.moTa = moTa;
    }
}