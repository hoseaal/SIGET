import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import menuData from '../data/menuData.json';
import { menuPermissions } from '../data/dataPermissions';

const Sidebar = () => {
    const [userType, setUserType] = useState(null);
    const [filteredMenuData, setFilteredMenuData] = useState([]);

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
        const fetchUserData = async () => {
            try {
                const userRes = await fetch('/api/sp/auth/verify-auth', { credentials: 'include' });
                if (!userRes.ok) throw new Error('No autorizado.');
                const userDataResult = await userRes.json();
                if (!userDataResult.success) throw new Error(userDataResult.message || 'Error desconocido al verificar usuario.');
                
                const currentUserType = userDataResult.user.rol_id;
                setUserType(currentUserType);
                setFilteredMenuData(filterMenuByUserType(menuData, currentUserType));
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);

    return (
        <aside id="layout-menu" className="layout-menu menu-vertical menu bg-menu-theme">
            <div className="app-brand demo">
                <Link aria-label='Navigate to sneat homepage' to="/Dashboard" className="app-brand-link">
                    <img src="../../../assets/img/logo-contraloria-home2.png" alt="sneat-logo" style={{ width: '20px', height: 'auto' }}/>
                    <span className="app-brand-text demo menu-text fw-bold ms-2">SIGET</span>
                </Link>

                <a href="#" role="button" aria-label="Cerrar menú lateral" className="layout-menu-toggle menu-link text-large ms-auto d-block d-xl-none">
                    <i className="bx bx-chevron-left bx-sm align-middle" aria-hidden="true"></i>
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
                <i className={`menu-icon tf-icons ${item.icon}`} aria-hidden="true"></i>
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