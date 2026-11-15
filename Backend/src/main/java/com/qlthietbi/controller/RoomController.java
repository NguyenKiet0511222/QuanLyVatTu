package com.qlthietbi.controller;

import com.qlthietbi.entity.LichSuThaoTac;
import com.qlthietbi.entity.PhongHoc;
import com.qlthietbi.repository.LichSuThaoTacRepository;
import com.qlthietbi.repository.PhongHocRepository;
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
@RequestMapping("/rooms")
public class RoomController {

    private final PhongHocRepository phongHocRepository;
    private final LichSuThaoTacRepository lichSuThaoTacRepository;

    public RoomController(PhongHocRepository phongHocRepository, LichSuThaoTacRepository lichSuThaoTacRepository) {
        this.phongHocRepository = phongHocRepository;
        this.lichSuThaoTacRepository = lichSuThaoTacRepository;
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
    public List<PhongHoc> getAll() {
        return phongHocRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PhongHoc> getById(@PathVariable Integer id) {
        return phongHocRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> create(@RequestBody PhongHoc room,
                                    @RequestHeader(value = "X-Role", required = false) String role,
                                    @RequestHeader(value = "X-User-Name", required = false) String encodedUserName) {
        if (room.getMaPhong() == null || room.getMaPhong().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Vui lòng nhập mã phòng");
        }
        if (room.getTenPhong() == null || room.getTenPhong().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Vui lòng nhập tên phòng");
        }
        if (phongHocRepository.existsByMaPhongIgnoreCase(room.getMaPhong().trim())) {
            return ResponseEntity.badRequest().body("Mã phòng đã tồn tại");
        }
        if (room.getSucChua() == null || room.getSucChua() <= 0) {
            return ResponseEntity.badRequest().body("Sức chứa phải là số nguyên dương");
        }
        if (room.getTrangThai() == null || room.getTrangThai().isEmpty()) {
            room.setTrangThai("ACTIVE");
        }

        room.setMaPhong(room.getMaPhong().trim().toUpperCase());
        PhongHoc saved = phongHocRepository.save(room);

        lichSuThaoTacRepository.save(LichSuThaoTac.builder()
                .nguoiThucHien(decodeUser(encodedUserName))
                .vaiTro(role != null ? role : "ADMIN")
                .thaoTac("Thêm phòng học")
                .doiTuong(saved.getTenPhong() + " (" + saved.getMaPhong() + ")")
                .chiTiet("Vị trí: " + saved.getViTri() + ", Sức chứa: " + saved.getSucChua())
                .thoiGian(LocalDateTime.now())
                .build());

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> update(@PathVariable Integer id,
                                    @RequestBody PhongHoc details,
                                    @RequestHeader(value = "X-Role", required = false) String role,
                                    @RequestHeader(value = "X-User-Name", required = false) String encodedUserName) {
        Optional<PhongHoc> optionalRoom = phongHocRepository.findById(id);
        if (optionalRoom.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        if (details.getSucChua() == null || details.getSucChua() <= 0) {
            return ResponseEntity.badRequest().body("Sức chứa phải là số nguyên dương");
        }
        if (details.getTenPhong() == null || details.getTenPhong().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Tên phòng không được để trống");
        }

        PhongHoc room = optionalRoom.get();
        // Theo US6.2: Mã phòng không được chỉnh sửa
        room.setTenPhong(details.getTenPhong().trim());
        room.setViTri(details.getViTri());
        room.setSucChua(details.getSucChua());
        if (details.getTrangThai() != null && !details.getTrangThai().isEmpty()) {
            room.setTrangThai(details.getTrangThai());
        }
        room.setMoTa(details.getMoTa());

        PhongHoc saved = phongHocRepository.save(room);

        lichSuThaoTacRepository.save(LichSuThaoTac.builder()
                .nguoiThucHien(decodeUser(encodedUserName))
                .vaiTro(role != null ? role : "ADMIN")
                .thaoTac("Cập nhật phòng học")
                .doiTuong(saved.getTenPhong() + " (" + saved.getMaPhong() + ")")
                .chiTiet("Cập nhật vị trí: " + saved.getViTri() + ", sức chứa: " + saved.getSucChua() + ", trạng thái: " + saved.getTrangThai())
                .thoiGian(LocalDateTime.now())
                .build());

        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> delete(@PathVariable Integer id,
                                    @RequestHeader(value = "X-Role", required = false) String role,
                                    @RequestHeader(value = "X-User-Name", required = false) String encodedUserName) {
        Optional<PhongHoc> optionalRoom = phongHocRepository.findById(id);
        if (optionalRoom.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        PhongHoc room = optionalRoom.get();
        phongHocRepository.delete(room);

        lichSuThaoTacRepository.save(LichSuThaoTac.builder()
                .nguoiThucHien(decodeUser(encodedUserName))
                .vaiTro(role != null ? role : "ADMIN")
                .thaoTac("Xóa phòng học")
                .doiTuong(room.getTenPhong() + " (" + room.getMaPhong() + ")")
                .chiTiet("Xóa phòng học khỏi danh mục")
                .thoiGian(LocalDateTime.now())
                .build());

        return ResponseEntity.noContent().build();
    }
}
