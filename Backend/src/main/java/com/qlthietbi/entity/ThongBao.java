package com.qlthietbi.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "thong_bao")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ThongBao {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "noi_dung", length = 500)
    private String noiDung;

    @Column(name = "loai", length = 50)
    private String loai; // INCIDENT, BORROW, SYSTEM

    @Column(name = "ten_thiet_bi", length = 100)
    private String tenThietBi;

    @Column(name = "phong_hoc", length = 50)
    private String phongHoc;

    @Column(name = "reference_id")
    private Integer referenceId;

    @Column(name = "thoi_gian")
    private LocalDateTime thoiGian;

    @Column(name = "da_doc")
    private Boolean daDoc;
}
