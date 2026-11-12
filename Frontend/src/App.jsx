import { ConfigProvider, theme } from "antd";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#6366f1",
          borderRadius: 8,
          fontFamily: "'Inter', sans-serif",
        },
      }}
    >
      <AppRoutes />
    </ConfigProvider>
  );
}

export default App;