import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import menuData from '../data/menuData.json';
import { menuPermissions } from '../data/dataPermissions';
import { useAuth } from '../hooks/useAuth';
import logoContraloria from '../../public/assets/img/logo-contraloria-home2.png';

const Sidebar = () => {
    const { user, loading: authLoading } = useAuth();
    const [filteredMenuData, setFilteredMenuData] = useState([]);
    const location = useLocation();

    const filterMenuByUserType = (menuData, userType) => {
        return menuData.map(section => ({
            ...section,
            items: section.items.map(item => {
                if (item.submenu) {
                    return {
                        ...item,
                        submenu: item.submenu.filter(subitem => {
                            const permissions = menuPermissions[subitem.link];
                            return permissions && permissions.includes(parseInt(userType));
                        }),
                        available: item.submenu.some(subitem => {
                            const permissions = menuPermissions[subitem.link];
                            return permissions && permissions.includes(parseInt(userType));
                        })
                    };
                }

                const permissions = menuPermissions[item.link];
                return {
                    ...item,
                    available: permissions ? permissions.includes(parseInt(userType)) : false
                };
            }).filter(item => item.available || (item.submenu && item.submenu.length > 0))
        })).filter(section => section.items.length > 0);
    };

    useEffect(() => {
        if (authLoading) return;
        if (!user) return;

        const currentUserType = user.rol_id;
        setFilteredMenuData(filterMenuByUserType(menuData, currentUserType));
    }, [user, authLoading]);

    // ── Sidebar exclusivo para el rol Visualizador ──────────────────────────
    if (!authLoading && user?.nombre_rol === 'Visualizador') {
        const currentView = new URLSearchParams(location.search).get('view') || 'perfil';

        const isMiPerfilOpen = ['perfil', 'antiguedades', 'encargos'].includes(currentView);
        const isNominaOpen = ['nomina', 'vacaciones'].includes(currentView);

        return (
            <aside id="layout-menu" className="layout-menu menu-vertical menu bg-menu-theme">
                <div className="app-brand demo">
                    <Link aria-label='Navigate to portal' to="/visualizador" className="app-brand-link">
                        <img src={logoContraloria} alt="logo" style={{ width: '20px', height: 'auto' }} />
                        <span className="app-brand-text demo menu-text fw-bold ms-2">SIGET</span>
                    </Link>
                </div>
                <div className="menu-inner-shadow"></div>
                <ul className="menu-inner py-1">
                    <li className="menu-header small text-uppercase">
                        <span className="menu-header-text">Usuario</span>
                    </li>

                    {/* ── Mi Perfil ──────────────────────────────────── */}
                    <li className={`menu-item ${isMiPerfilOpen ? 'open' : ''}`}>
                        <a className="menu-link menu-toggle" href="#" onClick={(e) => { e.preventDefault(); e.currentTarget.parentElement.classList.toggle('open'); }}>
                            <i className="menu-icon tf-icons bx bx-user"></i>
                            <div>Mi Perfil</div>
                        </a>
                        <ul className="menu-sub">
                            <li className={`menu-item ${currentView === 'perfil' ? 'active' : ''}`}>
                                <Link to="/visualizador?view=perfil" className="menu-link">
                                    <div>Mis datos</div>

                                </Link>
                            </li>
                            <li className={`menu-item ${currentView === 'antiguedades' ? 'active' : ''}`}>
                                <Link to="/visualizador?view=antiguedades" className="menu-link">
                                    <div>Antigüedades</div>
                                </Link>
                            </li>
                            <li className={`menu-item ${currentView === 'encargos' ? 'active' : ''}`}>
                                <Link to="/visualizador?view=encargos" className="menu-link">
                                    <div>Encargos Temporales</div>
                                </Link>
                            </li>
                        </ul>
                    </li>

                    {/* ── Nómina ─────────────────────────────────────── */}
                    <li className={`menu-item ${isNominaOpen ? 'open' : ''}`}>
                        <a className="menu-link menu-toggle" href="#" onClick={(e) => { e.preventDefault(); e.currentTarget.parentElement.classList.toggle('open'); }}>
                            <i className="menu-icon tf-icons bx bx-receipt"></i>
                            <div>Nómina</div>
                        </a>
                        <ul className="menu-sub">
                            <li className={`menu-item ${currentView === 'nomina' ? 'active' : ''}`}>
                                <Link to="/visualizador?view=nomina" className="menu-link">
                                    <div>Nómina Mensual</div>
                                    <small className="text-muted d-block">Historial de pagos</small>
                                </Link>
                            </li>
                            <li className={`menu-item ${currentView === 'vacaciones' ? 'active' : ''}`}>
                                <Link to="/visualizador?view=vacaciones" className="menu-link">
                                    <div>Vacaciones</div>
                                    <small className="text-muted d-block">Historial de fechas de disfrute</small>
                                </Link>
                            </li>
                        </ul>
                    </li>

                    {/* ── Constancias ────────────────────────────────── */}
                    <li className={`menu-item ${currentView === 'constancia' ? 'open' : ''}`}>
                        <a className="menu-link menu-toggle" href="#" onClick={(e) => { e.preventDefault(); e.currentTarget.parentElement.classList.toggle('open'); }}>
                            <i className="menu-icon tf-icons bx bx-file"></i>
                            <div>Constancias</div>
                        </a>
                        <ul className="menu-sub">
                            <li className={`menu-item ${currentView === 'constancia' ? 'active' : ''}`}>
                                <Link to="/visualizador?view=constancia" className="menu-link" aria-label="Generar constancia de trabajo">
                                    <i className="bx bxs-file-pdf me-1 text-danger"></i>
                                    <div>Constancia de Trabajo</div>
                                </Link>
                            </li>
                        </ul>
                    </li>
                </ul>
            </aside>
        );
    }

    // ── Sidebar estándar para todos los roles con acceso administrativo ──────
    return (
        <aside id="layout-menu" className="layout-menu menu-vertical menu bg-menu-theme">
            <div className="app-brand demo">
                <Link aria-label='Navigate to sneat homepage' to="/Dashboard" className="app-brand-link">
                    <img src={logoContraloria} alt="sneat-logo" style={{ width: '20px', height: 'auto' }} />
                    <span className="app-brand-text demo menu-text fw-bold ms-2">SIGET</span>
                </Link>

                <a href="#" className="layout-menu-toggle menu-link text-large ms-auto d-block d-xl-none">
                    <i className="bx bx-chevron-left bx-sm align-middle"></i>
                </a>
            </div>

            <div className="menu-inner-shadow"></div>

            <ul className="menu-inner py-1">
                {filteredMenuData.map((section, sectionIndex) => (
                    <React.Fragment key={`section-${sectionIndex}`}>
                        {section.header && (
                            <li className="menu-header small text-uppercase">
                                <span className="menu-header-text">{section.header}</span>
                            </li>
                        )}
                        {section.items.map((item, itemIndex) => (
                            <MenuItem key={`item-${sectionIndex}-${itemIndex}`} item={item} />
                        ))}
                    </React.Fragment>
                ))}
            </ul>
        </aside>
    );
};

