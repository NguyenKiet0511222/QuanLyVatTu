import { Menu, Layout } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  DashboardOutlined, DesktopOutlined, SwapOutlined, 
  UserOutlined, ToolOutlined, TeamOutlined, IdcardOutlined 
} from '@ant-design/icons';

const { Sider } = Layout;

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Lấy user từ localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = user?.role?.toUpperCase() || "STAFF";

  // Danh sách menu tổng
  const allMenuItems = [
    { key: "/", label: "Tổng quan", icon: <DashboardOutlined /> },
    { key: "/devices", label: "Thiết bị", icon: <DesktopOutlined /> },
    { key: "/borrows", label: "Mượn / Trả", icon: <SwapOutlined /> },
    { key: "/borrowers", label: "Người mượn", icon: <UserOutlined /> },
    { key: "/maintenance", label: "Bảo trì", icon: <ToolOutlined /> },
    // Mục chỉ Admin mới thấy
    { 
      key: "/employees", 
      label: "Quản lý nhân viên", 
      icon: <TeamOutlined />, 
      role: "ADMIN" 
    },
    // Mục xem thông tin cá nhân (xem tài khoản/mật khẩu)
    { key: "/profile", label: "Tài khoản của tôi", icon: <IdcardOutlined /> },
  ];

  // Lọc menu theo role
  const filteredItems = allMenuItems.filter(item => !item.role || item.role === userRole);

  return (
    <Sider collapsible className="min-h-screen">
      <div className="p-4 text-white font-bold text-center border-b border-gray-700 mb-4">
        QUẢN LÝ VẬT TƯ
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={filteredItems}
        onClick={(e) => navigate(e.key)}
      />
    </Sider>
  );
}