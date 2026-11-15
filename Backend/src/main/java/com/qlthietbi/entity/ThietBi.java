package com.qlthietbi.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "thiet_bi")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ThietBi {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_thiet_bi")
    private Integer id;

    @Column(name = "ma_thiet_bi", length = 50, unique = true)
    private String maThietBi;

    @Column(name = "ten_thiet_bi", length = 100)
    private String name;

    @Column(name = "loai_thiet_bi", length = 50)
    private String type;

    @Column(name = "tinh_trang", length = 50)
    private String status; // GOOD, BORROWED, MAINTENANCE, BROKEN, LIQUIDATED

    @Column(name = "id_phong")
    private Integer idPhong;

    @Column(name = "ma_phong", length = 50)
    private String maPhong;

    @Builder.Default
    @Column(name = "ngay_nhap")
    private LocalDate ngayNhap = LocalDate.now();

    @Column(name = "ly_do_thanh_ly", columnDefinition = "TEXT")
    private String lyDoThanhLy;

    @Column(name = "ngay_thanh_ly")
    private LocalDate ngayThanhLy;

    @Column(name = "mo_ta", columnDefinition = "TEXT")
    private String moTa;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getMaThietBi() {
        return maThietBi;
    }

    public void setMaThietBi(String maThietBi) {
        this.maThietBi = maThietBi;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getIdPhong() {
        return idPhong;
    }

    public void setIdPhong(Integer idPhong) {
        this.idPhong = idPhong;
    }

    public String getMaPhong() {
        return maPhong;
    }

    public void setMaPhong(String maPhong) {
        this.maPhong = maPhong;
    }

    public LocalDate getNgayNhap() {
        return ngayNhap;
    }

    public void setNgayNhap(LocalDate ngayNhap) {
        this.ngayNhap = ngayNhap;
    }

    public String getLyDoThanhLy() {
        return lyDoThanhLy;
    }

    public void setLyDoThanhLy(String lyDoThanhLy) {
        this.lyDoThanhLy = lyDoThanhLy;
    }

    public LocalDate getNgayThanhLy() {
        return ngayThanhLy;
    }

    public void setNgayThanhLy(LocalDate ngayThanhLy) {
        this.ngayThanhLy = ngayThanhLy;
    }

    public String getMoTa() {
        return moTa;
    }

    public void setMoTa(String moTa) {
        this.moTa = moTa;
    }
}