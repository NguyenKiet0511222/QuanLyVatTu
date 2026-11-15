package com.qlthietbi.controller;

import com.qlthietbi.entity.LichSuThaoTac;
import com.qlthietbi.entity.Maintenance;
import com.qlthietbi.entity.ThietBi;
import com.qlthietbi.entity.ThongBao;
import com.qlthietbi.repository.LichSuThaoTacRepository;
import com.qlthietbi.repository.MaintenanceRepository;
import com.qlthietbi.repository.ThietBiRepository;
import com.qlthietbi.repository.ThongBaoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/maintenance")
public class MaintenanceController {

    private final MaintenanceRepository maintenanceRepository;
    private final ThietBiRepository thietBiRepository;
    private final ThongBaoRepository thongBaoRepository;
    private final LichSuThaoTacRepository lichSuThaoTacRepository;

    public MaintenanceController(MaintenanceRepository maintenanceRepository,
                                 ThietBiRepository thietBiRepository,
                                 ThongBaoRepository thongBaoRepository,
                                 LichSuThaoTacRepository lichSuThaoTacRepository) {
        this.maintenanceRepository = maintenanceRepository;
        this.thietBiRepository = thietBiRepository;
        this.thongBaoRepository = thongBaoRepository;
        this.lichSuThaoTacRepository = lichSuThaoTacRepository;
    }

    private String decodeUser(String encodedUserName) {
        if (encodedUserName == null || encodedUserName.isEmpty()) return "Người dùng";
        try {
            return URLDecoder.decode(encodedUserName, StandardCharsets.UTF_8);
        } catch (Exception e) {
            return encodedUserName;
        }
    }

