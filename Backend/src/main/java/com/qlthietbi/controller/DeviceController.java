package com.qlthietbi.controller;

import com.qlthietbi.entity.LichSuThaoTac;
import com.qlthietbi.entity.MuonTra;
import com.qlthietbi.entity.ThietBi;
import com.qlthietbi.entity.ThongBao;
import com.qlthietbi.repository.ChiTietMuonTraRepository;
import com.qlthietbi.repository.LichSuThaoTacRepository;
import com.qlthietbi.repository.MaintenanceRepository;
import com.qlthietbi.repository.MuonTraRepository;
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
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/devices")
public class DeviceController {

    private final ThietBiRepository thietBiRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final ChiTietMuonTraRepository chiTietMuonTraRepository;
    private final MuonTraRepository muonTraRepository;
    private final ThongBaoRepository thongBaoRepository;
    private final LichSuThaoTacRepository lichSuThaoTacRepository;

    public DeviceController(ThietBiRepository thietBiRepository,
                            MaintenanceRepository maintenanceRepository,
                            ChiTietMuonTraRepository chiTietMuonTraRepository,
                            MuonTraRepository muonTraRepository,
                            ThongBaoRepository thongBaoRepository,
                            LichSuThaoTacRepository lichSuThaoTacRepository) {
        this.thietBiRepository = thietBiRepository;
        this.maintenanceRepository = maintenanceRepository;
        this.chiTietMuonTraRepository = chiTietMuonTraRepository;
        this.muonTraRepository = muonTraRepository;
        this.thongBaoRepository = thongBaoRepository;
        this.lichSuThaoTacRepository = lichSuThaoTacRepository;
    }

    private boolean isAdmin(String role) {
        return "ADMIN".equalsIgnoreCase(role);
    }

    private String decodeUser(String encodedUserName) {
        if (encodedUserName == null || encodedUserName.isEmpty()) return "Cán bộ quản lý";
        try {
            return URLDecoder.decode(encodedUserName, StandardCharsets.UTF_8);
        } catch (Exception e) {
            return encodedUserName;
        }
    }

