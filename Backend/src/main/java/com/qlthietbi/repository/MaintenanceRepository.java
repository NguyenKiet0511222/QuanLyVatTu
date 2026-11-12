package com.qlthietbi.repository;

import com.qlthietbi.entity.Maintenance;
import com.qlthietbi.entity.ThietBi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceRepository extends JpaRepository<Maintenance, Integer> {
    void deleteByDevice(ThietBi device);
    List<Maintenance> findByDevice(ThietBi device);
}

