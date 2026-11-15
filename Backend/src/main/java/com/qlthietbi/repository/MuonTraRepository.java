package com.qlthietbi.repository;

import com.qlthietbi.entity.MuonTra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MuonTraRepository extends JpaRepository<MuonTra, Integer> {
    List<MuonTra> findAllByOrderByIdDesc();
    List<MuonTra> findByDeviceIdAndStatusIn(Integer deviceId, List<String> statuses);
}
