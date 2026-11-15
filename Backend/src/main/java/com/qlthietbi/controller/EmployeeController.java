package com.qlthietbi.controller;

import com.qlthietbi.dto.EmployeeDto;
import com.qlthietbi.entity.LichSuThaoTac;
import com.qlthietbi.entity.NhanVien;
import com.qlthietbi.entity.TaiKhoan;
import com.qlthietbi.repository.LichSuThaoTacRepository;
import com.qlthietbi.repository.NhanVienRepository;
import com.qlthietbi.repository.TaiKhoanRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/employees")
public class EmployeeController {

    private final NhanVienRepository nhanVienRepository;
    private final TaiKhoanRepository taiKhoanRepository;
    private final LichSuThaoTacRepository lichSuThaoTacRepository;

    public EmployeeController(NhanVienRepository nhanVienRepository,
                              TaiKhoanRepository taiKhoanRepository,
                              LichSuThaoTacRepository lichSuThaoTacRepository) {
        this.nhanVienRepository = nhanVienRepository;
        this.taiKhoanRepository = taiKhoanRepository;
        this.lichSuThaoTacRepository = lichSuThaoTacRepository;
    }

    private boolean isAdmin(String role) {
        return "ADMIN".equalsIgnoreCase(role);
    }

    private String decodeUser(String encodedUserName) {
        if (encodedUserName == null || encodedUserName.isEmpty()) {
            return "Quản trị viên";
        }
        try {
            return URLDecoder.decode(encodedUserName, StandardCharsets.UTF_8);
        } catch (Exception e) {
            return encodedUserName;
        }
    }

    private void logActivity(String encodedUserName, String role, String thaoTac, String doiTuong, String chiTiet) {
        try {
            LichSuThaoTac log = new LichSuThaoTac();
            log.setNguoiThucHien(decodeUser(encodedUserName));
            log.setVaiTro(role != null ? role : "ADMIN");
            log.setThaoTac(thaoTac);
            log.setDoiTuong(doiTuong);
            log.setChiTiet(chiTiet);
            log.setThoiGian(LocalDateTime.now());
            lichSuThaoTacRepository.save(log);
        } catch (Exception ignored) {
        }
    }

    private EmployeeDto toDto(NhanVien nv, TaiKhoan tk) {
        EmployeeDto dto = new EmployeeDto();
        dto.setId(nv.getId());
        dto.setHoTen(nv.getHoTen());
        dto.setEmail(nv.getEmail() != null ? nv.getEmail() : (tk != null && tk.getEmail() != null ? tk.getEmail() : ""));
        dto.setChucVu(nv.getChucVu());
        dto.setDiaChi(nv.getDiaChi());
        dto.setSoDienThoai(nv.getSoDienThoai());
        if (tk != null) {
            dto.setTenDangNhap(tk.getTenDangNhap());
            dto.setMatKhau(tk.getMatKhau());
            dto.setRole(tk.getRole() != null ? tk.getRole() : "STAFF");
            dto.setTrangThai(tk.getTrangThai() != null ? tk.getTrangThai() : "ACTIVE");
        } else {
            dto.setTenDangNhap("");
            dto.setMatKhau("");
            dto.setRole("STAFF");
            dto.setTrangThai("ACTIVE");
        }
        return dto;
    }

