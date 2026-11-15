package com.qlthietbi.controller;

import com.qlthietbi.entity.LichSuThaoTac;
import com.qlthietbi.entity.MuonTra;
import com.qlthietbi.entity.ThietBi;
import com.qlthietbi.entity.ThongBao;
import com.qlthietbi.repository.LichSuThaoTacRepository;
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
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/borrows")
public class BorrowController {

    private final MuonTraRepository muonTraRepository;
    private final ThietBiRepository thietBiRepository;
    private final LichSuThaoTacRepository lichSuThaoTacRepository;
    private final ThongBaoRepository thongBaoRepository;

    public BorrowController(MuonTraRepository muonTraRepository,
                            ThietBiRepository thietBiRepository,
                            LichSuThaoTacRepository lichSuThaoTacRepository,
                            ThongBaoRepository thongBaoRepository) {
        this.muonTraRepository = muonTraRepository;
        this.thietBiRepository = thietBiRepository;
        this.lichSuThaoTacRepository = lichSuThaoTacRepository;
        this.thongBaoRepository = thongBaoRepository;
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
    public List<MuonTra> getAll() {
        List<MuonTra> list = muonTraRepository.findAllByOrderByIdDesc();
        for (MuonTra mt : list) {
            if (mt.getMaPhieu() == null || mt.getMaPhieu().isEmpty()) {
                mt.setMaPhieu(String.format("PM%03d", mt.getId()));
            }
            if (mt.getSoLuong() == null) {
                mt.setSoLuong(1);
            }
        }
        return list;
    }

    @GetMapping("/{id}")
    public ResponseEntity<MuonTra> getById(@PathVariable Integer id) {
        return muonTraRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> create(@RequestBody MuonTra mt,
                                    @RequestHeader(value = "X-Role", required = false) String role,
                                    @RequestHeader(value = "X-User-Name", required = false) String encodedUserName) {
        if (mt.getNgayMuon() == null) {
            mt.setNgayMuon(LocalDate.now());
        }
        if (mt.getNgayTraDuKien() != null && mt.getNgayTraDuKien().isBefore(mt.getNgayMuon())) {
            return ResponseEntity.badRequest().body("Ngày trả phải sau hoặc bằng ngày mượn");
        }
        if (mt.getSoLuong() == null || mt.getSoLuong() <= 0) {
            mt.setSoLuong(1);
        }

        if (mt.getDeviceId() != null) {
            Optional<ThietBi> optDevice = thietBiRepository.findById(mt.getDeviceId());
            if (optDevice.isEmpty()) {
                return ResponseEntity.badRequest().body("Không tìm thấy thiết bị đã chọn");
            }
            ThietBi device = optDevice.get();
            if (!"GOOD".equalsIgnoreCase(device.getStatus())) {
                return ResponseEntity.badRequest().body("Thiết bị hiện không sẵn sàng để mượn");
            }
            mt.setItemBorrowed(device.getName());
            mt.setMaThietBi(device.getMaThietBi() != null ? device.getMaThietBi() : String.format("TB%03d", device.getId()));
            if (mt.getPhongHoc() == null || mt.getPhongHoc().isEmpty()) {
                mt.setPhongHoc(device.getMaPhong() != null ? device.getMaPhong() : (device.getIdPhong() != null ? "P" + device.getIdPhong() : ""));
            }
        }

        if (mt.getStatus() == null || mt.getStatus().isEmpty()) {
            mt.setStatus("PENDING");
        }
        String userName = decodeUser(encodedUserName);
        if (mt.getNguoiTao() == null || mt.getNguoiTao().isEmpty()) {
            mt.setNguoiTao(userName);
        }

        MuonTra saved = muonTraRepository.save(mt);
        if (saved.getMaPhieu() == null || saved.getMaPhieu().isEmpty()) {
            saved.setMaPhieu(String.format("PM%03d", saved.getId()));
            saved = muonTraRepository.save(saved);
        }

        lichSuThaoTacRepository.save(LichSuThaoTac.builder()
                .nguoiThucHien(userName)
                .vaiTro(role != null ? role : "STAFF")
                .thaoTac("Lập phiếu mượn")
                .doiTuong("Phiếu " + saved.getMaPhieu() + " - " + saved.getItemBorrowed())
                .chiTiet("Người mượn: " + saved.getStudentName() + ", Phòng: " + (saved.getPhongHoc() != null ? saved.getPhongHoc() : "N/A"))
                .thoiGian(LocalDateTime.now())
                .build());

        thongBaoRepository.save(ThongBao.builder()
                .noiDung("Phiếu mượn mới " + saved.getMaPhieu() + ": " + saved.getStudentName() + " đăng ký mượn " + saved.getItemBorrowed())
                .loai("BORROW")
                .tenThietBi(saved.getItemBorrowed())
                .phongHoc(saved.getPhongHoc())
                .referenceId(saved.getId())
                .thoiGian(LocalDateTime.now())
                .daDoc(false)
                .build());

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}/approve")
    @Transactional
    public ResponseEntity<?> approve(@PathVariable Integer id,
                                     @RequestHeader(value = "X-Role", required = false) String role,
                                     @RequestHeader(value = "X-User-Name", required = false) String encodedUserName) {
        Optional<MuonTra> optionalMt = muonTraRepository.findById(id);
        if (optionalMt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        MuonTra mt = optionalMt.get();
        if (!"PENDING".equalsIgnoreCase(mt.getStatus())) {
            return ResponseEntity.badRequest().body("Phiếu mượn đã được xử lý");
        }
        mt.setStatus("APPROVED");
        MuonTra saved = muonTraRepository.save(mt);

        lichSuThaoTacRepository.save(LichSuThaoTac.builder()
                .nguoiThucHien(decodeUser(encodedUserName))
                .vaiTro(role != null ? role : "ADMIN")
                .thaoTac("Duyệt phiếu mượn")
                .doiTuong("Phiếu " + (saved.getMaPhieu() != null ? saved.getMaPhieu() : "PM" + saved.getId()))
                .chiTiet("Duyệt cho " + saved.getStudentName() + " mượn " + saved.getItemBorrowed())
                .thoiGian(LocalDateTime.now())
                .build());

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/reject")
    @Transactional
    public ResponseEntity<?> reject(@PathVariable Integer id,
                                    @RequestBody Map<String, String> body,
                                    @RequestHeader(value = "X-Role", required = false) String role,
                                    @RequestHeader(value = "X-User-Name", required = false) String encodedUserName) {
        Optional<MuonTra> optionalMt = muonTraRepository.findById(id);
        if (optionalMt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        MuonTra mt = optionalMt.get();
        if (!"PENDING".equalsIgnoreCase(mt.getStatus())) {
            return ResponseEntity.badRequest().body("Phiếu mượn đã được xử lý");
        }
        String lyDo = body.getOrDefault("lyDoTuChoi", "").trim();
        if (lyDo.isEmpty()) {
            return ResponseEntity.badRequest().body("Vui lòng nhập lý do từ chối");
        }
        mt.setStatus("REJECTED");
        mt.setLyDoTuChoi(lyDo);
        MuonTra saved = muonTraRepository.save(mt);

        lichSuThaoTacRepository.save(LichSuThaoTac.builder()
                .nguoiThucHien(decodeUser(encodedUserName))
                .vaiTro(role != null ? role : "ADMIN")
                .thaoTac("Từ chối phiếu mượn")
                .doiTuong("Phiếu " + (saved.getMaPhieu() != null ? saved.getMaPhieu() : "PM" + saved.getId()))
                .chiTiet("Lý do từ chối: " + lyDo)
                .thoiGian(LocalDateTime.now())
                .build());

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/handover")
    @Transactional
    public ResponseEntity<?> handover(@PathVariable Integer id,
                                      @RequestBody(required = false) Map<String, String> body,
                                      @RequestHeader(value = "X-Role", required = false) String role,
                                      @RequestHeader(value = "X-User-Name", required = false) String encodedUserName) {
        Optional<MuonTra> optionalMt = muonTraRepository.findById(id);
        if (optionalMt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        MuonTra mt = optionalMt.get();
        if (!"APPROVED".equalsIgnoreCase(mt.getStatus())) {
            return ResponseEntity.badRequest().body("Phiếu mượn chưa được duyệt");
        }
        String tinhTrangGiao = (body != null && body.get("tinhTrangLucGiao") != null && !body.get("tinhTrangLucGiao").trim().isEmpty())
                ? body.get("tinhTrangLucGiao").trim()
                : "Tốt";

        mt.setStatus("BORROWED");
        mt.setTinhTrangLucGiao(tinhTrangGiao);

        if (mt.getDeviceId() != null) {
            thietBiRepository.findById(mt.getDeviceId()).ifPresent(device -> {
                device.setStatus("BORROWED");
                thietBiRepository.save(device);
            });
        }

        MuonTra saved = muonTraRepository.save(mt);

        lichSuThaoTacRepository.save(LichSuThaoTac.builder()
                .nguoiThucHien(decodeUser(encodedUserName))
                .vaiTro(role != null ? role : "ADMIN")
                .thaoTac("Giao thiết bị")
                .doiTuong("Phiếu " + (saved.getMaPhieu() != null ? saved.getMaPhieu() : "PM" + saved.getId()) + " - " + saved.getItemBorrowed())
                .chiTiet("Tình trạng lúc giao: " + tinhTrangGiao)
                .thoiGian(LocalDateTime.now())
                .build());

        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<MuonTra> update(@PathVariable Integer id, @RequestBody MuonTra mtDetails) {
        Optional<MuonTra> optionalMt = muonTraRepository.findById(id);
        if (optionalMt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        MuonTra mt = optionalMt.get();
        if (mtDetails.getStudentId() != null) mt.setStudentId(mtDetails.getStudentId());
        if (mtDetails.getStudentName() != null) mt.setStudentName(mtDetails.getStudentName());
        if (mtDetails.getPhoneNumber() != null) mt.setPhoneNumber(mtDetails.getPhoneNumber());
        if (mtDetails.getItemBorrowed() != null) mt.setItemBorrowed(mtDetails.getItemBorrowed());
        if (mtDetails.getStatus() != null) mt.setStatus(mtDetails.getStatus());
        if (mtDetails.getNgayTra() != null) mt.setNgayTra(mtDetails.getNgayTra());
        if (mtDetails.getTinhTrangKhiTra() != null) mt.setTinhTrangKhiTra(mtDetails.getTinhTrangKhiTra());
        if (mtDetails.getGhiChuTra() != null) mt.setGhiChuTra(mtDetails.getGhiChuTra());

        return ResponseEntity.ok(muonTraRepository.save(mt));
    }

    @PutMapping("/{id}/return")
    @Transactional
    public ResponseEntity<?> markAsReturned(@PathVariable Integer id,
                                            @RequestBody(required = false) Map<String, String> body,
                                            @RequestHeader(value = "X-Role", required = false) String role,
                                            @RequestHeader(value = "X-User-Name", required = false) String encodedUserName) {
        Optional<MuonTra> optionalMt = muonTraRepository.findById(id);
        if (optionalMt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        MuonTra mt = optionalMt.get();
        if (!"BORROWED".equalsIgnoreCase(mt.getStatus())) {
            return ResponseEntity.badRequest().body("Phiếu mượn không ở trạng thái đang mượn");
        }

        String tinhTrangKhiTra = (body != null && body.get("tinhTrangKhiTra") != null) ? body.get("tinhTrangKhiTra").trim() : "Tốt";
        if (tinhTrangKhiTra.isEmpty()) {
            return ResponseEntity.badRequest().body("Vui lòng chọn tình trạng thiết bị");
        }
        String ghiChuTra = (body != null && body.get("ghiChuTra") != null) ? body.get("ghiChuTra").trim() : "";

        mt.setStatus("RETURNED");
        mt.setNgayTra(LocalDate.now());
        mt.setTinhTrangKhiTra(tinhTrangKhiTra);
        mt.setGhiChuTra(ghiChuTra);

        if (mt.getDeviceId() != null) {
            thietBiRepository.findById(mt.getDeviceId()).ifPresent(device -> {
                if ("Hư hỏng".equalsIgnoreCase(tinhTrangKhiTra) || "BROKEN".equalsIgnoreCase(tinhTrangKhiTra)) {
                    device.setStatus("BROKEN");
                } else {
                    device.setStatus("GOOD");
                }
                thietBiRepository.save(device);
            });
        }

        MuonTra saved = muonTraRepository.save(mt);

        lichSuThaoTacRepository.save(LichSuThaoTac.builder()
                .nguoiThucHien(decodeUser(encodedUserName))
                .vaiTro(role != null ? role : "ADMIN")
                .thaoTac("Thu thiết bị & Ghi tình trạng")
                .doiTuong("Phiếu " + (saved.getMaPhieu() != null ? saved.getMaPhieu() : "PM" + saved.getId()) + " - " + saved.getItemBorrowed())
                .chiTiet("Tình trạng sau trả: " + tinhTrangKhiTra + (ghiChuTra.isEmpty() ? "" : " (" + ghiChuTra + ")"))
                .thoiGian(LocalDateTime.now())
                .build());

        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        if (!muonTraRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        muonTraRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
