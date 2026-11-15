package com.qlthietbi.repository;

import com.qlthietbi.entity.LichSuThaoTac;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LichSuThaoTacRepository extends JpaRepository<LichSuThaoTac, Integer> {
    List<LichSuThaoTac> findAllByOrderByThoiGianDesc();
}
