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

    @Column(name = "noi_dung", length = 255)
    private String noiDung;

    @Column(name = "thoi_gian")
    private LocalDateTime thoiGian;

    @Column(name = "da_doc")
    private Boolean daDoc;
}
