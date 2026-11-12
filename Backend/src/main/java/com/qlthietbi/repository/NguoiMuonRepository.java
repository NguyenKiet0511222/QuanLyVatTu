package com.qlthietbi.repository;

import com.qlthietbi.entity.NguoiMuon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NguoiMuonRepository extends JpaRepository<NguoiMuon, Integer> {
}

