package com.qlthietbi.repository;

import com.qlthietbi.entity.ChiTietMuonTra;
import com.qlthietbi.entity.MuonTra;
import com.qlthietbi.entity.ThietBi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChiTietMuonTraRepository extends JpaRepository<ChiTietMuonTra, Integer> {
    void deleteByThietBi(ThietBi thietBi);
    void deleteByMuonTra(MuonTra muonTra);
    List<ChiTietMuonTra> findByMuonTra(MuonTra muonTra);
}

