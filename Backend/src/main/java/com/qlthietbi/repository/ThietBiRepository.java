package com.qlthietbi.repository;

import com.qlthietbi.entity.ThietBi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ThietBiRepository extends JpaRepository<ThietBi, Integer> {
    Optional<ThietBi> findByMaThietBi(String maThietBi);
    boolean existsByMaThietBiIgnoreCase(String maThietBi);
}
