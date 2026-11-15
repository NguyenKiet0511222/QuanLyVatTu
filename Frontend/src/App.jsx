import { ConfigProvider, theme } from "antd";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: "#4f46e5",
          borderRadius: 10,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          colorBgContainer: "#ffffff",
          colorText: "#0f172a",
          colorTextSecondary: "#475569",
        },
      }}
    >
      <AppRoutes />
    </ConfigProvider>
  );
}

export default App;
