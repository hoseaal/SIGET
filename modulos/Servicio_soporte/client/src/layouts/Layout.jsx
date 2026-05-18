import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    Main();
  },[])
  return (
    <div className="layout-wrapper layout-content-navbar">
      <a href="#main-content" className="visually-hidden-focusable p-3 bg-primary text-white position-absolute top-0 start-0 z-3" style={{zIndex: 9999}}>
        Saltar al contenido principal
      </a>
      <div className="layout-container">
        <Sidebar />
        <div className="layout-page ">
          <Navbar />
          <div className="content-wrapper">
            <main key={location.pathname} id="main-content" className="container-xxl flex-grow-1 container-p-y fade-in" tabIndex="-1" style={{ outline: 'none' }}>
            {children}
            </main>
            <Footer />
          </div>
        </div>
      <div className="layout-overlay layout-menu-toggle"></div>
      </div>
    </div>
  );
};

export default Layout;
