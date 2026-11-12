package com.qlthietbi.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    @Column(name = "ten_thiet_bi", length = 100)
    private String name; 

    @Column(name = "loai_thiet_bi", length = 50)
    private String type; // Khớp JSON frontend

    @Column(name = "tinh_trang", length = 50)
    private String status; // Khớp JSON frontend

    @Column(name = "id_phong")
    private Integer idPhong;
}
