package com.qlthietbi;

import com.qlthietbi.entity.Maintenance;
import com.qlthietbi.entity.NhanVien;
import com.qlthietbi.entity.TaiKhoan;
import com.qlthietbi.entity.ThietBi;
import com.qlthietbi.entity.ThongBao;
import com.qlthietbi.repository.MaintenanceRepository;
import com.qlthietbi.repository.NhanVienRepository;
import com.qlthietbi.repository.TaiKhoanRepository;
import com.qlthietbi.repository.ThietBiRepository;
import com.qlthietbi.repository.ThongBaoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
public class Startup implements CommandLineRunner {

    private final TaiKhoanRepository taiKhoanRepository;
    private final NhanVienRepository nhanVienRepository;
    private final ThietBiRepository thietBiRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final ThongBaoRepository thongBaoRepository;

    public Startup(TaiKhoanRepository taiKhoanRepository,
                   NhanVienRepository nhanVienRepository,
                   ThietBiRepository thietBiRepository,
                   MaintenanceRepository maintenanceRepository,
                   ThongBaoRepository thongBaoRepository) {
        this.taiKhoanRepository = taiKhoanRepository;
        this.nhanVienRepository = nhanVienRepository;
        this.thietBiRepository = thietBiRepository;
        this.maintenanceRepository = maintenanceRepository;
        this.thongBaoRepository = thongBaoRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        // 1. Seed tài khoản Admin mặc định
        if (taiKhoanRepository.count() == 0) {
            NhanVien nv = new NhanVien();
            nv.setHoTen("Nguyễn Anh Kiệt");
            nv.setChucVu("Quản trị viên");
            nv = nhanVienRepository.save(nv);

            TaiKhoan admin = new TaiKhoan();
            admin.setTenDangNhap("admin");
            admin.setMatKhau("123456");
            admin.setIdNhanVien(nv.getId());
            admin.setRole("ADMIN");
            taiKhoanRepository.save(admin);
            System.out.println("Default admin account created: admin/123456");

            // Seed một vài nhân viên Staff mặc định
            NhanVien staff1 = new NhanVien();
            staff1.setHoTen("Trần Văn Đạo");
            staff1.setChucVu("Nhân viên kỹ thuật");
            staff1 = nhanVienRepository.save(staff1);

            TaiKhoan stAcc1 = new TaiKhoan();
            stAcc1.setTenDangNhap("staff1");
            stAcc1.setMatKhau("123456");
            stAcc1.setIdNhanVien(staff1.getId());
            stAcc1.setRole("STAFF");
            taiKhoanRepository.save(stAcc1);
        }

        // 2. Seed danh sách Thiết bị và Phiếu báo trì phong phú
        if (thietBiRepository.count() < 20) {
            maintenanceRepository.deleteAll();
            thietBiRepository.deleteAll();

            // Phòng 101 devices
            createDevice("Laptop Dell Inspiron 14", "Laptop", "GOOD", 101);
            createDevice("Projector Epson EB-X06", "Projector", "GOOD", 101);
            createDevice("Điều hòa Panasonic 12000 BTU", "Other", "MAINTENANCE", 101, "Điều hòa không mát sâu, cần nạp gas và vệ sinh lưới lọc.");
            createDevice("Router Wi-Fi TP-Link Archer C6", "Other", "GOOD", 101);

            // Phòng 102 devices
            createDevice("Laptop HP EliteBook 840 G8", "Laptop", "GOOD", 102);
            createDevice("Hệ thống âm thanh Sony", "Other", "GOOD", 102);
            createDevice("Máy chiếu Sony VPL-DX221", "Projector", "BROKEN", 102, "Màn chiếu bóng đèn bị cháy hỏng bóng xenon, bật không lên nguồn.");
            createDevice("Micro không dây Shure", "Other", "GOOD", 102);
            createDevice("Máy in laser Canon LBP 2900", "Other", "MAINTENANCE", 102, "Máy in bị kẹt giấy liên tục và nháy đèn đỏ báo lỗi cơ.");

            // Phòng 201 devices
            createDevice("Laptop ThinkPad X1 Carbon Gen 9", "Laptop", "GOOD", 201);
            createDevice("Máy chiếu ViewSonic PA503W", "Projector", "GOOD", 201);
            createDevice("Camera Sony Alpha A7 IV", "Camera", "GOOD", 201);
            createDevice("Webcam Logitech Brio 4K", "Camera", "MAINTENANCE", 201, "Cáp kết nối USB-C bị chập chờn, máy tính lúc nhận lúc không.");
            createDevice("Đèn Led Studio Godox SL60W", "Other", "GOOD", 201);

            // Phòng 202 devices
            createDevice("Laptop Dell XPS 15 9520", "Laptop", "MAINTENANCE", 202, "Màn hình xuất hiện sọc dọc màu hồng, cần bảo hành thay tấm nền.");
            createDevice("Máy chiếu Panasonic PT-LB303", "Projector", "GOOD", 202);
            createDevice("Router Wi-Fi Asus RT-AX56U Wifi 6", "Other", "BROKEN", 202, "Cháy bo mạch nguồn do sét đánh vào đường dây cáp lan.");
            createDevice("Loa Soundbar JBL Bar 2.1", "Other", "GOOD", 202);

            // Phòng 301 devices
            createDevice("Laptop MacBook Pro 14 M2", "Laptop", "GOOD", 301);
            createDevice("Máy chiếu Optoma HD146X", "Projector", "GOOD", 301);
            createDevice("Máy thu hình vật thể Aver F17-8M", "Camera", "BROKEN", 301, "Cảm biến ảnh bị lỗi màu, hình ảnh bị nhòe tím nghiêm trọng.");
            createDevice("Máy in 3D Creality Ender 3 V2", "Other", "GOOD", 301);
            createDevice("Máy quét tài liệu HP ScanJet 2500 f1", "Other", "GOOD", 301);

            // Phòng 302 devices
            createDevice("Laptop Asus ROG Strix G15", "Laptop", "GOOD", 302);
            createDevice("Máy chiếu BenQ MS560", "Projector", "MAINTENANCE", 302, "Quạt tản nhiệt kêu to bất thường, máy chiếu tự tắt sau 5 phút hoạt động.");
            createDevice("Camera Lumix GH6", "Camera", "GOOD", 302);
            createDevice("Bút trình chiếu Logitech R500", "Other", "GOOD", 302);
            createDevice("Điều hòa tủ đứng Daikin 28000 BTU", "Other", "BROKEN", 302, "Cháy lốc máy nén cục nóng, aptomat nhảy liên tục khi khởi động.");

            System.out.println("Seeded 26 rich devices and related maintenance logs successfully!");
        }

        // 3. Seed danh sách Thông báo (sự cố thiết bị) để Admin quản lý
        if (thongBaoRepository.count() < 5) {
            createNotification("Sự cố khẩn cấp: 'Router Wi-Fi Asus' tại Phòng 202 bị chập cháy do sét đánh.");
            createNotification("Yêu cầu bảo trì: 'Điều hòa Panasonic' tại Phòng 101 hoạt động kém mát, cần nạp gas.");
            createNotification("Sự cố thiết bị: 'Máy chiếu Sony VPL-DX221' tại Phòng 102 bị cháy bóng đèn chiếu.");
            createNotification("Yêu cầu kiểm tra: 'Máy in Canon LBP 2900' tại Phòng 102 kẹt giấy liên tục.");
            createNotification("Yêu cầu bảo trì: 'Máy chiếu BenQ MS560' tại Phòng 302 lỗi quạt tản nhiệt gây quá nhiệt.");
            System.out.println("Seeded default notifications successfully!");
        }
    }

    private void createDevice(String name, String type, String status, Integer idPhong) {
        createDevice(name, type, status, idPhong, null);
    }

    private void createDevice(String name, String type, String status, Integer idPhong, String maintenanceDesc) {
        ThietBi tb = new ThietBi();
        tb.setName(name);
        tb.setType(type);
        tb.setStatus(status);
        tb.setIdPhong(idPhong);
        tb = thietBiRepository.save(tb);

        if (maintenanceDesc != null) {
            Maintenance mt = new Maintenance();
            mt.setDevice(tb);
            mt.setDescription(maintenanceDesc);
            mt.setStatus("IN_PROGRESS");
            maintenanceRepository.save(mt);
        }
    }

    private void createNotification(String message) {
        ThongBao tb = new ThongBao();
        tb.setNoiDung(message);
        tb.setThoiGian(LocalDateTime.now().minusHours((long) (Math.random() * 24)));
        tb.setDaDoc(false);
        thongBaoRepository.save(tb);
    }
}
