package com.qlthietbi.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "muon_tra")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MuonTra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_muon_tra")
    private Integer id;

    @Column(name = "ma_phieu", length = 50)
    private String maPhieu;

    @Column(name = "student_id", length = 50)
    private String studentId;

    @Column(name = "student_name", length = 100)
    private String studentName;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "device_id")
    private Integer deviceId;

    @Column(name = "ma_thiet_bi", length = 50)
    private String maThietBi;

    @Column(name = "item_borrowed", columnDefinition = "TEXT")
    private String itemBorrowed;

    @Builder.Default
    @Column(name = "so_luong")
    private Integer soLuong = 1;

    @Column(name = "phong_hoc", length = 50)
    private String phongHoc;

    @Column(name = "muc_dich", columnDefinition = "TEXT")
    private String mucDich;

    @Column(name = "nguoi_tao", length = 100)
    private String nguoiTao;

    @Builder.Default
    @Column(name = "status", length = 50)
    private String status = "PENDING"; // PENDING (Chờ duyệt), APPROVED (Đã duyệt), REJECTED (Đã từ chối), BORROWED (Đang mượn), RETURNED (Đã trả)

    @Builder.Default
    @Column(name = "ngay_muon")
    private LocalDate ngayMuon = LocalDate.now();

    @Column(name = "ngay_tra_du_kien")
    private LocalDate ngayTraDuKien;

    @Column(name = "ngay_tra")
    private LocalDate ngayTra;

    @Column(name = "ly_do_tu_choi", columnDefinition = "TEXT")
    private String lyDoTuChoi;

    @Column(name = "tinh_trang_luc_giao", length = 100)
    private String tinhTrangLucGiao;

    @Column(name = "tinh_trang_khi_tra", length = 100)
    private String tinhTrangKhiTra; // Tốt, Hao mòn nhẹ, Hư hỏng

    @Column(name = "ghi_chu_tra", columnDefinition = "TEXT")
    private String ghiChuTra;
}