    @GetMapping
    public List<Maintenance> getAll() {
        return maintenanceRepository.findAll();
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> create(@RequestBody Maintenance m,
                                    @RequestHeader(value = "X-Role", required = false) String role,
                                    @RequestHeader(value = "X-User-Name", required = false) String encodedUserName) {
        if (m.getDescription() == null || m.getDescription().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Vui lòng nhập mô tả sự cố");
        }
        String userName = decodeUser(encodedUserName);
        if (m.getNguoiBaoLoi() == null || m.getNguoiBaoLoi().isEmpty()) {
            m.setNguoiBaoLoi(userName);
        }
        if (m.getNgayBaoLoi() == null) {
            m.setNgayBaoLoi(LocalDate.now());
        }
        if (m.getStatus() == null || m.getStatus().isEmpty()) {
            m.setStatus("PENDING");
        }

        String deviceName = "Thiết bị";
        if (m.getDevice() != null && m.getDevice().getId() != null) {
            Optional<ThietBi> managedDevice = thietBiRepository.findById(m.getDevice().getId());
            if (managedDevice.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Không tìm thấy thiết bị với ID này");
            }
            ThietBi device = managedDevice.get();
            deviceName = device.getName();
            if (m.getPhongHoc() == null || m.getPhongHoc().isEmpty()) {
                m.setPhongHoc(device.getMaPhong() != null ? device.getMaPhong() : (device.getIdPhong() != null ? "P" + device.getIdPhong() : ""));
            }
            m.setDevice(device);
            device.setStatus("MAINTENANCE");
            thietBiRepository.save(device);
        }

        Maintenance saved = maintenanceRepository.save(m);

        // US10.2: Khi có báo lỗi mới, hiển thị thông báo "Có sự cố mới: <tên thiết bị>" cho cán bộ quản lý
        thongBaoRepository.save(ThongBao.builder()
                .noiDung("Có sự cố mới: " + deviceName + (saved.getPhongHoc() != null ? " (Phòng " + saved.getPhongHoc() + ")" : "") + " - " + saved.getDescription())
                .loai("INCIDENT")
                .tenThietBi(deviceName)
                .phongHoc(saved.getPhongHoc())
                .referenceId(saved.getId())
                .thoiGian(LocalDateTime.now())
                .daDoc(false)
                .build());

        lichSuThaoTacRepository.save(LichSuThaoTac.builder()
                .nguoiThucHien(userName)
                .vaiTro(role != null ? role : "STAFF")
                .thaoTac("Báo lỗi thiết bị")
                .doiTuong(deviceName + (saved.getPhongHoc() != null ? " - Phòng " + saved.getPhongHoc() : ""))
                .chiTiet("Mô tả sự cố: " + saved.getDescription())
                .thoiGian(LocalDateTime.now())
                .build());

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // US10.3: Cập nhật lịch sử bảo trì (Ngày bảo trì, Nội dung sửa chữa, Trạng thái)
    @PutMapping("/{id}/progress")
    @Transactional
    public ResponseEntity<?> updateProgress(@PathVariable Integer id,
                                            @RequestBody Map<String, Object> body,
                                            @RequestHeader(value = "X-Role", required = false) String role,
                                            @RequestHeader(value = "X-User-Name", required = false) String encodedUserName) {
        Optional<Maintenance> optionalM = maintenanceRepository.findById(id);
        if (optionalM.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        String noiDungSuaChua = body.get("noiDungSuaChua") != null ? String.valueOf(body.get("noiDungSuaChua")).trim() : "";
        if (noiDungSuaChua.isEmpty()) {
            return ResponseEntity.badRequest().body("Vui lòng nhập nội dung sửa chữa");
        }

        Maintenance m = optionalM.get();
        m.setNoiDungSuaChua(noiDungSuaChua);
        if (body.get("ngayBaoTri") != null && !String.valueOf(body.get("ngayBaoTri")).isEmpty()) {
            try {
                m.setNgayBaoTri(LocalDate.parse(String.valueOf(body.get("ngayBaoTri"))));
            } catch (Exception ignored) {
                m.setNgayBaoTri(LocalDate.now());
            }
        } else {
            m.setNgayBaoTri(LocalDate.now());
        }

        if (body.get("chiPhi") != null && !String.valueOf(body.get("chiPhi")).isEmpty()) {
            try {
                m.setChiPhi(Double.parseDouble(String.valueOf(body.get("chiPhi"))));
            } catch (Exception ignored) {}
        }

        String status = body.get("status") != null ? String.valueOf(body.get("status")).trim() : "IN_PROGRESS";
        m.setStatus(status);

        if (m.getDevice() != null) {
            m.getDevice().setStatus("MAINTENANCE");
            thietBiRepository.save(m.getDevice());
        }

        Maintenance saved = maintenanceRepository.save(m);

        lichSuThaoTacRepository.save(LichSuThaoTac.builder()
                .nguoiThucHien(decodeUser(encodedUserName))
                .vaiTro(role != null ? role : "ADMIN")
                .thaoTac("Cập nhật lịch sử bảo trì")
                .doiTuong(m.getDevice() != null ? m.getDevice().getName() : "Phiếu bảo trì #" + m.getId())
                .chiTiet("Nội dung sửa chữa: " + noiDungSuaChua + " (Trạng thái: " + status + ")")
                .thoiGian(LocalDateTime.now())
                .build());

        return ResponseEntity.ok(saved);
    }

    // US10.4: Nghiệm thu thiết bị sau bảo trì (Đạt / Không đạt + Lý do)
    @PutMapping("/{id}/inspect")
    @Transactional
    public ResponseEntity<?> inspectDevice(@PathVariable Integer id,
                                           @RequestBody Map<String, String> body,
                                           @RequestHeader(value = "X-Role", required = false) String role,
                                           @RequestHeader(value = "X-User-Name", required = false) String encodedUserName) {
        Optional<Maintenance> optionalM = maintenanceRepository.findById(id);
        if (optionalM.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Maintenance m = optionalM.get();
        if (!"REPAIRED".equalsIgnoreCase(m.getStatus())) {
            return ResponseEntity.badRequest().body("Thiết bị chưa sửa xong, không thể nghiệm thu!");
        }

        String ketQua = body.getOrDefault("ketQuaNghiemThu", "DAT").trim();
        String lyDo = body.getOrDefault("lyDoNghiemThu", "").trim();

        if ("KHONG_DAT".equalsIgnoreCase(ketQua) && lyDo.isEmpty()) {
            return ResponseEntity.badRequest().body("Khi chọn Không đạt bắt buộc phải nhập lý do!");
        }

        m.setKetQuaNghiemThu(ketQua);
        m.setLyDoNghiemThu(lyDo);
        m.setNgayNghiemThu(LocalDate.now());

        if ("DAT".equalsIgnoreCase(ketQua)) {
            m.setStatus("DONE");
            if (m.getDevice() != null) {
                m.getDevice().setStatus("GOOD");
                thietBiRepository.save(m.getDevice());
            }
        } else {
            m.setStatus("IN_PROGRESS");
            if (m.getDevice() != null) {
                m.getDevice().setStatus("MAINTENANCE");
                thietBiRepository.save(m.getDevice());
            }
        }

        Maintenance saved = maintenanceRepository.save(m);

        lichSuThaoTacRepository.save(LichSuThaoTac.builder()
                .nguoiThucHien(decodeUser(encodedUserName))
                .vaiTro(role != null ? role : "ADMIN")
                .thaoTac("Nghiệm thu bảo trì")
                .doiTuong(m.getDevice() != null ? m.getDevice().getName() : "Phiếu bảo trì #" + m.getId())
                .chiTiet("Kết quả: " + ("DAT".equalsIgnoreCase(ketQua) ? "Đạt yêu cầu" : "Không đạt - " + lyDo))
                .thoiGian(LocalDateTime.now())
                .build());

        return ResponseEntity.ok(saved);
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

        if ("DONE".equalsIgnoreCase(status) && m.getDevice() != null) {
            m.getDevice().setStatus("GOOD");
            thietBiRepository.save(m.getDevice());
        } else if (("PENDING".equalsIgnoreCase(status) || "IN_PROGRESS".equalsIgnoreCase(status)) && m.getDevice() != null) {
            m.getDevice().setStatus("MAINTENANCE");
            thietBiRepository.save(m.getDevice());
        }

        return ResponseEntity.ok(maintenanceRepository.save(m));
    }
}
