package com.qlthietbi.repository;

import com.qlthietbi.entity.TaiKhoan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TaiKhoanRepository extends JpaRepository<TaiKhoan, Integer> {
    Optional<TaiKhoan> findByTenDangNhap(String tenDangNhap);
    Optional<TaiKhoan> findByIdNhanVien(Integer idNhanVien);
    void deleteByIdNhanVien(Integer idNhanVien);
}