    @GetMapping
    public List<ThietBi> getAll() {
        List<ThietBi> list = thietBiRepository.findAll();
        for (ThietBi tb : list) {
            if (tb.getMaThietBi() == null || tb.getMaThietBi().isEmpty()) {
                tb.setMaThietBi(String.format("TB%03d", tb.getId()));
            }
            if ((tb.getMaPhong() == null || tb.getMaPhong().isEmpty()) && tb.getIdPhong() != null) {
                tb.setMaPhong("P" + tb.getIdPhong());
            }
            if (tb.getNgayNhap() == null) {
                tb.setNgayNhap(LocalDate.now().minusMonths(2));
            }
        }
        return list;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ThietBi> getById(@PathVariable Integer id) {
        return thietBiRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> create(@RequestBody ThietBi tb,
                                    @RequestHeader(value = "X-Role", required = false) String role,
                                    @RequestHeader(value = "X-User-Name", required = false) String encodedUserName) {
        if (tb.getName() == null || tb.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Vui lòng nhập tên thiết bị");
        }
        if (tb.getMaThietBi() != null && !tb.getMaThietBi().trim().isEmpty()) {
            if (thietBiRepository.existsByMaThietBiIgnoreCase(tb.getMaThietBi().trim())) {
                return ResponseEntity.badRequest().body("Mã thiết bị đã tồn tại");
            }
            tb.setMaThietBi(tb.getMaThietBi().trim().toUpperCase());
        }
        if (tb.getNgayNhap() == null) {
            tb.setNgayNhap(LocalDate.now());
        } else if (tb.getNgayNhap().isAfter(LocalDate.now())) {
            return ResponseEntity.badRequest().body("Ngày nhập không được vượt quá ngày hiện tại");
        }
        if (tb.getStatus() == null || tb.getStatus().isEmpty()) {
            tb.setStatus("GOOD");
        }

        ThietBi saved = thietBiRepository.save(tb);
        if (saved.getMaThietBi() == null || saved.getMaThietBi().isEmpty()) {
            saved.setMaThietBi(String.format("TB%03d", saved.getId()));
            saved = thietBiRepository.save(saved);
        }

        String userName = decodeUser(encodedUserName);
        lichSuThaoTacRepository.save(LichSuThaoTac.builder()
                .nguoiThucHien(userName)
                .vaiTro(role != null ? role : "ADMIN")
                .thaoTac("Thêm thiết bị")
                .doiTuong(saved.getName() + " (" + saved.getMaThietBi() + ")")
                .chiTiet("Thêm mới tại phòng " + (saved.getMaPhong() != null ? saved.getMaPhong() : saved.getIdPhong()))
                .thoiGian(LocalDateTime.now())
                .build());

        if (!isAdmin(role)) {
            ThongBao log = ThongBao.builder()
                    .noiDung("Nhân viên " + userName + " vừa THÊM thiết bị mới: " + saved.getName())
                    .loai("SYSTEM")
                    .tenThietBi(saved.getName())
                    .phongHoc(saved.getMaPhong() != null ? saved.getMaPhong() : String.valueOf(saved.getIdPhong()))
                    .referenceId(saved.getId())
                    .thoiGian(LocalDateTime.now())
                    .daDoc(false)
                    .build();
            thongBaoRepository.save(log);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> update(@PathVariable Integer id,
                                    @RequestBody ThietBi tbDetails,
                                    @RequestHeader(value = "X-Role", required = false) String role,
                                    @RequestHeader(value = "X-User-Name", required = false) String encodedUserName) {
        Optional<ThietBi> optionalTb = thietBiRepository.findById(id);
        if (optionalTb.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        List<String> validStatuses = Arrays.asList("GOOD", "BORROWED", "MAINTENANCE", "BROKEN", "LIQUIDATED");
        if (tbDetails.getStatus() != null && !validStatuses.contains(tbDetails.getStatus())) {
            return ResponseEntity.badRequest().body("Trạng thái thiết bị không hợp lệ");
        }

        ThietBi tb = optionalTb.get();
        if (tbDetails.getName() != null && !tbDetails.getName().trim().isEmpty()) {
            tb.setName(tbDetails.getName().trim());
        }
        tb.setType(tbDetails.getType());
        tb.setStatus(tbDetails.getStatus());
        tb.setIdPhong(tbDetails.getIdPhong());
        tb.setMaPhong(tbDetails.getMaPhong());
        if (tbDetails.getNgayNhap() != null) {
            tb.setNgayNhap(tbDetails.getNgayNhap());
        }
        if (tbDetails.getMoTa() != null) {
            tb.setMoTa(tbDetails.getMoTa());
        }

        ThietBi saved = thietBiRepository.save(tb);

        lichSuThaoTacRepository.save(LichSuThaoTac.builder()
                .nguoiThucHien(decodeUser(encodedUserName))
                .vaiTro(role != null ? role : "ADMIN")
                .thaoTac("Cập nhật thiết bị")
                .doiTuong(saved.getName() + " (" + (saved.getMaThietBi() != null ? saved.getMaThietBi() : "TB" + saved.getId()) + ")")
                .chiTiet("Cập nhật trạng thái: " + saved.getStatus() + ", Phòng: " + (saved.getMaPhong() != null ? saved.getMaPhong() : saved.getIdPhong()))
                .thoiGian(LocalDateTime.now())
                .build());

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/liquidate")
    @Transactional
    public ResponseEntity<?> liquidate(@PathVariable Integer id,
                                       @RequestBody Map<String, String> body,
                                       @RequestHeader(value = "X-Role", required = false) String role,
                                       @RequestHeader(value = "X-User-Name", required = false) String encodedUserName) {
        Optional<ThietBi> optionalTb = thietBiRepository.findById(id);
        if (optionalTb.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        ThietBi tb = optionalTb.get();
        String lyDo = body.getOrDefault("lyDoThanhLy", "").trim();
        if (lyDo.isEmpty()) {
            return ResponseEntity.badRequest().body("Vui lòng nhập lý do thanh lý");
        }

        if ("BORROWED".equalsIgnoreCase(tb.getStatus())) {
            return ResponseEntity.badRequest().body("Không thể thanh lý thiết bị đang được mượn");
        }
        List<MuonTra> activeBorrows = muonTraRepository.findByDeviceIdAndStatusIn(tb.getId(), Arrays.asList("BORROWED", "APPROVED"));
        if (!activeBorrows.isEmpty()) {
            return ResponseEntity.badRequest().body("Không thể thanh lý thiết bị đang được mượn");
        }

        tb.setStatus("LIQUIDATED");
        tb.setLyDoThanhLy(lyDo);
        tb.setNgayThanhLy(LocalDate.now());
        ThietBi saved = thietBiRepository.save(tb);

        lichSuThaoTacRepository.save(LichSuThaoTac.builder()
                .nguoiThucHien(decodeUser(encodedUserName))
                .vaiTro(role != null ? role : "ADMIN")
                .thaoTac("Thanh lý thiết bị")
                .doiTuong(saved.getName() + " (" + (saved.getMaThietBi() != null ? saved.getMaThietBi() : "TB" + saved.getId()) + ")")
                .chiTiet("Lý do thanh lý: " + lyDo)
                .thoiGian(LocalDateTime.now())
                .build());

        return ResponseEntity.ok(saved);
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

        maintenanceRepository.deleteByDevice(tb);
        chiTietMuonTraRepository.deleteByThietBi(tb);
        thietBiRepository.delete(tb);

        String userName = decodeUser(encodedUserName);
        lichSuThaoTacRepository.save(LichSuThaoTac.builder()
                .nguoiThucHien(userName)
                .vaiTro(role != null ? role : "ADMIN")
                .thaoTac("Xóa thiết bị")
                .doiTuong(tbName)
                .chiTiet("Xóa thiết bị khỏi hệ thống")
                .thoiGian(LocalDateTime.now())
                .build());

        if (!isAdmin(role)) {
            ThongBao log = ThongBao.builder()
                    .noiDung("Nhân viên " + userName + " vừa XÓA thiết bị: " + tbName)
                    .loai("SYSTEM")
                    .tenThietBi(tbName)
                    .thoiGian(LocalDateTime.now())
                    .daDoc(false)
                    .build();
            thongBaoRepository.save(log);
        }

        return ResponseEntity.noContent().build();
    }
}
