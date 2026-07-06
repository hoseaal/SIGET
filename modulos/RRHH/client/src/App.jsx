import { useLocation } from "react-router-dom";
import Layout from "./layouts/Layout";
import AppRoutes from "./router/AppRoutes";
import { Blank } from "./layouts/Blank";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import VisualizadorLayout from "./layouts/VisualizadorLayout";

function App() {
  const location = useLocation();

  // Rutas sin layout (auth pages)
  const isAuthPath = location.pathname.includes("Register")
    || location.pathname.includes("Login")
    || location.pathname.includes("error")
    || location.pathname.includes("under-maintenance")
    || location.pathname.includes("blank");

  // Rutas del portal Visualizador — usan su propio layout sin panel admin
  const isVisualizadorPath = location.pathname.startsWith("/visualizador");

  return (
    <>
      {isAuthPath ? (
        <AppRoutes>
          <Blank />
        </AppRoutes>
      ) : isVisualizadorPath ? (
        // Layout limpio para el Visualizador: solo Navbar básica + contenido
        <VisualizadorLayout>
          <AppRoutes />
        </VisualizadorLayout>
      ) : (
        // Layout completo con Sidebar y Navbar de administración
        <Layout>
          <AppRoutes />
        </Layout>
      )}
    </>
  );
}

export default App;
