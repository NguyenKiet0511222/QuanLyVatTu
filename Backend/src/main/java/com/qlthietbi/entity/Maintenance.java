package com.qlthietbi.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "bao_tri")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Maintenance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Builder.Default
    @Column(name = "status", length = 50)
    private String status = "PENDING"; // PENDING (Chờ xử lý), IN_PROGRESS (Đang bảo trì), REPAIRED (Đã sửa xong), DONE (Đã nghiệm thu)

    @Column(name = "image_url", columnDefinition = "LONGTEXT")
    private String imageUrl;

    @Column(name = "phong_hoc", length = 50)
    private String phongHoc;

    @Column(name = "nguoi_bao_loi", length = 100)
    private String nguoiBaoLoi;

    @Builder.Default
    @Column(name = "ngay_bao_loi")
    private LocalDate ngayBaoLoi = LocalDate.now();

    @Column(name = "ngay_bao_tri")
    private LocalDate ngayBaoTri;

    @Column(name = "noi_dung_sua_chua", columnDefinition = "TEXT")
    private String noiDungSuaChua;

    @Column(name = "chi_phi")
    private Double chiPhi;

    @Column(name = "ket_qua_nghiem_thu", length = 50)
    private String ketQuaNghiemThu; // DAT, KHONG_DAT

    @Column(name = "ly_do_nghiem_thu", columnDefinition = "TEXT")
    private String lyDoNghiemThu;

    @Column(name = "ngay_nghiem_thu")
    private LocalDate ngayNghiemThu;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_thiet_bi")
    private ThietBi device;
}
