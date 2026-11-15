package com.qlthietbi;

import com.qlthietbi.entity.*;
import com.qlthietbi.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class Startup implements CommandLineRunner {

    private final TaiKhoanRepository taiKhoanRepository;
    private final NhanVienRepository nhanVienRepository;
    private final PhongHocRepository phongHocRepository;
    private final ThietBiRepository thietBiRepository;
    private final MuonTraRepository muonTraRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final ThongBaoRepository thongBaoRepository;
    private final LichSuThaoTacRepository lichSuThaoTacRepository;

    public Startup(TaiKhoanRepository taiKhoanRepository,
                   NhanVienRepository nhanVienRepository,
                   PhongHocRepository phongHocRepository,
                   ThietBiRepository thietBiRepository,
                   MuonTraRepository muonTraRepository,
                   MaintenanceRepository maintenanceRepository,
                   ThongBaoRepository thongBaoRepository,
                   LichSuThaoTacRepository lichSuThaoTacRepository) {
        this.taiKhoanRepository = taiKhoanRepository;
        this.nhanVienRepository = nhanVienRepository;
        this.phongHocRepository = phongHocRepository;
        this.thietBiRepository = thietBiRepository;
        this.muonTraRepository = muonTraRepository;
        this.maintenanceRepository = maintenanceRepository;
        this.thongBaoRepository = thongBaoRepository;
        this.lichSuThaoTacRepository = lichSuThaoTacRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        // 1. Seed hoặc cập nhật tài khoản mặc định
        if (taiKhoanRepository.count() == 0) {
            NhanVien nv = NhanVien.builder()
                    .hoTen("Nguyễn Anh Kiệt")
                    .email("admin@uni.edu.vn")
                    .chucVu("Cán bộ quản lý thiết bị")
                    .diaChi("Cầu Giấy, Hà Nội")
                    .soDienThoai("0901234567")
                    .build();
            nv = nhanVienRepository.save(nv);

            TaiKhoan admin = TaiKhoan.builder()
                    .tenDangNhap("admin")
                    .email("admin@uni.edu.vn")
                    .matKhau("123456")
                    .idNhanVien(nv.getId())
                    .role("ADMIN")
                    .trangThai("ACTIVE")
                    .build();
            taiKhoanRepository.save(admin);

            NhanVien staff1 = NhanVien.builder()
                    .hoTen("Trần Văn Đạo")
                    .email("daotv@uni.edu.vn")
                    .chucVu("Giảng viên CNTT")
                    .diaChi("Đống Đa, Hà Nội")
                    .soDienThoai("0987654321")
                    .build();
            staff1 = nhanVienRepository.save(staff1);

            TaiKhoan stAcc1 = TaiKhoan.builder()
                    .tenDangNhap("staff1")
                    .email("daotv@uni.edu.vn")
                    .matKhau("123456")
                    .idNhanVien(staff1.getId())
                    .role("STAFF")
                    .trangThai("ACTIVE")
                    .build();
            taiKhoanRepository.save(stAcc1);

            NhanVien staff2 = NhanVien.builder()
                    .hoTen("Lê Hoàng Duy")
                    .email("duylh@uni.edu.vn")
                    .chucVu("Nhân viên kỹ thuật")
                    .diaChi("Thanh Xuân, Hà Nội")
                    .soDienThoai("0912345678")
                    .build();
            staff2 = nhanVienRepository.save(staff2);

            TaiKhoan stAcc2 = TaiKhoan.builder()
                    .tenDangNhap("staff2")
                    .email("duylh@uni.edu.vn")
                    .matKhau("123456")
                    .idNhanVien(staff2.getId())
                    .role("STAFF")
                    .trangThai("ACTIVE")
                    .build();
            taiKhoanRepository.save(stAcc2);
        } else {
            // Bổ sung email và trangThai cho tài khoản cũ nếu chưa có
            for (TaiKhoan tk : taiKhoanRepository.findAll()) {
                boolean changed = false;
                if (tk.getTrangThai() == null || tk.getTrangThai().isEmpty()) {
                    tk.setTrangThai("ACTIVE");
                    changed = true;
                }
                if (tk.getEmail() == null || tk.getEmail().isEmpty()) {
                    tk.setEmail(tk.getTenDangNhap() + "@uni.edu.vn");
                    changed = true;
                }
                if (changed) taiKhoanRepository.save(tk);
                if (tk.getIdNhanVien() != null) {
                    final String tkEmail = tk.getEmail();
                    nhanVienRepository.findById(tk.getIdNhanVien()).ifPresent(nv -> {
                        boolean nvChanged = false;
                        if (nv.getEmail() == null || nv.getEmail().isEmpty()) {
                            nv.setEmail(tkEmail);
                            nvChanged = true;
                        }
                        if (nv.getSoDienThoai() == null || nv.getSoDienThoai().isEmpty()) {
                            nv.setSoDienThoai("0912345678");
                            nvChanged = true;
                        }
                        if (nv.getDiaChi() == null || nv.getDiaChi().isEmpty()) {
                            nv.setDiaChi("Hà Nội");
                            nvChanged = true;
                        }
                        if (nvChanged) nhanVienRepository.save(nv);
                    });
                }
            }
        }

        // 2. Seed danh mục Phòng học (Epic 06)
        if (phongHocRepository.count() == 0) {
            phongHocRepository.save(PhongHoc.builder().maPhong("A101").tenPhong("Phòng học lý thuyết A101").viTri("Tầng 1, Tòa A").sucChua(60).trangThai("ACTIVE").moTa("Trang bị máy chiếu, âm thanh tiêu chuẩn").build());
            phongHocRepository.save(PhongHoc.builder().maPhong("A102").tenPhong("Phòng học đa năng A102").viTri("Tầng 1, Tòa A").sucChua(80).trangThai("ACTIVE").moTa("Phòng học chất lượng cao").build());
            phongHocRepository.save(PhongHoc.builder().maPhong("B201").tenPhong("Phòng thực hành máy tính B201").viTri("Tầng 2, Tòa B").sucChua(45).trangThai("ACTIVE").moTa("Phòng Lab CNTT 45 máy").build());
            phongHocRepository.save(PhongHoc.builder().maPhong("B202").tenPhong("Phòng hội thảo B202").viTri("Tầng 2, Tòa B").sucChua(120).trangThai("ACTIVE").moTa("Hội trường nhỏ phục vụ seminar").build());
            phongHocRepository.save(PhongHoc.builder().maPhong("C301").tenPhong("Phòng Lab Điện tử C301").viTri("Tầng 3, Tòa C").sucChua(40).trangThai("MAINTENANCE").moTa("Đang nâng cấp hệ thống điều hòa").build());
            phongHocRepository.save(PhongHoc.builder().maPhong("C302").tenPhong("Phòng Studio Đa phương tiện C302").viTri("Tầng 3, Tòa C").sucChua(35).trangThai("ACTIVE").moTa("Trang bị Camera, Đèn Studio").build());
        }

        // 3. Seed hoặc chuẩn hóa Thiết bị
        if (thietBiRepository.count() < 15) {
            maintenanceRepository.deleteAll();
            thietBiRepository.deleteAll();

            createDevice("TB001", "Laptop Dell Inspiron 14", "Laptop", "GOOD", 101, "A101", null);
            createDevice("TB002", "Máy chiếu Epson EB-X06", "Máy chiếu", "GOOD", 101, "A101", null);
            createDevice("TB003", "Điều hòa Panasonic 12000 BTU", "Thiết bị điện", "MAINTENANCE", 101, "A101", "Điều hòa không mát sâu, cần nạp gas và vệ sinh lưới lọc.");
            createDevice("TB004", "Router Wi-Fi TP-Link Archer C6", "Thiết bị mạng", "GOOD", 101, "A101", null);

            createDevice("TB005", "Laptop HP EliteBook 840 G8", "Laptop", "BORROWED", 102, "A102", null);
            createDevice("TB006", "Hệ thống âm thanh hội trường Sony", "Âm thanh", "GOOD", 102, "A102", null);
            createDevice("TB007", "Máy chiếu Sony VPL-DX221", "Máy chiếu", "MAINTENANCE", 102, "A102", "Màn chiếu bóng đèn bị cháy hỏng bóng xenon, đã thay bóng mới chờ nghiệm thu.");
            createDevice("TB008", "Micro không dây Shure BLX288", "Âm thanh", "GOOD", 102, "A102", null);

            createDevice("TB009", "Laptop ThinkPad X1 Carbon Gen 9", "Laptop", "GOOD", 201, "B201", null);
            createDevice("TB010", "Máy chiếu ViewSonic PA503W", "Máy chiếu", "BORROWED", 201, "B201", null);
            createDevice("TB011", "Camera Sony Alpha A7 IV", "Camera", "GOOD", 201, "B201", null);
            createDevice("TB012", "Webcam Logitech Brio 4K", "Camera", "MAINTENANCE", 201, "B201", "Cáp kết nối USB-C bị chập chờn, lúc nhận lúc không.");

            createDevice("TB013", "Laptop Dell XPS 15 9520", "Laptop", "GOOD", 202, "B202", null);
            createDevice("TB014", "Máy chiếu Panasonic PT-LB303", "Máy chiếu", "GOOD", 202, "B202", null);
            createDevice("TB015", "Loa Soundbar JBL Bar 2.1", "Âm thanh", "GOOD", 202, "B202", null);

            createDevice("TB016", "Laptop MacBook Pro 14 M2", "Laptop", "GOOD", 301, "C301", null);
            createDevice("TB017", "Máy chiếu Optoma HD146X", "Máy chiếu", "LIQUIDATED", 301, "C301", null);
            createDevice("TB018", "Máy in laser Canon LBP 2900", "Máy in", "LIQUIDATED", 302, "C302", null);
        } else {
            List<ThietBi> allDevices = thietBiRepository.findAll();
            boolean hasBorrowed = allDevices.stream().anyMatch(d -> "BORROWED".equalsIgnoreCase(d.getStatus()));
            boolean hasLiquidated = allDevices.stream().anyMatch(d -> "LIQUIDATED".equalsIgnoreCase(d.getStatus()));

            for (int i = 0; i < allDevices.size(); i++) {
                ThietBi d = allDevices.get(i);
                boolean updated = false;
                if (d.getMaThietBi() == null || d.getMaThietBi().isEmpty()) {
                    d.setMaThietBi(String.format("TB%03d", d.getId()));
                    updated = true;
                }
                if (d.getMaPhong() == null || d.getMaPhong().isEmpty()) {
                    int p = d.getIdPhong() != null ? d.getIdPhong() : 101;
                    String mp = p <= 102 ? "A" + p : (p <= 202 ? "B" + p : "C" + p);
                    d.setMaPhong(mp);
                    updated = true;
                }
                if (d.getNgayNhap() == null) {
                    d.setNgayNhap(LocalDate.now().minusMonths(3));
                    updated = true;
                }
                if (!hasBorrowed && i == 1 && "GOOD".equalsIgnoreCase(d.getStatus())) {
                    d.setStatus("BORROWED");
                    hasBorrowed = true;
                    updated = true;
                }
                if (!hasLiquidated && i == allDevices.size() - 1) {
                    d.setStatus("LIQUIDATED");
                    d.setLyDoThanhLy("Thiết bị hết khấu hao sử dụng và hỏng bo mạch chính");
                    d.setNgayThanhLy(LocalDate.now().minusDays(10));
                    hasLiquidated = true;
                    updated = true;
                }
                if (updated) {
                    thietBiRepository.save(d);
                }
            }
        }

        // Cập nhật trạng thái mẫu cho phiếu bảo trì để có đủ PENDING, IN_PROGRESS, REPAIRED, DONE
        List<Maintenance> maints = maintenanceRepository.findAll();
        for (int i = 0; i < maints.size(); i++) {
            Maintenance m = maints.get(i);
            boolean mChanged = false;
            if (m.getPhongHoc() == null && m.getDevice() != null) {
                m.setPhongHoc(m.getDevice().getMaPhong() != null ? m.getDevice().getMaPhong() : "A101");
                mChanged = true;
            }
            if (m.getNguoiBaoLoi() == null) {
                m.setNguoiBaoLoi("Trần Văn Đạo");
                mChanged = true;
            }
            if (m.getNgayBaoLoi() == null) {
                m.setNgayBaoLoi(LocalDate.now().minusDays(5 - (i % 4)));
                mChanged = true;
            }
            if (i == 0 && !"REPAIRED".equals(m.getStatus()) && !"DONE".equals(m.getStatus())) {
                m.setStatus("REPAIRED");
                m.setNoiDungSuaChua("Đã nạp bổ sung gas R32 và vệ sinh toàn bộ dàn lạnh, chạy thử ổn định");
                m.setNgayBaoTri(LocalDate.now().minusDays(1));
                m.setChiPhi(450000.0);
                mChanged = true;
            } else if (i == 1 && "IN_PROGRESS".equals(m.getStatus())) {
                m.setNoiDungSuaChua("Đang đặt linh kiện bóng đèn máy chiếu chính hãng để thay thế");
                m.setNgayBaoTri(LocalDate.now().minusDays(2));
                m.setChiPhi(1200000.0);
                mChanged = true;
            }
            if (mChanged) {
                maintenanceRepository.save(m);
            }
        }

        // 4. Seed Phiếu Mượn Trả đa trạng thái (PENDING, APPROVED, BORROWED, RETURNED, REJECTED)
        if (muonTraRepository.count() == 0) {
            List<ThietBi> devices = thietBiRepository.findAll();
            Integer dev1Id = devices.size() > 0 ? devices.get(0).getId() : 1;
            Integer dev2Id = devices.size() > 1 ? devices.get(1).getId() : 2;
            Integer dev4Id = devices.size() > 3 ? devices.get(3).getId() : 4;

            muonTraRepository.save(MuonTra.builder()
                    .maPhieu("PM001")
                    .studentId("GV001")
                    .studentName("Trần Văn Đạo")
                    .phoneNumber("0987654321")
                    .email("daotv@uni.edu.vn")
                    .deviceId(dev1Id)
                    .maThietBi("TB001")
                    .itemBorrowed("Laptop Dell Inspiron 14")
                    .soLuong(1)
                    .phongHoc("A101")
                    .mucDich("Giảng dạy môn Công nghệ phần mềm")
                    .nguoiTao("Trần Văn Đạo")
                    .status("PENDING")
                    .ngayMuon(LocalDate.now())
                    .ngayTraDuKien(LocalDate.now().plusDays(2))
                    .build());

            muonTraRepository.save(MuonTra.builder()
                    .maPhieu("PM002")
                    .studentId("SV202601")
                    .studentName("Nguyễn Minh Quân")
                    .phoneNumber("0912345678")
                    .email("quannm@student.edu.vn")
                    .deviceId(dev2Id)
                    .maThietBi("TB002")
                    .itemBorrowed("Máy chiếu Epson EB-X06")
                    .soLuong(1)
                    .phongHoc("A102")
                    .mucDich("Thuyết trình đồ án tốt nghiệp")
                    .nguoiTao("Trần Văn Đạo")
                    .status("APPROVED")
                    .ngayMuon(LocalDate.now())
                    .ngayTraDuKien(LocalDate.now().plusDays(1))
                    .build());

            muonTraRepository.save(MuonTra.builder()
                    .maPhieu("PM003")
                    .studentId("GV002")
                    .studentName("Lê Hoàng Duy")
                    .phoneNumber("0934567890")
                    .email("duylh@uni.edu.vn")
                    .deviceId(dev4Id)
                    .maThietBi("TB005")
                    .itemBorrowed("Laptop HP EliteBook 840 G8")
                    .soLuong(1)
                    .phongHoc("B201")
                    .mucDich("Tổ chức thi thực hành lập trình")
                    .nguoiTao("Lê Hoàng Duy")
                    .status("BORROWED")
                    .tinhTrangLucGiao("Tốt - Đầy đủ sạc và cáp chuyển")
                    .ngayMuon(LocalDate.now().minusDays(2))
                    .ngayTraDuKien(LocalDate.now().plusDays(3))
                    .build());

            muonTraRepository.save(MuonTra.builder()
                    .maPhieu("PM004")
                    .studentId("GV003")
                    .studentName("Phạm Thị Hương")
                    .phoneNumber("0978123456")
                    .email("huongpt@uni.edu.vn")
                    .maThietBi("TB011")
                    .itemBorrowed("Camera Sony Alpha A7 IV")
                    .soLuong(1)
                    .phongHoc("C302")
                    .mucDich("Quay video bài giảng E-Learning")
                    .nguoiTao("Trần Văn Đạo")
                    .status("RETURNED")
                    .tinhTrangLucGiao("Tốt")
                    .tinhTrangKhiTra("Tốt")
                    .ghiChuTra("Hoàn trả đầy đủ pin và thẻ nhớ 64GB")
                    .ngayMuon(LocalDate.now().minusDays(7))
                    .ngayTraDuKien(LocalDate.now().minusDays(5))
                    .ngayTra(LocalDate.now().minusDays(5))
                    .build());

            muonTraRepository.save(MuonTra.builder()
                    .maPhieu("PM005")
                    .studentId("SV202609")
                    .studentName("Hoàng Gia Bảo")
                    .phoneNumber("0965432109")
                    .email("baohg@student.edu.vn")
                    .maThietBi("TB008")
                    .itemBorrowed("Micro không dây Shure BLX288")
                    .soLuong(1)
                    .phongHoc("B202")
                    .mucDich("Hội thảo CLB Sinh viên Nghiên cứu Khoa học")
                    .nguoiTao("Trần Văn Đạo")
                    .status("RETURNED")
                    .tinhTrangLucGiao("Tốt")
                    .tinhTrangKhiTra("Hao mòn nhẹ")
                    .ghiChuTra("Xước nhẹ vỏ sơn tay cầm micro số 2")
                    .ngayMuon(LocalDate.now().minusDays(12))
                    .ngayTraDuKien(LocalDate.now().minusDays(10))
                    .ngayTra(LocalDate.now().minusDays(10))
                    .build());
        }

        // 5. Seed Lịch sử thao tác (US5.1)
        if (lichSuThaoTacRepository.count() == 0) {
            lichSuThaoTacRepository.save(LichSuThaoTac.builder()
                    .nguoiThucHien("Nguyễn Anh Kiệt")
                    .vaiTro("ADMIN")
                    .thaoTac("Thêm phòng học")
                    .doiTuong("Phòng học lý thuyết A101 (A101)")
                    .chiTiet("Khởi tạo danh mục phòng học tòa A, sức chứa 60")
                    .thoiGian(LocalDateTime.now().minusDays(3))
                    .build());
            lichSuThaoTacRepository.save(LichSuThaoTac.builder()
                    .nguoiThucHien("Nguyễn Anh Kiệt")
                    .vaiTro("ADMIN")
                    .thaoTac("Thêm thiết bị")
                    .doiTuong("Máy chiếu Epson EB-X06 (TB002)")
                    .chiTiet("Nhập kho thiết bị mới cho phòng A101")
                    .thoiGian(LocalDateTime.now().minusDays(2))
                    .build());
            lichSuThaoTacRepository.save(LichSuThaoTac.builder()
                    .nguoiThucHien("Trần Văn Đạo")
                    .vaiTro("STAFF")
                    .thaoTac("Lập phiếu mượn")
                    .doiTuong("Phiếu PM001 - Laptop Dell Inspiron 14")
                    .chiTiet("Đăng ký mượn thiết bị giảng dạy tại phòng A101")
                    .thoiGian(LocalDateTime.now().minusDays(1))
                    .build());
            lichSuThaoTacRepository.save(LichSuThaoTac.builder()
                    .nguoiThucHien("Lê Hoàng Duy")
                    .vaiTro("STAFF")
                    .thaoTac("Báo lỗi thiết bị")
                    .doiTuong("Điều hòa Panasonic 12000 BTU - Phòng A101")
                    .chiTiet("Mô tả sự cố: Điều hòa không mát sâu, cần nạp gas")
                    .thoiGian(LocalDateTime.now().minusHours(12))
                    .build());
            lichSuThaoTacRepository.save(LichSuThaoTac.builder()
                    .nguoiThucHien("Nguyễn Anh Kiệt")
                    .vaiTro("ADMIN")
                    .thaoTac("Cập nhật lịch sử bảo trì")
                    .doiTuong("Điều hòa Panasonic 12000 BTU")
                    .chiTiet("Đã nạp bổ sung gas R32 và vệ sinh dàn lạnh (Trạng thái: Đã sửa xong)")
                    .thoiGian(LocalDateTime.now().minusHours(4))
                    .build());
        }

        // 6. Seed Thông báo
        if (thongBaoRepository.count() == 0) {
            thongBaoRepository.save(ThongBao.builder()
                    .noiDung("Có sự cố mới: Điều hòa Panasonic 12000 BTU (Phòng A101) - Hoạt động kém mát, cần nạp gas.")
                    .loai("INCIDENT")
                    .tenThietBi("Điều hòa Panasonic 12000 BTU")
                    .phongHoc("A101")
                    .thoiGian(LocalDateTime.now().minusHours(5))
                    .daDoc(false)
                    .build());
            thongBaoRepository.save(ThongBao.builder()
                    .noiDung("Có sự cố mới: Máy chiếu Sony VPL-DX221 (Phòng A102) - Cháy bóng đèn chiếu.")
                    .loai("INCIDENT")
                    .tenThietBi("Máy chiếu Sony VPL-DX221")
                    .phongHoc("A102")
                    .thoiGian(LocalDateTime.now().minusHours(3))
                    .daDoc(false)
                    .build());
            thongBaoRepository.save(ThongBao.builder()
                    .noiDung("Phiếu mượn mới PM001: Trần Văn Đạo đăng ký mượn Laptop Dell Inspiron 14 tại phòng A101")
                    .loai("BORROW")
                    .tenThietBi("Laptop Dell Inspiron 14")
                    .phongHoc("A101")
                    .thoiGian(LocalDateTime.now().minusHours(1))
                    .daDoc(false)
                    .build());
        }
    }

    private void createDevice(String maThietBi, String name, String type, String status, Integer idPhong, String maPhong, String maintenanceDesc) {
        ThietBi tb = ThietBi.builder()
                .maThietBi(maThietBi)
                .name(name)
                .type(type)
                .status(status)
                .idPhong(idPhong)
                .maPhong(maPhong)
                .ngayNhap(LocalDate.now().minusMonths(2))
                .lyDoThanhLy("LIQUIDATED".equals(status) ? "Thiết bị hết hạn khấu hao, hư hỏng nặng không thể phục hồi" : null)
                .ngayThanhLy("LIQUIDATED".equals(status) ? LocalDate.now().minusDays(15) : null)
                .build();
        tb = thietBiRepository.save(tb);

        if (maintenanceDesc != null) {
            Maintenance mt = Maintenance.builder()
                    .device(tb)
                    .phongHoc(maPhong)
                    .nguoiBaoLoi("Trần Văn Đạo")
                    .ngayBaoLoi(LocalDate.now().minusDays(3))
                    .description(maintenanceDesc)
                    .status("IN_PROGRESS")
                    .build();
            maintenanceRepository.save(mt);
        }
    }
}
