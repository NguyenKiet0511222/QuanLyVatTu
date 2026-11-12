package com.qlthietbi.controller;

import com.qlthietbi.dto.LoginRequest;
import com.qlthietbi.dto.LoginResponse;
import com.qlthietbi.dto.LoginResponseData;
import com.qlthietbi.entity.NhanVien;
import com.qlthietbi.entity.TaiKhoan;
import com.qlthietbi.repository.NhanVienRepository;
import com.qlthietbi.repository.TaiKhoanRepository;
import com.qlthietbi.util.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final TaiKhoanRepository taiKhoanRepository;
    private final NhanVienRepository nhanVienRepository;

    public AuthController(TaiKhoanRepository taiKhoanRepository, NhanVienRepository nhanVienRepository) {
        this.taiKhoanRepository = taiKhoanRepository;
        this.nhanVienRepository = nhanVienRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        Optional<TaiKhoan> optionalTaiKhoan = taiKhoanRepository.findByTenDangNhap(request.getTenDangNhap());

        if (optionalTaiKhoan.isEmpty() || !optionalTaiKhoan.get().getMatKhau().equals(request.getMatKhau())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new LoginResponse(false, "Sai tên đăng nhập hoặc mật khẩu!", null));
        }

        TaiKhoan taiKhoan = optionalTaiKhoan.get();

        // Lấy thông tin họ tên từ bảng NhanVien
        String hoTen = "";
        if (taiKhoan.getIdNhanVien() != null) {
            Optional<NhanVien> optionalNv = nhanVienRepository.findById(taiKhoan.getIdNhanVien());
            if (optionalNv.isPresent()) {
                hoTen = optionalNv.get().getHoTen();
            }
        }

        // Lấy role từ tài khoản (mặc định là STAFF nếu null)
        String role = taiKhoan.getRole();
        if (role == null || role.isEmpty()) {
            role = "STAFF";
        }

        String token = JwtUtil.generateToken(taiKhoan.getTenDangNhap(), role);

        LoginResponseData responseData = new LoginResponseData(
                taiKhoan.getTenDangNhap(),
                hoTen,
                role,
                taiKhoan.getMatKhau(),
                token
        );

        return ResponseEntity.ok(new LoginResponse(true, "Đăng nhập thành công", responseData));
    }
}

