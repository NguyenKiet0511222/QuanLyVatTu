package com.qlthietbi.controller;

import com.qlthietbi.dto.LoginRequest;
import com.qlthietbi.dto.LoginResponse;
import com.qlthietbi.dto.LoginResponseData;
import com.qlthietbi.entity.LichSuThaoTac;
import com.qlthietbi.entity.NhanVien;
import com.qlthietbi.entity.TaiKhoan;
import com.qlthietbi.repository.LichSuThaoTacRepository;
import com.qlthietbi.repository.NhanVienRepository;
import com.qlthietbi.repository.TaiKhoanRepository;
import com.qlthietbi.util.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final TaiKhoanRepository taiKhoanRepository;
    private final NhanVienRepository nhanVienRepository;
    private final LichSuThaoTacRepository lichSuThaoTacRepository;

    public AuthController(TaiKhoanRepository taiKhoanRepository,
                          NhanVienRepository nhanVienRepository,
                          LichSuThaoTacRepository lichSuThaoTacRepository) {
        this.taiKhoanRepository = taiKhoanRepository;
        this.nhanVienRepository = nhanVienRepository;
        this.lichSuThaoTacRepository = lichSuThaoTacRepository;
    }

    private LoginResponseData buildResponseData(TaiKhoan taiKhoan, NhanVien nv, String token) {
        String role = (taiKhoan.getRole() == null || taiKhoan.getRole().isEmpty()) ? "STAFF" : taiKhoan.getRole();
        String trangThai = (taiKhoan.getTrangThai() == null || taiKhoan.getTrangThai().isEmpty()) ? "ACTIVE" : taiKhoan.getTrangThai();
        return LoginResponseData.builder()
                .id(taiKhoan.getId())
                .idNhanVien(taiKhoan.getIdNhanVien())
                .tenDangNhap(taiKhoan.getTenDangNhap())
                .hoTen(nv != null ? nv.getHoTen() : taiKhoan.getTenDangNhap())
                .email(taiKhoan.getEmail() != null ? taiKhoan.getEmail() : (nv != null ? nv.getEmail() : ""))
                .soDienThoai(nv != null ? nv.getSoDienThoai() : "")
                .diaChi(nv != null ? nv.getDiaChi() : "")
                .chucVu(nv != null ? nv.getChucVu() : (role.equals("ADMIN") ? "Cán bộ quản lý thiết bị" : "Giảng viên / Người dùng"))
                .role(role)
                .matKhau(taiKhoan.getMatKhau())
                .trangThai(trangThai)
                .token(token)
                .build();
    }

    @PostMapping("/login")
    @Transactional
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        String identifier = request.getTenDangNhap() != null ? request.getTenDangNhap().trim() : "";
        String password = request.getMatKhau() != null ? request.getMatKhau() : "";

        if (identifier.isEmpty() || password.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new LoginResponse(false, "Vui lòng nhập đầy đủ email/tên đăng nhập và mật khẩu!", null));
        }

        Optional<TaiKhoan> optionalTaiKhoan = taiKhoanRepository.findByTenDangNhap(identifier);
        if (optionalTaiKhoan.isEmpty()) {
            optionalTaiKhoan = taiKhoanRepository.findByEmail(identifier);
        }

        if (optionalTaiKhoan.isEmpty() || !optionalTaiKhoan.get().getMatKhau().equals(password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new LoginResponse(false, "Email hoặc mật khẩu không chính xác!", null));
        }

        TaiKhoan taiKhoan = optionalTaiKhoan.get();

        if ("LOCKED".equalsIgnoreCase(taiKhoan.getTrangThai())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new LoginResponse(false, "Tài khoản đã bị khóa! Vui lòng liên hệ quản trị viên.", null));
        }

        NhanVien nv = null;
        if (taiKhoan.getIdNhanVien() != null) {
            nv = nhanVienRepository.findById(taiKhoan.getIdNhanVien()).orElse(null);
        }

        String role = (taiKhoan.getRole() == null || taiKhoan.getRole().isEmpty()) ? "STAFF" : taiKhoan.getRole();
        String token = JwtUtil.generateToken(taiKhoan.getTenDangNhap(), role);
        LoginResponseData responseData = buildResponseData(taiKhoan, nv, token);

        lichSuThaoTacRepository.save(LichSuThaoTac.builder()
                .nguoiThucHien(responseData.getHoTen())
                .vaiTro(role)
                .thaoTac("Đăng nhập hệ thống")
                .doiTuong("Tài khoản: " + taiKhoan.getTenDangNhap())
                .chiTiet("Đăng nhập thành công vào hệ thống")
                .thoiGian(LocalDateTime.now())
                .build());

        return ResponseEntity.ok(new LoginResponse(true, "Đăng nhập thành công", responseData));
    }

    @PostMapping("/register")
    @Transactional
    public ResponseEntity<LoginResponse> register(@RequestBody Map<String, String> body) {
        String hoTen = body.getOrDefault("hoTen", "").trim();
        String email = body.getOrDefault("email", "").trim();
        String soDienThoai = body.getOrDefault("soDienThoai", "").trim();
        String tenDangNhap = body.getOrDefault("tenDangNhap", "").trim();
        String matKhau = body.getOrDefault("matKhau", "");
        String xacNhanMatKhau = body.getOrDefault("xacNhanMatKhau", "");
        String diaChi = body.getOrDefault("diaChi", "").trim();

        if (hoTen.isEmpty()) {
            return ResponseEntity.badRequest().body(new LoginResponse(false, "Họ và tên không được để trống", null));
        }
        if (email.isEmpty() || !email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            return ResponseEntity.badRequest().body(new LoginResponse(false, "Email không hợp lệ", null));
        }
        if (taiKhoanRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(new LoginResponse(false, "Email đã được sử dụng", null));
        }
        if (!soDienThoai.isEmpty() && !soDienThoai.matches("^\\d{9,11}$")) {
            return ResponseEntity.badRequest().body(new LoginResponse(false, "Số điện thoại không hợp lệ (chỉ gồm 9-11 chữ số)", null));
        }
        if (matKhau.length() < 6) {
            return ResponseEntity.badRequest().body(new LoginResponse(false, "Mật khẩu phải có tối thiểu 6 ký tự", null));
        }
        if (!xacNhanMatKhau.isEmpty() && !matKhau.equals(xacNhanMatKhau)) {
            return ResponseEntity.badRequest().body(new LoginResponse(false, "Mật khẩu xác nhận không khớp", null));
        }

        if (tenDangNhap.isEmpty()) {
            tenDangNhap = email.split("@")[0];
            if (taiKhoanRepository.findByTenDangNhap(tenDangNhap).isPresent()) {
                tenDangNhap = tenDangNhap + "_" + (System.currentTimeMillis() % 1000);
            }
        } else if (taiKhoanRepository.findByTenDangNhap(tenDangNhap).isPresent()) {
            return ResponseEntity.badRequest().body(new LoginResponse(false, "Tên đăng nhập đã được sử dụng", null));
        }

        NhanVien nv = NhanVien.builder()
                .hoTen(hoTen)
                .email(email)
                .soDienThoai(soDienThoai)
                .diaChi(diaChi)
                .chucVu("Giảng viên / Sinh viên")
                .build();
        nv = nhanVienRepository.save(nv);

        TaiKhoan tk = TaiKhoan.builder()
                .tenDangNhap(tenDangNhap)
                .email(email)
                .matKhau(matKhau)
                .idNhanVien(nv.getId())
                .role("STAFF")
                .trangThai("ACTIVE")
                .build();
        tk = taiKhoanRepository.save(tk);

        lichSuThaoTacRepository.save(LichSuThaoTac.builder()
                .nguoiThucHien(hoTen)
                .vaiTro("STAFF")
                .thaoTac("Đăng ký tài khoản")
                .doiTuong("Tài khoản: " + tenDangNhap + " (" + email + ")")
                .chiTiet("Đăng ký tài khoản người dùng mới")
                .thoiGian(LocalDateTime.now())
                .build());

        String token = JwtUtil.generateToken(tk.getTenDangNhap(), tk.getRole());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new LoginResponse(true, "Đăng ký tài khoản thành công", buildResponseData(tk, nv, token)));
    }

    @PostMapping("/forgot-password")
    @Transactional
    public ResponseEntity<LoginResponse> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "").trim();
        if (email.isEmpty() || !email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            return ResponseEntity.badRequest().body(new LoginResponse(false, "Email không hợp lệ", null));
        }

        Optional<TaiKhoan> optionalTk = taiKhoanRepository.findByEmail(email);
        if (optionalTk.isEmpty()) {
            // Cũng hỗ trợ tìm theo tên đăng nhập nếu người dùng nhập username
            optionalTk = taiKhoanRepository.findByTenDangNhap(email);
        }

        if (optionalTk.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new LoginResponse(false, "Email không tồn tại trong hệ thống", null));
        }

        TaiKhoan tk = optionalTk.get();
        String resetToken = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        tk.setResetToken(resetToken);
        tk.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15));
        taiKhoanRepository.save(tk);

        return ResponseEntity.ok(new LoginResponse(
                true,
                "Liên kết đặt lại mật khẩu đã được gửi đến email của bạn",
                Map.of("resetToken", resetToken, "email", email)
        ));
    }

    @PostMapping("/reset-password")
    @Transactional
    public ResponseEntity<LoginResponse> resetPassword(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "").trim();
        String resetToken = body.getOrDefault("resetToken", "").trim();
        String newPassword = body.getOrDefault("newPassword", "");
        String confirmPassword = body.getOrDefault("confirmPassword", "");

        if (newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(new LoginResponse(false, "Mật khẩu mới phải có ít nhất 6 ký tự", null));
        }
        if (!newPassword.equals(confirmPassword)) {
            return ResponseEntity.badRequest().body(new LoginResponse(false, "Mật khẩu xác nhận không khớp", null));
        }

        Optional<TaiKhoan> optionalTk = !resetToken.isEmpty()
                ? taiKhoanRepository.findByResetToken(resetToken)
                : taiKhoanRepository.findByEmail(email);

        if (optionalTk.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new LoginResponse(false, "Mã khôi phục hoặc email không hợp lệ", null));
        }

        TaiKhoan tk = optionalTk.get();
        if (tk.getResetTokenExpiry() != null && tk.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new LoginResponse(false, "Liên kết đã hết hạn! Vui lòng gửi lại yêu cầu khôi phục mật khẩu", null));
        }

        tk.setMatKhau(newPassword);
        tk.setResetToken(null);
        tk.setResetTokenExpiry(null);
        taiKhoanRepository.save(tk);

        lichSuThaoTacRepository.save(LichSuThaoTac.builder()
                .nguoiThucHien(tk.getTenDangNhap())
                .vaiTro(tk.getRole())
                .thaoTac("Đặt lại mật khẩu")
                .doiTuong("Tài khoản: " + tk.getTenDangNhap())
                .chiTiet("Khôi phục mật khẩu thành công")
                .thoiGian(LocalDateTime.now())
                .build());

        return ResponseEntity.ok(new LoginResponse(true, "Đặt lại mật khẩu thành công", null));
    }

    @PutMapping("/profile")
    @Transactional
    public ResponseEntity<LoginResponse> updateProfile(@RequestBody Map<String, Object> body) {
        String tenDangNhap = String.valueOf(body.getOrDefault("tenDangNhap", "")).trim();
        String hoTen = String.valueOf(body.getOrDefault("hoTen", "")).trim();
        String email = String.valueOf(body.getOrDefault("email", "")).trim();
        String soDienThoai = String.valueOf(body.getOrDefault("soDienThoai", "")).trim();
        String diaChi = String.valueOf(body.getOrDefault("diaChi", "")).trim();
        String matKhauMoi = body.get("matKhauMoi") != null ? String.valueOf(body.get("matKhauMoi")).trim() : "";

        if (hoTen.isEmpty()) {
            return ResponseEntity.badRequest().body(new LoginResponse(false, "Họ và tên không được để trống", null));
        }
        if (!email.isEmpty() && !email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            return ResponseEntity.badRequest().body(new LoginResponse(false, "Email không hợp lệ", null));
        }
        if (!soDienThoai.isEmpty() && !soDienThoai.matches("^\\d{9,11}$")) {
            return ResponseEntity.badRequest().body(new LoginResponse(false, "Số điện thoại không hợp lệ", null));
        }

        Optional<TaiKhoan> optionalTk = taiKhoanRepository.findByTenDangNhap(tenDangNhap);
        if (optionalTk.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new LoginResponse(false, "Không tìm thấy tài khoản", null));
        }

        TaiKhoan tk = optionalTk.get();
        if (!email.isEmpty()) {
            Optional<TaiKhoan> byEmail = taiKhoanRepository.findByEmail(email);
            if (byEmail.isPresent() && !byEmail.get().getId().equals(tk.getId())) {
                return ResponseEntity.badRequest().body(new LoginResponse(false, "Email đã được sử dụng bởi tài khoản khác", null));
            }
            tk.setEmail(email);
        }

        if (!matKhauMoi.isEmpty()) {
            if (matKhauMoi.length() < 6) {
                return ResponseEntity.badRequest().body(new LoginResponse(false, "Mật khẩu mới phải có tối thiểu 6 ký tự", null));
            }
            tk.setMatKhau(matKhauMoi);
        }

        NhanVien nv = null;
        if (tk.getIdNhanVien() != null) {
            nv = nhanVienRepository.findById(tk.getIdNhanVien()).orElse(null);
        }
        if (nv == null) {
            nv = new NhanVien();
        }
        nv.setHoTen(hoTen);
        nv.setEmail(email);
        nv.setSoDienThoai(soDienThoai);
        nv.setDiaChi(diaChi);
        if (nv.getChucVu() == null || nv.getChucVu().isEmpty()) {
            nv.setChucVu("ADMIN".equalsIgnoreCase(tk.getRole()) ? "Quản trị viên" : "Nhân viên");
        }
        nv = nhanVienRepository.save(nv);
        tk.setIdNhanVien(nv.getId());
        tk = taiKhoanRepository.save(tk);

        lichSuThaoTacRepository.save(LichSuThaoTac.builder()
                .nguoiThucHien(hoTen)
                .vaiTro(tk.getRole())
                .thaoTac("Cập nhật thông tin cá nhân")
                .doiTuong("Hồ sơ: " + hoTen)
                .chiTiet("Cập nhật email, SĐT, địa chỉ hồ sơ cá nhân")
                .thoiGian(LocalDateTime.now())
                .build());

        String token = JwtUtil.generateToken(tk.getTenDangNhap(), tk.getRole());
        return ResponseEntity.ok(new LoginResponse(true, "Cập nhật thông tin thành công", buildResponseData(tk, nv, token)));
    }
}
