<!-- Menu -->
<aside id="layout-menu" class="layout-menu menu-vertical menu bg-menu-theme">
    <div class="app-brand demo">
        <a href="<?php echo ($GLOBALS['decoded']->data->tipo == '4') ? 'index.php' : 'index_usur.php'; ?>" class="app-brand-link">
            <span class="app-brand-logo demo"></span>
            <span class="app-brand-text demo menu-text fw-bolder ms-2" style="text-transform: uppercase;">SIGET</span>
        </a>

        <a href="javascript:void(0);" class="layout-menu-toggle menu-link text-large ms-auto d-block d-xl-none">
            <i class="bx bx-chevron-left bx-sm align-middle"></i>
        </a>
    </div>

    <div class="menu-inner-shadow"></div>

    <ul class="menu-inner py-1">
        <!-- Dashboard -->
        <li class="menu-item active">
            <a href="<?php echo ($GLOBALS['decoded']->data->tipo == '4') ? 'index.php' : 'index_usur.php'; ?>" class="menu-link">
                <i class="menu-icon tf-icons bx bx-home-circle"></i>
                <div data-i18n="Analytics">INICIO</div>
            </a>
        </li>

        <?php if ($GLOBALS['decoded']->data->tipo == '4' || $GLOBALS['decoded']->data->tipo == '3' || $GLOBALS['decoded']->data->tipo == '2' || $GLOBALS['decoded']->data->tipo == '1'): ?>
        <li class="menu-item">
            <a href="javascript:void(0);" class="menu-link menu-toggle">
                <i class="menu-icon tf-icons bx bx-user-circle"></i>
                <div data-i18n="usuarios">Usuarios</div>
            </a>
            <ul class="menu-sub">
                <?php if ($GLOBALS['decoded']->data->tipo == '4' || $GLOBALS['decoded']->data->tipo == '3' || $GLOBALS['decoded']->data->tipo == '2'): ?>
                <li class="menu-item">
                    <a href="Register-NewUser.php" class="menu-link">
                        <div data-i18n="Basic">Añadir Nuevo Trabajador</div>
                    </a>
                </li>
                <?php endif; ?>
                
                <?php if ($GLOBALS['decoded']->data->tipo == '4'): ?>
                <li class="menu-item">
                    <a href="auth-register-basic.php" class="menu-link">
                        <div data-i18n="Basic">Registrar Usuario</div>
                    </a>
                </li>
                <?php endif; ?>
                
                <?php if ($GLOBALS['decoded']->data->tipo == '4' || $GLOBALS['decoded']->data->tipo == '3' || $GLOBALS['decoded']->data->tipo == '2' || $GLOBALS['decoded']->data->tipo == '1'): ?>
                <li class="menu-item">
                    <a href="Register-AntUser.php" class="menu-link">
                        <div data-i18n="Basic">Registro de Antigüedades</div>
                    </a>
                </li>
                <?php endif; ?>
            </ul>
        </li>
        <?php endif; ?>

        <?php if ($GLOBALS['decoded']->data->tipo == '4' || $GLOBALS['decoded']->data->tipo == '3' || $GLOBALS['decoded']->data->tipo == '2' || $GLOBALS['decoded']->data->tipo == '1' || $GLOBALS['decoded']->data->tipo == '0'): ?>
        <li class="menu-item">
            <a href="javascript:void(0);" class="menu-link menu-toggle">
                <i class="menu-icon tf-icons bx bx-folder-open"></i>
                <div data-i18n="salarios">Gestión de Presupuesto</div>
            </a>
            <ul class="menu-sub">
                <?php if ($GLOBALS['decoded']->data->tipo == '4' || $GLOBALS['decoded']->data->tipo == '3' || $GLOBALS['decoded']->data->tipo == '2' || $GLOBALS['decoded']->data->tipo == '1' || $GLOBALS['decoded']->data->tipo == '0'): ?>
                <li class="menu-item">
                    <a href="Table_Nomina.php" class="menu-link">
                        <div data-i18n="Basic">Tabla Trabajadores</div>
                    </a>
                </li>
                <?php endif; ?>
                
                <?php if ($GLOBALS['decoded']->data->tipo == '4' || $GLOBALS['decoded']->data->tipo == '1'): ?>
                <li class="menu-item">
                    <a href="Table_User.php" class="menu-link">
                        <div data-i18n="Basic">Tabla Usuarios</div>
                    </a>
                </li>
                <?php endif; ?>
                
                <?php if ($GLOBALS['decoded']->data->tipo == '4' || $GLOBALS['decoded']->data->tipo == '3' || $GLOBALS['decoded']->data->tipo == '2' || $GLOBALS['decoded']->data->tipo == '1' || $GLOBALS['decoded']->data->tipo == '0'): ?>
                <li class="menu-item">
                    <a href="Tables_Cargos.php" class="menu-link">
                        <div data-i18n="Basic">Cargos</div>
                    </a>
                </li>
                <?php endif; ?>
                
                <?php if ($GLOBALS['decoded']->data->tipo == '4' || $GLOBALS['decoded']->data->tipo == '3' || $GLOBALS['decoded']->data->tipo == '2' || $GLOBALS['decoded']->data->tipo == '1'): ?>
                <li class="menu-item">
                    <a href="Table_NvlSalarial.php" class="menu-link">
                        <div data-i18n="Basic">Niveles Salariales</div>
                    </a>
                </li>
                <?php endif; ?>
                
                <?php if ($GLOBALS['decoded']->data->tipo == '4' || $GLOBALS['decoded']->data->tipo == '3' || $GLOBALS['decoded']->data->tipo == '2'): ?>
                <li class="menu-item">
                    <a href="Table_NvlSalarial-Hist.php" class="menu-link">
                        <div data-i18n="Basic">Histórico de Niveles Salariales</div>
                    </a>
                </li>
                <?php endif; ?>
                
                <?php if ($GLOBALS['decoded']->data->tipo == '4' || $GLOBALS['decoded']->data->tipo == '3' || $GLOBALS['decoded']->data->tipo == '2'): ?>
                <li class="menu-item">
                    <a href="Table_suplencias.php" class="menu-link">
                        <div data-i18n="Basic">Suplencias de los Trabajadores</div>
                    </a>
                </li>
                <?php endif; ?>
                
                <?php if ($GLOBALS['decoded']->data->tipo == '4' || $GLOBALS['decoded']->data->tipo == '1' || $GLOBALS['decoded']->data->tipo == '3' || $GLOBALS['decoded']->data->tipo == '2'): ?>
                <li class="menu-item">
                    <a href="Tabla_cajaahorrop.php" class="menu-link">
                        <div data-i18n="Basic">Caja de Ahorro Patronal</div>
                    </a>
                </li>
                <?php endif; ?>
                
                <?php if ($GLOBALS['decoded']->data->tipo == '4' || $GLOBALS['decoded']->data->tipo == '1' || $GLOBALS['decoded']->data->tipo == '3' || $GLOBALS['decoded']->data->tipo == '2'): ?>
                <li class="menu-item">
                    <a href="Table_deduc.php" class="menu-link">
                        <div data-i18n="Basic">Deducciones</div>
                    </a>
                </li>
                <?php endif; ?>
                
                <?php if ($GLOBALS['decoded']->data->tipo == '4' || $GLOBALS['decoded']->data->tipo == '1' || $GLOBALS['decoded']->data->tipo == '3' || $GLOBALS['decoded']->data->tipo == '2'): ?>
                <li class="menu-item">
                    <a href="Table_Asig.php" class="menu-link">
                        <div data-i18n="Basic">Asignaciones</div>
                    </a>
                </li>
                <?php endif; ?>
            </ul>
        </li>
        <?php endif; ?>

        <?php if ($GLOBALS['decoded']->data->tipo == '4'): ?>
        <li class="menu-item">
            <a href="javascript:void(0);" class="menu-link menu-toggle">
                <i class="menu-icon tf-icons bx bx-lock-open"></i>
                <div data-i18n="permisos">Privilegios</div>
            </a>
            <ul class="menu-sub">
                <li class="menu-item">
                    <a href="Vista_roles.php" class="menu-link">
                        <div data-i18n="Basic">Vista de Permisos</div>
                    </a>
                </li>
                <li class="menu-item">
                    <a href="Table_Mod.php" class="menu-link">
                        <div data-i18n="Basic">Tabla de Modificaciones</div>
                    </a>
                </li>
            </ul>
        </li>
        <?php endif; ?>
    </ul>
</aside>
<!-- / Menu -->