// Enlace simple para el sidebar del Visualizador
const SidebarLink = ({ to, icon, label }) => {
    const location = useLocation();
    const isActive = (location.pathname + location.search) === to || (to === '/visualizador?tab=datos-laborales' && location.pathname === '/visualizador' && location.search === '');
    return (
        <li className={`menu-item ${isActive ? 'active' : ''}`}>
            <Link to={to} className="menu-link" aria-label={`Navigate to ${label}`}>
                <i className={`menu-icon tf-icons ${icon}`}></i>
                <div>{label}</div>
            </Link>
        </li>
    );
};

const MenuItem = ({ item }) => {
    const location = useLocation();
    const isActive = location.pathname === item.link;
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isSubmenuActive = hasSubmenu && item.submenu.some(subitem => location.pathname === subitem.link);

    if (!item.available) return null;

    return (
        <li className={`menu-item ${isActive || isSubmenuActive ? 'active' : ''} ${hasSubmenu && isSubmenuActive ? 'open' : ''}`}>
            <NavLink
                aria-label={`Navigate to ${item.text}`}
                to={item.link}
                className={`menu-link ${item.submenu ? 'menu-toggle' : ''}`}
                target={item.link.includes('http') ? '_blank' : undefined}
            >
                <i className={`menu-icon tf-icons ${item.icon}`}></i>
                <div>{item.text}</div>
            </NavLink>
            {hasSubmenu && (
                <ul className="menu-sub">
                    {item.submenu.map((subItem, subIndex) => (
                        <MenuItem key={`subitem-${subIndex}`} item={subItem} />
                    ))}
                </ul>
            )}
        </li>
    );
};

export default Sidebar;
