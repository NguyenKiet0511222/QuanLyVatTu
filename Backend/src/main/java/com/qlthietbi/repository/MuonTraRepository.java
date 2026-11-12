package com.qlthietbi.repository;

import com.qlthietbi.entity.MuonTra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MuonTraRepository extends JpaRepository<MuonTra, Integer> {
}

