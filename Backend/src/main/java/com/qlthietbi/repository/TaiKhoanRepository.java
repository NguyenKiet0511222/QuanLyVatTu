package com.qlthietbi.repository;

import com.qlthietbi.entity.TaiKhoan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface TaiKhoanRepository extends JpaRepository<TaiKhoan, Integer> {
    Optional<TaiKhoan> findByTenDangNhap(String tenDangNhap);
    Optional<TaiKhoan> findByEmail(String email);
    Optional<TaiKhoan> findByResetToken(String resetToken);
    Optional<TaiKhoan> findByIdNhanVien(Integer idNhanVien);

    @Modifying
    @Transactional
    void deleteByIdNhanVien(Integer idNhanVien);
}
