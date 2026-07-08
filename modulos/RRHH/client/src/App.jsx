import { useLocation } from "react-router-dom";
import Layout from "./layouts/Layout";
import AppRoutes from "./router/AppRoutes";
import { Blank } from "./layouts/Blank";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import VisualizadorLayout from "./layouts/VisualizadorLayout";
import { NotificationProvider } from "./hooks/NotificationContext";

function App() {
  const location = useLocation();

  const isAuthPath = location.pathname.includes("Register")
    || location.pathname.includes("Login")
    || location.pathname.includes("error")
    || location.pathname.includes("under-maintenance")
    || location.pathname.includes("blank");

  const isVisualizadorPath = location.pathname.startsWith("/visualizador");

  return (
    <NotificationProvider>
      {isAuthPath ? (
        <AppRoutes>
          <Blank />
        </AppRoutes>
      ) : isVisualizadorPath ? (
        <VisualizadorLayout>
          <AppRoutes />
        </VisualizadorLayout>
      ) : (
        <Layout>
          <AppRoutes />
        </Layout>
      )}
    </NotificationProvider>
  );
}

export default App;
