package com.qlthietbi.repository;

import com.qlthietbi.entity.PhongHoc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PhongHocRepository extends JpaRepository<PhongHoc, Integer> {
    Optional<PhongHoc> findByMaPhong(String maPhong);
    boolean existsByMaPhongIgnoreCase(String maPhong);
}
