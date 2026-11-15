package com.qlthietbi.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "lich_su_thao_tac")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LichSuThaoTac {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "nguoi_thuc_hien", length = 100)
    private String nguoiThucHien;

    @Column(name = "vai_tro", length = 50)
    private String vaiTro;

    @Column(name = "thao_tac", length = 100)
    private String thaoTac;

    @Column(name = "doi_tuong", length = 150)
    private String doiTuong;

    @Column(name = "chi_tiet", columnDefinition = "TEXT")
    private String chiTiet;

    @Builder.Default
    @Column(name = "thoi_gian")
    private LocalDateTime thoiGian = LocalDateTime.now();

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getNguoiThucHien() {
        return nguoiThucHien;
    }

    public void setNguoiThucHien(String nguoiThucHien) {
        this.nguoiThucHien = nguoiThucHien;
    }

    public String getVaiTro() {
        return vaiTro;
    }

    public void setVaiTro(String vaiTro) {
        this.vaiTro = vaiTro;
    }

    public String getThaoTac() {
        return thaoTac;
    }

    public void setThaoTac(String thaoTac) {
        this.thaoTac = thaoTac;
    }

    public String getDoiTuong() {
        return doiTuong;
    }

    public void setDoiTuong(String doiTuong) {
        this.doiTuong = doiTuong;
    }

    public String getChiTiet() {
        return chiTiet;
    }

    public void setChiTiet(String chiTiet) {
        this.chiTiet = chiTiet;
    }

    public LocalDateTime getThoiGian() {
        return thoiGian;
    }

    public void setThoiGian(LocalDateTime thoiGian) {
        this.thoiGian = thoiGian;
    }
}