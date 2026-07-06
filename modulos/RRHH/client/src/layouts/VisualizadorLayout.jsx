import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * Layout exclusivo para el rol Visualizador.
 * Reutiliza el mismo Sidebar y Navbar, pero ambos ya tienen
 * lógica interna condicional: cuando detectan nombre_rol === 'Visualizador'
 * renderizan únicamente los elementos del autoservicio.
 *
 * Separar este layout de Layout.jsx en App.jsx garantiza que
 * nunca se monta el árbol del DOM de administración al navegar
 * en rutas del portal del empleado, eliminando el "flash" visual.
 */
const VisualizadorLayout = ({ children }) => {
    return (
        <div className="layout-wrapper layout-content-navbar">
            <div className="layout-container">
                {/* El Sidebar ya renderiza la versión del Visualizador internamente */}
                <Sidebar />
                <div className="layout-page">
                    {/* El Navbar ya oculta las notificaciones admin para el Visualizador */}
                    <Navbar />
                    <div className="content-wrapper">
                        <div className="container-xxl flex-grow-1 container-p-y">
                            {children}
                        </div>
                        <Footer />
                    </div>
                </div>
                <div className="layout-overlay layout-menu-toggle"></div>
            </div>
        </div>
    );
};

export default VisualizadorLayout;
