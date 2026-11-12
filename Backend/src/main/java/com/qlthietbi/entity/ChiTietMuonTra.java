package com.qlthietbi.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "chi_tiet_muon_tra")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChiTietMuonTra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_chi_tiet")
    private Integer id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_muon_tra")
    private MuonTra muonTra;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_thiet_bi")
    private ThietBi thietBi;

    @Column(name = "trang_thai", length = 50)
    private String trangThai;
}
