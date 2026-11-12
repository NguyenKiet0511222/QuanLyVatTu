package com.qlthietbi.controller;

import com.qlthietbi.entity.Maintenance;
import com.qlthietbi.entity.ThietBi;
import com.qlthietbi.repository.MaintenanceRepository;
import com.qlthietbi.repository.ThietBiRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/maintenance")
public class MaintenanceController {

    private final MaintenanceRepository maintenanceRepository;
    private final ThietBiRepository thietBiRepository;

    public MaintenanceController(MaintenanceRepository maintenanceRepository, ThietBiRepository thietBiRepository) {
        this.maintenanceRepository = maintenanceRepository;
        this.thietBiRepository = thietBiRepository;
    }

    @GetMapping
    public List<Maintenance> getAll() {
        return maintenanceRepository.findAll();
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> create(@RequestBody Maintenance m) {
        if (m.getDevice() != null && m.getDevice().getId() != null) {
            Optional<ThietBi> managedDevice = thietBiRepository.findById(m.getDevice().getId());
            if (managedDevice.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Không tìm thấy thiết bị với ID này");
            }
            ThietBi device = managedDevice.get();
            m.setDevice(device);
            // Tự động cập nhật thiết bị sang trạng thái bảo trì khi báo cáo lỗi
            device.setStatus("MAINTENANCE");
            thietBiRepository.save(device);
        }
        Maintenance saved = maintenanceRepository.save(m);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}/status")
    @Transactional
    public ResponseEntity<Maintenance> updateStatus(@PathVariable Integer id, @RequestParam("status") String status) {
        Optional<Maintenance> optionalM = maintenanceRepository.findById(id);
        if (optionalM.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Maintenance m = optionalM.get();
        m.setStatus(status);

        // Tự động cập nhật trạng thái thiết bị về hoạt động tốt nếu bảo trì hoàn tất
        if ("DONE".equalsIgnoreCase(status) && m.getDevice() != null) {
            m.getDevice().setStatus("GOOD");
            thietBiRepository.save(m.getDevice());
        } else if ("PENDING".equalsIgnoreCase(status) && m.getDevice() != null) {
            m.getDevice().setStatus("MAINTENANCE");
            thietBiRepository.save(m.getDevice());
        }

        return ResponseEntity.ok(maintenanceRepository.save(m));
    }
}

