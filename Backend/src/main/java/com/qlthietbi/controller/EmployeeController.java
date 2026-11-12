package com.qlthietbi.controller;

import com.qlthietbi.dto.EmployeeDto;
import com.qlthietbi.entity.NhanVien;
import com.qlthietbi.entity.TaiKhoan;
import com.qlthietbi.repository.NhanVienRepository;
import com.qlthietbi.repository.TaiKhoanRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/employees")
public class EmployeeController {

    private final NhanVienRepository nhanVienRepository;
    private final TaiKhoanRepository taiKhoanRepository;

    public EmployeeController(NhanVienRepository nhanVienRepository, TaiKhoanRepository taiKhoanRepository) {
        this.nhanVienRepository = nhanVienRepository;
        this.taiKhoanRepository = taiKhoanRepository;
    }

    private boolean isAdmin(String role) {
        return "ADMIN".equalsIgnoreCase(role);
    }

    @GetMapping
    public ResponseEntity<?> getAll(@RequestHeader(value = "X-Role", required = false) String role) {
        if (!isAdmin(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied: only ADMIN can access employee management");
        }

        List<NhanVien> listNv = nhanVienRepository.findAll();
        List<EmployeeDto> listDto = new ArrayList<>();
        for (NhanVien nv : listNv) {
            Optional<TaiKhoan> optionalTk = taiKhoanRepository.findByIdNhanVien(nv.getId());
            EmployeeDto dto = new EmployeeDto();
            dto.setId(nv.getId());
            dto.setHoTen(nv.getHoTen());
            dto.setChucVu(nv.getChucVu());
            dto.setDiaChi(nv.getDiaChi());
            dto.setSoDienThoai(nv.getSoDienThoai());
            if (optionalTk.isPresent()) {
                TaiKhoan tk = optionalTk.get();
                dto.setTenDangNhap(tk.getTenDangNhap());
                dto.setMatKhau(tk.getMatKhau());
                dto.setRole(tk.getRole());
            } else {
                dto.setTenDangNhap("");
                dto.setMatKhau("");
                dto.setRole("STAFF");
            }
            listDto.add(dto);
        }
        return ResponseEntity.ok(listDto);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Integer id, @RequestHeader(value = "X-Role", required = false) String role) {
        if (!isAdmin(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied: only ADMIN can access employee management");
        }

        Optional<NhanVien> optionalNv = nhanVienRepository.findById(id);
        if (optionalNv.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        NhanVien nv = optionalNv.get();
        Optional<TaiKhoan> optionalTk = taiKhoanRepository.findByIdNhanVien(nv.getId());
        EmployeeDto dto = new EmployeeDto();
        dto.setId(nv.getId());
        dto.setHoTen(nv.getHoTen());
        dto.setChucVu(nv.getChucVu());
        dto.setDiaChi(nv.getDiaChi());
        dto.setSoDienThoai(nv.getSoDienThoai());
        if (optionalTk.isPresent()) {
            TaiKhoan tk = optionalTk.get();
            dto.setTenDangNhap(tk.getTenDangNhap());
            dto.setMatKhau(tk.getMatKhau());
            dto.setRole(tk.getRole());
        } else {
            dto.setTenDangNhap("");
            dto.setMatKhau("");
            dto.setRole("STAFF");
        }
        return ResponseEntity.ok(dto);
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> create(@RequestBody EmployeeDto dto, @RequestHeader(value = "X-Role", required = false) String role) {
        if (!isAdmin(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied: only ADMIN can access employee management");
        }

        if (dto.getTenDangNhap() != null && !dto.getTenDangNhap().trim().isEmpty()) {
            Optional<TaiKhoan> existingTk = taiKhoanRepository.findByTenDangNhap(dto.getTenDangNhap().trim());
            if (existingTk.isPresent()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Tên đăng nhập đã tồn tại, vui lòng chọn tên khác!");
            }
        }

        NhanVien nv = new NhanVien();
        nv.setHoTen(dto.getHoTen());
        nv.setChucVu(dto.getChucVu());
        nv.setDiaChi(dto.getDiaChi());
        nv.setSoDienThoai(dto.getSoDienThoai());
        nv = nhanVienRepository.saveAndFlush(nv);

        if (dto.getTenDangNhap() != null && !dto.getTenDangNhap().trim().isEmpty()) {
            TaiKhoan tk = new TaiKhoan();
            tk.setTenDangNhap(dto.getTenDangNhap().trim());
            tk.setMatKhau(dto.getMatKhau() != null && !dto.getMatKhau().trim().isEmpty() ? dto.getMatKhau() : "123456");
            tk.setRole(dto.getRole() != null && !dto.getRole().trim().isEmpty() ? dto.getRole() : "STAFF");
            tk.setIdNhanVien(nv.getId());
            taiKhoanRepository.saveAndFlush(tk);

            dto.setMatKhau(tk.getMatKhau());
            dto.setRole(tk.getRole());
        }

        dto.setId(nv.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody EmployeeDto dto, @RequestHeader(value = "X-Role", required = false) String role) {
        if (!isAdmin(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied: only ADMIN can access employee management");
        }

        Optional<NhanVien> optionalNv = nhanVienRepository.findById(id);
        if (optionalNv.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        NhanVien nv = optionalNv.get();
        nv.setHoTen(dto.getHoTen());
        nv.setChucVu(dto.getChucVu());
        nv.setDiaChi(dto.getDiaChi());
        nv.setSoDienThoai(dto.getSoDienThoai());
        nhanVienRepository.save(nv);

        Optional<TaiKhoan> optionalTk = taiKhoanRepository.findByIdNhanVien(nv.getId());
        if (optionalTk.isEmpty()) {
            if (dto.getTenDangNhap() != null && !dto.getTenDangNhap().trim().isEmpty()) {
                Optional<TaiKhoan> existingTk = taiKhoanRepository.findByTenDangNhap(dto.getTenDangNhap().trim());
                if (existingTk.isPresent()) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Tên đăng nhập đã tồn tại, vui lòng chọn tên khác!");
                }
                TaiKhoan tk = new TaiKhoan();
                tk.setTenDangNhap(dto.getTenDangNhap().trim());
                tk.setMatKhau(dto.getMatKhau() != null && !dto.getMatKhau().trim().isEmpty() ? dto.getMatKhau() : "123456");
                tk.setRole(dto.getRole() != null && !dto.getRole().trim().isEmpty() ? dto.getRole() : "STAFF");
                tk.setIdNhanVien(nv.getId());
                taiKhoanRepository.saveAndFlush(tk);
            }
        } else {
            TaiKhoan tk = optionalTk.get();
            if (dto.getTenDangNhap() != null && !dto.getTenDangNhap().trim().isEmpty()) {
                if (!dto.getTenDangNhap().trim().equals(tk.getTenDangNhap())) {
                    Optional<TaiKhoan> existingTk = taiKhoanRepository.findByTenDangNhap(dto.getTenDangNhap().trim());
                    if (existingTk.isPresent()) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Tên đăng nhập đã tồn tại, vui lòng chọn tên khác!");
                    }
                }
                tk.setTenDangNhap(dto.getTenDangNhap().trim());
                if (dto.getMatKhau() != null && !dto.getMatKhau().trim().isEmpty()) {
                    tk.setMatKhau(dto.getMatKhau());
                }
                if (dto.getRole() != null && !dto.getRole().trim().isEmpty()) {
                    tk.setRole(dto.getRole());
                }
                taiKhoanRepository.saveAndFlush(tk);
            } else {
                taiKhoanRepository.delete(tk);
            }
        }

        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> delete(@PathVariable Integer id, @RequestHeader(value = "X-Role", required = false) String role) {
        if (!isAdmin(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access denied: only ADMIN can access employee management");
        }

        Optional<NhanVien> optionalNv = nhanVienRepository.findById(id);
        if (optionalNv.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        NhanVien nv = optionalNv.get();
        taiKhoanRepository.deleteByIdNhanVien(nv.getId());
        nhanVienRepository.delete(nv);
        return ResponseEntity.noContent().build();
    }
}

