package com.qlthietbi.controller;

import com.qlthietbi.entity.ThietBi;
import com.qlthietbi.entity.ThongBao;
import com.qlthietbi.repository.ChiTietMuonTraRepository;
import com.qlthietbi.repository.MaintenanceRepository;
import com.qlthietbi.repository.ThietBiRepository;
import com.qlthietbi.repository.ThongBaoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/devices")
public class DeviceController {

    private final ThietBiRepository thietBiRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final ChiTietMuonTraRepository chiTietMuonTraRepository;
    private final ThongBaoRepository thongBaoRepository;

    public DeviceController(ThietBiRepository thietBiRepository,
                            MaintenanceRepository maintenanceRepository,
                            ChiTietMuonTraRepository chiTietMuonTraRepository,
                            ThongBaoRepository thongBaoRepository) {
        this.thietBiRepository = thietBiRepository;
        this.maintenanceRepository = maintenanceRepository;
        this.chiTietMuonTraRepository = chiTietMuonTraRepository;
        this.thongBaoRepository = thongBaoRepository;
    }

    private boolean isAdmin(String role) {
        return "ADMIN".equalsIgnoreCase(role);
    }

    @GetMapping
    public List<ThietBi> getAll() {
        return thietBiRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ThietBi> getById(@PathVariable Integer id) {
        return thietBiRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Transactional
    public ResponseEntity<ThietBi> create(@RequestBody ThietBi tb,
                                          @RequestHeader(value = "X-Role", required = false) String role,
                                          @RequestHeader(value = "X-User-Name", required = false) String encodedUserName) {
        ThietBi saved = thietBiRepository.save(tb);

        if (!isAdmin(role)) {
            String userName = "Không rõ";
            if (encodedUserName != null) {
                try {
                    userName = URLDecoder.decode(encodedUserName, StandardCharsets.UTF_8);
                } catch (Exception ignored) {}
            }

            ThongBao log = new ThongBao();
            log.setNoiDung("Nhân viên " + userName + " vừa THÊM thiết bị mới: " + saved.getName());
            log.setThoiGian(LocalDateTime.now());
            log.setDaDoc(false);
            thongBaoRepository.save(log);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<ThietBi> update(@PathVariable Integer id, @RequestBody ThietBi tbDetails) {
        Optional<ThietBi> optionalTb = thietBiRepository.findById(id);
        if (optionalTb.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        ThietBi tb = optionalTb.get();
        tb.setName(tbDetails.getName());
        tb.setType(tbDetails.getType());
        tb.setStatus(tbDetails.getStatus());
        tb.setIdPhong(tbDetails.getIdPhong());

        return ResponseEntity.ok(thietBiRepository.save(tb));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> delete(@PathVariable Integer id,
                                       @RequestHeader(value = "X-Role", required = false) String role,
                                       @RequestHeader(value = "X-User-Name", required = false) String encodedUserName) {
        Optional<ThietBi> optionalTb = thietBiRepository.findById(id);
        if (optionalTb.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        ThietBi tb = optionalTb.get();
        String tbName = tb.getName();

        // Dọn dẹp bản ghi liên quan trước để tránh lỗi foreign key constraint
        maintenanceRepository.deleteByDevice(tb);
        chiTietMuonTraRepository.deleteByThietBi(tb);
        thietBiRepository.delete(tb);

        if (!isAdmin(role)) {
            String userName = "Không rõ";
            if (encodedUserName != null) {
                try {
                    userName = URLDecoder.decode(encodedUserName, StandardCharsets.UTF_8);
                } catch (Exception ignored) {}
            }

            ThongBao log = new ThongBao();
            log.setNoiDung("Nhân viên " + userName + " vừa XÓA thiết bị: " + tbName);
            log.setThoiGian(LocalDateTime.now());
            log.setDaDoc(false);
            thongBaoRepository.save(log);
        }

        return ResponseEntity.noContent().build();
    }
}