    @GetMapping
    public ResponseEntity<?> getAll(@RequestHeader(value = "X-Role", required = false) String role) {
        List<NhanVien> listNv = nhanVienRepository.findAll();
        List<EmployeeDto> listDto = new ArrayList<>();
        for (NhanVien nv : listNv) {
            TaiKhoan tk = taiKhoanRepository.findByIdNhanVien(nv.getId()).orElse(null);
            listDto.add(toDto(nv, tk));
        }
        return ResponseEntity.ok(listDto);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Integer id) {
        Optional<NhanVien> optionalNv = nhanVienRepository.findById(id);
        if (optionalNv.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        NhanVien nv = optionalNv.get();
        TaiKhoan tk = taiKhoanRepository.findByIdNhanVien(nv.getId()).orElse(null);
        return ResponseEntity.ok(toDto(nv, tk));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> create(@RequestBody EmployeeDto dto,
                                    @RequestHeader(value = "X-Role", required = false) String role,
                                    @RequestHeader(value = "X-User-Name", required = false) String encodedUserName) {
        if (!isAdmin(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Chỉ Quản trị viên (ADMIN) mới có quyền thêm tài khoản người dùng");
        }

        if (dto.getTenDangNhap() != null && !dto.getTenDangNhap().trim().isEmpty()) {
            Optional<TaiKhoan> existingTk = taiKhoanRepository.findByTenDangNhap(dto.getTenDangNhap().trim());
            if (existingTk.isPresent()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Tên đăng nhập đã tồn tại, vui lòng chọn tên khác!");
            }
        }
        if (dto.getEmail() != null && !dto.getEmail().trim().isEmpty()) {
            Optional<TaiKhoan> existingEmail = taiKhoanRepository.findByEmail(dto.getEmail().trim());
            if (existingEmail.isPresent()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Email đã được sử dụng bởi tài khoản khác!");
            }
        }

        NhanVien nv = new NhanVien();
        nv.setHoTen(dto.getHoTen());
        nv.setEmail(dto.getEmail());
        nv.setChucVu(dto.getChucVu());
        nv.setDiaChi(dto.getDiaChi());
        nv.setSoDienThoai(dto.getSoDienThoai());
        nv = nhanVienRepository.saveAndFlush(nv);

        TaiKhoan tk = null;
        if (dto.getTenDangNhap() != null && !dto.getTenDangNhap().trim().isEmpty()) {
            tk = new TaiKhoan();
            tk.setTenDangNhap(dto.getTenDangNhap().trim());
            tk.setEmail(dto.getEmail());
            tk.setMatKhau(dto.getMatKhau() != null && !dto.getMatKhau().trim().isEmpty() ? dto.getMatKhau() : "123456");
            tk.setRole(dto.getRole() != null && !dto.getRole().trim().isEmpty() ? dto.getRole() : "STAFF");
            tk.setTrangThai(dto.getTrangThai() != null && !dto.getTrangThai().trim().isEmpty() ? dto.getTrangThai() : "ACTIVE");
            tk.setIdNhanVien(nv.getId());
            tk = taiKhoanRepository.saveAndFlush(tk);
        }

        logActivity(encodedUserName, role, "Tạo tài khoản người dùng",
                nv.getHoTen() + (tk != null ? " (" + tk.getTenDangNhap() + ")" : ""),
                "Vai trò: " + (tk != null ? tk.getRole() : "STAFF"));

        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(nv, tk));
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> update(@PathVariable Integer id,
                                    @RequestBody EmployeeDto dto,
                                    @RequestHeader(value = "X-Role", required = false) String role,
                                    @RequestHeader(value = "X-User-Name", required = false) String encodedUserName) {
        if (!isAdmin(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Chỉ Quản trị viên (ADMIN) mới có quyền chỉnh sửa tài khoản");
        }

        Optional<NhanVien> optionalNv = nhanVienRepository.findById(id);
        if (optionalNv.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        NhanVien nv = optionalNv.get();
        nv.setHoTen(dto.getHoTen());
        nv.setEmail(dto.getEmail());
        nv.setChucVu(dto.getChucVu());
        nv.setDiaChi(dto.getDiaChi());
        nv.setSoDienThoai(dto.getSoDienThoai());
        nhanVienRepository.save(nv);

        Optional<TaiKhoan> optionalTk = taiKhoanRepository.findByIdNhanVien(nv.getId());
        TaiKhoan tk = null;
        if (optionalTk.isEmpty()) {
            if (dto.getTenDangNhap() != null && !dto.getTenDangNhap().trim().isEmpty()) {
                Optional<TaiKhoan> existingTk = taiKhoanRepository.findByTenDangNhap(dto.getTenDangNhap().trim());
                if (existingTk.isPresent()) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Tên đăng nhập đã tồn tại, vui lòng chọn tên khác!");
                }
                tk = new TaiKhoan();
                tk.setTenDangNhap(dto.getTenDangNhap().trim());
                tk.setEmail(dto.getEmail());
                tk.setMatKhau(dto.getMatKhau() != null && !dto.getMatKhau().trim().isEmpty() ? dto.getMatKhau() : "123456");
                tk.setRole(dto.getRole() != null && !dto.getRole().trim().isEmpty() ? dto.getRole() : "STAFF");
                tk.setTrangThai(dto.getTrangThai() != null && !dto.getTrangThai().trim().isEmpty() ? dto.getTrangThai() : "ACTIVE");
                tk.setIdNhanVien(nv.getId());
                tk = taiKhoanRepository.saveAndFlush(tk);
            }
        } else {
            tk = optionalTk.get();
            if (dto.getTenDangNhap() != null && !dto.getTenDangNhap().trim().isEmpty()) {
                if (!dto.getTenDangNhap().trim().equals(tk.getTenDangNhap())) {
                    Optional<TaiKhoan> existingTk = taiKhoanRepository.findByTenDangNhap(dto.getTenDangNhap().trim());
                    if (existingTk.isPresent()) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Tên đăng nhập đã tồn tại, vui lòng chọn tên khác!");
                    }
                }
                tk.setTenDangNhap(dto.getTenDangNhap().trim());
                tk.setEmail(dto.getEmail());
                if (dto.getMatKhau() != null && !dto.getMatKhau().trim().isEmpty()) {
                    tk.setMatKhau(dto.getMatKhau());
                }
                if (dto.getRole() != null && !dto.getRole().trim().isEmpty()) {
                    tk.setRole(dto.getRole());
                }
                if (dto.getTrangThai() != null && !dto.getTrangThai().trim().isEmpty()) {
                    tk.setTrangThai(dto.getTrangThai());
                }
                tk = taiKhoanRepository.saveAndFlush(tk);
            } else {
                taiKhoanRepository.delete(tk);
                tk = null;
            }
        }

        logActivity(encodedUserName, role, "Cập nhật tài khoản",
                nv.getHoTen(), "Cập nhật thông tin và trạng thái tài khoản");

        return ResponseEntity.ok(toDto(nv, tk));
    }

    @PutMapping("/{id}/toggle-lock")
    @Transactional
    public ResponseEntity<?> toggleLock(@PathVariable Integer id,
                                        @RequestHeader(value = "X-Role", required = false) String role,
                                        @RequestHeader(value = "X-User-Name", required = false) String encodedUserName) {
        if (!isAdmin(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Chỉ ADMIN mới có quyền khóa/mở khóa tài khoản");
        }
        Optional<NhanVien> optionalNv = nhanVienRepository.findById(id);
        if (optionalNv.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        NhanVien nv = optionalNv.get();
        Optional<TaiKhoan> optionalTk = taiKhoanRepository.findByIdNhanVien(nv.getId());
        if (optionalTk.isEmpty()) {
            return ResponseEntity.badRequest().body("Nhân viên này chưa được cấp tài khoản đăng nhập");
        }
        TaiKhoan tk = optionalTk.get();
        String newStatus = "LOCKED".equalsIgnoreCase(tk.getTrangThai()) ? "ACTIVE" : "LOCKED";
        tk.setTrangThai(newStatus);
        tk = taiKhoanRepository.save(tk);

        logActivity(encodedUserName, role,
                "LOCKED".equals(newStatus) ? "Khóa tài khoản" : "Mở khóa tài khoản",
                nv.getHoTen() + " (" + tk.getTenDangNhap() + ")",
                "Trạng thái mới: " + ("LOCKED".equals(newStatus) ? "Bị khóa" : "Hoạt động"));

        return ResponseEntity.ok(toDto(nv, tk));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> delete(@PathVariable Integer id,
                                    @RequestHeader(value = "X-Role", required = false) String role,
                                    @RequestHeader(value = "X-User-Name", required = false) String encodedUserName) {
        if (!isAdmin(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Chỉ ADMIN mới có quyền xóa nhân viên");
        }

        Optional<NhanVien> optionalNv = nhanVienRepository.findById(id);
        if (optionalNv.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        NhanVien nv = optionalNv.get();
        String name = nv.getHoTen();
        taiKhoanRepository.deleteByIdNhanVien(nv.getId());
        nhanVienRepository.delete(nv);

        logActivity(encodedUserName, role, "Xóa tài khoản người dùng",
                name, "Xóa hồ sơ và tài khoản khỏi hệ thống");

        return ResponseEntity.noContent().build();
    }
}
