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

    @Column(name = "student_id", length = 50)
    private String studentId;

    @Column(name = "student_name", length = 100)
    private String studentName;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "item_borrowed", columnDefinition = "TEXT")
    private String itemBorrowed;

    @Builder.Default
    @Column(name = "status", length = 50)
    private String status = "BORROWED";

    @Builder.Default
    @Column(name = "ngay_muon")
    private LocalDate ngayMuon = LocalDate.now();

    @Column(name = "ngay_tra")
    private LocalDate ngayTra;
}
