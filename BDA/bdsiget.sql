-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 02-04-2025 a las 17:12:35
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30
DROP DATABASE IF EXISTS `dbsiget`;
CREATE DATABASE IF NOT EXISTS `dbsiget`;
USE `dbsiget`;

--
-- Base de datos: `dbsiget`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tesant`
--

CREATE TABLE `tesant` (
  `ant_ide` int(11) NOT NULL COMMENT 'Identificador único de antigüedad',
  `ant_ani` DATE NOT NULL COMMENT 'Años de antigüedad inicial',
  `ant_anf` DATE NOT NULL COMMENT 'Años de antigüedad final',
  `nom_ced` varchar(10) NOT NULL COMMENT 'Cédula del empleado'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Estructura de tabla para la tabla `tescae`
--

CREATE TABLE `tescae` (
  `cae_ide` INT(11) NOT NULL COMMENT 'Identificador de categoría especifica',
  `cae_cae` varchar(100) NOT NULL COMMENT 'descripcion de categoría especifica',
  `sca_ide` INT(11) NOT NULL COMMENT 'Referencia a subcategoría en tessca'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tescet`
--

CREATE TABLE `tescet` (
  `cet_ide` int(11) NOT NULL COMMENT 'Identificador único de cargo CET',
  `cet_car` varchar(50) NOT NULL COMMENT 'Nombre del cargo CET'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Estructura de tabla para la tabla `tesded`
--

CREATE TABLE `tesded` (
  `ded_ide` int(11) NOT NULL COMMENT 'Identificador único de deducción',
  `ded_raz` varchar(100) NOT NULL COMMENT 'Razón de la deducción',
  `ded_por` decimal(10,2) NOT NULL COMMENT 'Porcentaje de la deducción'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tesdep`
--

CREATE TABLE `tesdep` (
  `dep_ide` int(11) NOT NULL COMMENT 'Identificador único de departamento',
  `dep_nom` varchar(255) NOT NULL COMMENT 'Nombre del departamento',
  `dep_des` text DEFAULT NULL COMMENT 'Descripción del departamento'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Estructura de tabla para la tabla `tesmod`
--

CREATE TABLE `tesmod` (
  `mod_ide` varchar(10) NOT NULL COMMENT 'Identificador de modelo',
  `mod_mod` varchar(50) NOT NULL COMMENT 'descripcion de modelo',
  `mar_ide` int(11) NOT NULL COMMENT 'Referencia a marca en tmamar'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tesona`
--

CREATE TABLE `tesona` (
  `ona_ide` int(11) NOT NULL COMMENT 'Identificador único de cargo ONAPRE',
  `ona_car` varchar(50) NOT NULL COMMENT 'Nombre del cargo ONAPRE'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Estructura de tabla para la tabla `tesnvl`
--

CREATE TABLE `tesnvl` (
  `nvl_ide` int(11) NOT NULL COMMENT 'Identificador único del rango',
  `nvl_ran` varchar(5) NOT NULL COMMENT 'Tipo de nivel salarial',
  `nvl_sal` decimal(10,2) NOT NULL COMMENT 'Salario Correspondiente',
  `ona_ide` int(11) DEFAULT NULL COMMENT 'Referencia a cargo ONAPRE en tesona'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Estructura de tabla para la tabla `tesnvl_historico`
--

CREATE TABLE `tesnvl_historico` (
  `nvl_ide` int(11) NOT NULL,
  `nvl_ran` varchar(5) NOT NULL,
  `nvl_sal` decimal(10,2) NOT NULL COMMENT 'Salario histórico',
  `ona_ide` int(11) DEFAULT NULL,
  `nvl_fec` date NOT NULL COMMENT 'Fecha en la que este salario estaba activo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tespri`
--

CREATE TABLE `tespri` (
  `pri_ide` int(11) NOT NULL COMMENT 'Identificador único de prima',
  `pri_raz` varchar(100) NOT NULL COMMENT 'Razón de la prima',
  `pri_por` decimal(5,2) NOT NULL COMMENT 'Porcentaje de la prima'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tessca`
--

CREATE TABLE `tessca` (
  `sca_ide` INT(11) NOT NULL COMMENT 'Identificador de sub-categoria',
  `sca_sca` varchar(100) NOT NULL COMMENT 'descripcion de sub-categoria',
  `cat_ide` INT(11) NOT NULL COMMENT 'Referencia a categoría en tmacat'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tesusu`
--

CREATE TABLE `tesusu` (
  `usu_ide` varchar(10) NOT NULL COMMENT 'Identificador unico del usuario',
  `usu_usu` varchar(10) NOT NULL COMMENT 'Nickname del usuario',
  `usu_con` varchar(255) NOT NULL COMMENT 'Contraseña del usuario (hashed)',
  `usu_nom` varchar(50) NOT NULL COMMENT 'Nombres del Usuario',
  `usu_ape` varchar(50) NOT NULL COMMENT 'Apellidos del usuario',
  `usu_tip` int(1) NOT NULL COMMENT 'Perfil o tipo de usuario',
  `usu_mod` int(2) NOT NULL COMMENT 'Módulos de acceso',
  `nom_ced` varchar(10) DEFAULT NULL COMMENT 'Cédula del empleado, usado en caso tal como referencia a empleado en tmanom',
  UNIQUE (`usu_usu`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Estructura de tabla para la tabla `tmab_m`
--

CREATE TABLE `tmab_m` (
  `bim_ide` varchar(10) NOT NULL COMMENT 'Codigo interno del bien',
  `bim_des` text NOT NULL COMMENT 'Descripcion del bien',
  `bim_fec` date NOT NULL COMMENT 'Fecha de adquisicion del bien',
  `bim_ndo` varchar(10) NOT NULL COMMENT 'Numero de documento (factura) del bien',
  `bim_val` decimal(10,0) NOT NULL COMMENT 'Valor monetario de adquisicion del bien ',
  `bim_moneda` varchar(10) NOT NULL COMMENT 'Moneda en la que esta el valor del bien (Bolivares)',
  `bim_color` varchar(30) NOT NULL COMMENT 'Color del bien',
  `bim_ser` varchar(30) NOT NULL COMMENT 'Serial del bien',
  `bim_cod` varchar(20) NOT NULL COMMENT 'Codigo de SUDEBIN del bien mueble',
  `bim_obs` text COMMENT 'Observacion del bien',
  `bim_sede` varchar(20) NOT NULL COMMENT 'Sede en la que se encuentra el bien (PRINCIPAL)',
  `est_ide` int(11) NOT NULL COMMENT 'Referencia a estado en tmaest',
  `foa_ide` int(11) NOT NULL COMMENT 'Referencia a forma adquisición en tmafoa',
  `con_ide` int(11) NOT NULL COMMENT 'Referencia a condición en tmacon',
  `esu_ide` int(11) NOT NULL COMMENT 'Referencia a estado uso en tmaesu',
  `mod_ide` varchar(10) DEFAULT NULL COMMENT 'Referencia a modelo en tesmod',
  `cae_ide` INT(11) DEFAULT NULL COMMENT 'Referencia a categoría específica en tescae',
  `bim_inc` TINYINT(1) DEFAULT 1 COMMENT "Estado de Bien incorporado(1) o desincoparado(0)",
  `bim_fed` date DEFAULT NULL COMMENT "fecha de desincorporación"
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tmacat`
--

CREATE TABLE `tmacat` (
  `cat_ide` INT NOT NULL COMMENT 'Identificador de categoria',
  `cat_cat` varchar(100) NOT NULL COMMENT 'descripcion del categoria'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tmacon`
--

CREATE TABLE `tmacon` (
  `con_ide` int(11) NOT NULL COMMENT 'Identificador de condicion fisica del bien',
  `con_con` varchar(50) NOT NULL COMMENT 'Descripcion de  condicion fisica del bien'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tmaest`
--

CREATE TABLE `tmaest` (
  `est_ide` int(11) NOT NULL COMMENT 'Identificador de status del bien',
  `est_est` varchar(50) NOT NULL COMMENT 'Descripcion de status del bien'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tmaesu`
--

CREATE TABLE `tmaesu` (
  `esu_ide` int(11) NOT NULL COMMENT 'Identificador de estados de uso del bien',
  `esu_esu` varchar(50) NOT NULL COMMENT 'Descripcion de  estados de uso del bien'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tmafoa`
--

CREATE TABLE `tmafoa` (
  `foa_ide` int(11) NOT NULL COMMENT 'Identificador de forma de adquisicion',
  `foa_nom` varchar(50) NOT NULL COMMENT 'Descripcion de forma de adquisicion'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tmamar`
--

CREATE TABLE `tmamar` (
  `mar_ide` int(11) NOT NULL COMMENT 'Identificador único de marca',
  `mar_mar` varchar(100) NOT NULL COMMENT 'Descripcion de la marca'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tmanom`
--

CREATE TABLE `tmanom` (
  `nom_ced` varchar(10) NOT NULL COMMENT 'Cédula del empleado',
  `nom_nom` varchar(50) NOT NULL COMMENT 'Nombre del empleado',
  `nom_ape` varchar(50) NOT NULL COMMENT 'Apellido del empleado',
  `nom_fec` date NOT NULL COMMENT 'Fecha de ingreso',
  `nom_gen` enum('M','F') NOT NULL COMMENT 'Género del empleado',
  `nom_nhi` int(11) NOT NULL COMMENT 'Número de hijos',
  `nom_pro` int(1) NOT NULL COMMENT 'Valor de profesionalización',
  `cet_ide` int(11) NOT NULL COMMENT 'Referencia a cargo CET en tescet',
  `ona_ide` int(11) NOT NULL COMMENT 'Referencia a cargo ONAPRE en tesona',
  `nvl_ran` varchar(3) NOT NULL COMMENT 'Referencia a Tipo de nivel salarial',
  `dep_ide` int(11) NOT NULL COMMENT 'Referencia a departamento en tesdep'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Estructura de tabla para la tabla `testip`
--

CREATE TABLE `testip` ( 
  `usu_tip` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador AI de tipos de usuario', 
  `tip_nom` varchar(50) NOT NULL COMMENT 'Nombre de usuario' 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci; 

ALTER TABLE `testip` AUTO_INCREMENT = 0;

--
-- Estructura de tabla para la tabla `tesacc`
--

CREATE TABLE `tesacc` ( 
  `usu_mod` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador AI de tipos de acceso', 
  `acc_nom` varchar(50) NOT NULL COMMENT 'Acceso al sistema' 
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci; 

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `tesant`
--
ALTER TABLE `tesant`
  ADD PRIMARY KEY (`ant_ide`);

--
-- Indices de la tabla `tescae`
--
ALTER TABLE `tescae`
  ADD PRIMARY KEY (`cae_ide`),
  ADD KEY `fk_tescae_tessca` (`sca_ide`);

--
-- Indices de la tabla `tescet`
--
ALTER TABLE `tescet`
  ADD PRIMARY KEY (`cet_ide`);

--
-- Indices de la tabla `tesded`
--
ALTER TABLE `tesded`
  ADD PRIMARY KEY (`ded_ide`);

--
-- Indices de la tabla `tesdep`
--
ALTER TABLE `tesdep`
  ADD PRIMARY KEY (`dep_ide`);

--
-- Indices de la tabla `tesmod`
--
ALTER TABLE `tesmod`
  ADD PRIMARY KEY (`mod_ide`),
  ADD KEY `fk_tesmod_tmamar` (`mar_ide`);

--
-- Indices de la tabla `tesona`
--
ALTER TABLE `tesona`
  ADD PRIMARY KEY (`ona_ide`);

--
-- Indices de la tabla `tesnvl`
--

ALTER TABLE `tesnvl`
  ADD PRIMARY KEY (`nvl_ide`);

ALTER TABLE `tesnvl_historico`
  ADD PRIMARY KEY (`nvl_ide`);

--
-- Indices de la tabla `tespri`
--
ALTER TABLE `tespri`
  ADD PRIMARY KEY (`pri_ide`);

--
-- Indices de la tabla `tessca`
--
ALTER TABLE `tessca`
  ADD PRIMARY KEY (`sca_ide`),
  ADD KEY `fk_tessca_tmacat` (`cat_ide`);

--
-- Indices de la tabla `tesusu`
--
ALTER TABLE `tesusu`
  ADD PRIMARY KEY (`usu_ide`),
  ADD UNIQUE KEY `nom_ced` (`nom_ced`);

--
-- Indices de la tabla `tmab_m`
--
ALTER TABLE `tmab_m`
  ADD PRIMARY KEY (`bim_ide`),
  ADD KEY `fk_tmabm_tmaest` (`est_ide`),
  ADD KEY `fk_tmabm_tmafoa` (`foa_ide`),
  ADD KEY `fk_tmabm_tmacon` (`con_ide`),
  ADD KEY `fk_tmabm_tmaesu` (`esu_ide`),
  ADD KEY `fk_tmabm_tesmod` (`mod_ide`),
  ADD KEY `fk_tmabm_tescae` (`cae_ide`);

--
-- Indices de la tabla `tmacat`
--
ALTER TABLE `tmacat`
  ADD PRIMARY KEY (`cat_ide`);

--
-- Indices de la tabla `tmacon`
--
ALTER TABLE `tmacon`
  ADD PRIMARY KEY (`con_ide`);

--
-- Indices de la tabla `tmaest`
--
ALTER TABLE `tmaest`
  ADD PRIMARY KEY (`est_ide`);

--
-- Indices de la tabla `tmaesu`
--
ALTER TABLE `tmaesu`
  ADD PRIMARY KEY (`esu_ide`);

--
-- Indices de la tabla `tmafoa`
--
ALTER TABLE `tmafoa`
  ADD PRIMARY KEY (`foa_ide`);

--
-- Indices de la tabla `tmamar`
--
ALTER TABLE `tmamar`
  ADD PRIMARY KEY (`mar_ide`);

--
-- Indices de la tabla `tmanom`
--
ALTER TABLE `tmanom`
  ADD PRIMARY KEY (`nom_ced`),
  ADD KEY `ona_ide` (`ona_ide`),
  ADD KEY `fk_tmanom_tescet` (`cet_ide`),
  ADD KEY `fk_tmanom_tesdep` (`dep_ide`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `tesant`
--
ALTER TABLE `tesant`
  MODIFY `ant_ide` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único de antigüedad', AUTO_INCREMENT=1;

--
-- AUTO_INCREMENT de la tabla `tescet`
--
ALTER TABLE `tescet`
  MODIFY `cet_ide` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único de cargo CET', AUTO_INCREMENT=1;

--
-- AUTO_INCREMENT de la tabla `tesded`
--
ALTER TABLE `tesded`
  MODIFY `ded_ide` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único de deducción';

--
-- AUTO_INCREMENT de la tabla `tesdep`
--
ALTER TABLE `tesdep`
  MODIFY `dep_ide` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único de departamento', AUTO_INCREMENT=1;

--
-- AUTO_INCREMENT de la tabla `tesona`
--
ALTER TABLE `tesona`
  MODIFY `ona_ide` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único de cargo ONAPRE', AUTO_INCREMENT=1;

--
-- AUTO_INCREMENT de la tabla `tesnvl`
--
ALTER TABLE `tesnvl`
  MODIFY `nvl_ide` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del rango', AUTO_INCREMENT=1;

ALTER TABLE `tesnvl_historico`
  MODIFY `nvl_ide` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único del rango', AUTO_INCREMENT=1;

--
-- AUTO_INCREMENT de la tabla `tespri`
--
ALTER TABLE `tespri`
  MODIFY `pri_ide` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único de prima';

--
-- AUTO_INCREMENT de la tabla `tmamar`
--
ALTER TABLE `tmamar`
  MODIFY `mar_ide` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único de marca';

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `tescae`
--
ALTER TABLE `tescae`
  ADD CONSTRAINT `fk_tescae_tessca` FOREIGN KEY (`sca_ide`) REFERENCES `tessca` (`sca_ide`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Filtros para la tabla `tesmod`
--
ALTER TABLE `tesmod`
  ADD CONSTRAINT `fk_tesmod_tmamar` FOREIGN KEY (`mar_ide`) REFERENCES `tmamar` (`mar_ide`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Filtros para la tabla `tessca`
--
ALTER TABLE `tessca`
  ADD CONSTRAINT `fk_tessca_tmacat` FOREIGN KEY (`cat_ide`) REFERENCES `tmacat` (`cat_ide`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Modificación para AI para la tabla `tesusu`
--
ALTER TABLE `tesusu`
MODIFY `usu_ide` INT NOT NULL AUTO_INCREMENT COMMENT 'Identificador unico del usuario';

--
-- Ajuste para la tabla `tesusu`
--
ALTER TABLE `tesusu`
  ADD CONSTRAINT `fk_tesusu_roles` FOREIGN KEY (`usu_tip`) REFERENCES `testip` (`usu_tip`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Ajuste para la tabla `tesusu`
--
ALTER TABLE `tesusu`
  ADD CONSTRAINT `fk_tesusu_accesos` FOREIGN KEY (`usu_mod`) REFERENCES `tesacc` (`usu_mod`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Filtros para la tabla `tesant`
--
ALTER TABLE `tesant`
  ADD CONSTRAINT `fk_tesant_tmanom` FOREIGN KEY (`nom_ced`) REFERENCES `tmanom` (`nom_ced`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Filtros para la tabla `tmab_m`
--
ALTER TABLE `tmab_m`
  ADD CONSTRAINT `fk_tmabm_tescae` FOREIGN KEY (`cae_ide`) REFERENCES `tescae` (`cae_ide`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tmabm_tesmod` FOREIGN KEY (`mod_ide`) REFERENCES `tesmod` (`mod_ide`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tmabm_tmacon` FOREIGN KEY (`con_ide`) REFERENCES `tmacon` (`con_ide`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tmabm_tmaest` FOREIGN KEY (`est_ide`) REFERENCES `tmaest` (`est_ide`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tmabm_tmaesu` FOREIGN KEY (`esu_ide`) REFERENCES `tmaesu` (`esu_ide`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tmabm_tmafoa` FOREIGN KEY (`foa_ide`) REFERENCES `tmafoa` (`foa_ide`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Filtros para la tabla `tmanom`
--
ALTER TABLE `tmanom`
  ADD CONSTRAINT `fk_tmanom_tescet` FOREIGN KEY (`cet_ide`) REFERENCES `tescet` (`cet_ide`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tmanom_tesdep` FOREIGN KEY (`dep_ide`) REFERENCES `tesdep` (`dep_ide`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tmanom_tesona` FOREIGN KEY (`ona_ide`) REFERENCES `tesona` (`ona_ide`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `tesnvl`
--
ALTER TABLE `tesnvl`
  ADD CONSTRAINT `fk_tesnvl_tesona` FOREIGN KEY (`ona_ide`) REFERENCES `tesona` (`ona_ide`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `tesnvl_historico`
  ADD CONSTRAINT `fk_tesnvl_tesona2` FOREIGN KEY (`ona_ide`) REFERENCES `tesona` (`ona_ide`) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE `tmacom` (
  `com_ide` int(11) NOT NULL COMMENT 'Identificador de concepto de movimiento',
  `com_com` varchar(60) NOT NULL COMMENT 'Descripción de concepto de movimiento'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE `tmacom`
  ADD PRIMARY KEY (`com_ide`);

ALTER TABLE `tmab_m` ADD COLUMN `com_ide` int(11) COMMENT 'Referencia a concepto de movimiento en tmacom', ADD CONSTRAINT `fk_tmabm_tmacom` FOREIGN KEY (`com_ide`) REFERENCES `tmacom` (`com_ide`) ON DELETE RESTRICT ON UPDATE CASCADE;
COMMIT;

CREATE TABLE `tessup` (
  `sup_ide` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID único de suplencia',
  `nom_ced` varchar(10) NOT NULL COMMENT 'Cédula del empleado suplente (FK a tmanom)',
  `sup_fec_ini` date NOT NULL COMMENT 'Fecha de inicio de la suplencia',
  `sup_fec_fin` date DEFAULT NULL COMMENT 'Fecha de fin de la suplencia (NULL si está activa)',
  `cet_ide` int(11) DEFAULT NULL COMMENT 'Cargo CET que suple (FK a tescet)',
  `ona_ide` int(11) DEFAULT NULL COMMENT 'Cargo ONAPRE que suple (FK a tesona)',
  `nvl_ran` varchar(3) DEFAULT NULL COMMENT 'Nivel salarial durante la suplencia',
  `dep_ide` int(11) DEFAULT NULL COMMENT 'Departamento durante la suplencia (FK a tesdep)',
  `sup_activa` tinyint(1) DEFAULT 1 COMMENT 'Indicador de suplencia activa (1=activa, 0=inactiva)',
  PRIMARY KEY (`sup_ide`),
  FOREIGN KEY (`nom_ced`) REFERENCES `tmanom`(`nom_ced`),
  FOREIGN KEY (`cet_ide`) REFERENCES `tescet`(`cet_ide`),
  FOREIGN KEY (`ona_ide`) REFERENCES `tesona`(`ona_ide`),
  FOREIGN KEY (`dep_ide`) REFERENCES `tesdep`(`dep_ide`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tescep` (
  `cep_ide` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID único de Caja de Empleado Patronal',
  `cep_activa` tinyint(1) DEFAULT 1 COMMENT 'Indicador de caja de ahorro activa (1=activa, 0=inactiva)',
  `nom_ced` varchar(10) NOT NULL COMMENT 'Cédula del empleado suplente (FK a tmanom)',
  PRIMARY KEY (`cep_ide`),
  FOREIGN KEY (`nom_ced`) REFERENCES `tmanom`(`nom_ced`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE tmacue ( `cue_id` int NOT NULL COMMENT 'Identificador de relacion de cuenta de BM del mes anterior', `cue_cue` float(10.2) NOT NULL COMMENT 'Monto de relacion de cuenta de BM del mes anterior' );

ALTER TABLE `tmab_m` 
ADD COLUMN `dep_ide` INT NULL COMMENT 'Departamento al que pertenece el bien',
ADD CONSTRAINT `fk_bien_departamento` 
    FOREIGN KEY (`dep_ide`) REFERENCES `tesdep`(`dep_ide`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE;

CREATE TABLE `bit_usu` (
  `bit_id` INT AUTO_INCREMENT PRIMARY KEY,
  `bit_tabla` VARCHAR(50) NOT NULL COMMENT 'Nombre de la tabla afectada',
  `bit_operacion` ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL COMMENT 'Tipo de operación',
  `bit_usu_ide` VARCHAR(10) COMMENT 'ID de usuario afectado (usu_ide)',
  `bit_usu_usu` varchar(10) NOT NULL COMMENT 'Nickname del usuario afectado',
  `bit_usuario_responsable` VARCHAR(10) NOT NULL COMMENT 'Cédula del usuario que realizó el cambio',
  `bit_detalles` JSON COMMENT 'Datos antiguos/nuevos',
  `bit_fecha` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha del cambio'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `bit_nom` (
  `bit_id` INT AUTO_INCREMENT PRIMARY KEY,
  `bit_tabla` VARCHAR(50) NOT NULL COMMENT 'Nombre de la tabla afectada (tmanom)',
  `bit_operacion` ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL COMMENT 'Tipo de operación',
  `bit_nom_ced` VARCHAR(10) COMMENT 'Cédula del empleado afectado',
  `bit_usuario_responsable` VARCHAR(10) NOT NULL COMMENT 'Cédula del usuario que realizó el cambio',
  `bit_detalles` JSON COMMENT 'Datos antiguos/nuevos',
  `bit_fecha` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha del cambio'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `bit_cet` (
  `bit_id` INT AUTO_INCREMENT PRIMARY KEY,
  `bit_tabla` VARCHAR(50) NOT NULL COMMENT 'Nombre de la tabla afectada',
  `bit_operacion` ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL COMMENT 'Tipo de operación',
  `bit_cet_ide` INT COMMENT 'ID de cargo CET afectado',
  `bit_usuario_responsable` VARCHAR(10) NOT NULL COMMENT 'Cédula del usuario que realizó el cambio',
  `bit_detalles` JSON COMMENT 'Datos antiguos/nuevos',
  `bit_fecha` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha del cambio'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `bit_ona` (
  `bit_id` INT AUTO_INCREMENT PRIMARY KEY,
  `bit_tabla` VARCHAR(50) NOT NULL COMMENT 'Nombre de la tabla afectada',
  `bit_operacion` ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL COMMENT 'Tipo de operación',
  `bit_ona_ide` INT COMMENT 'ID de cargo ONAPRE afectado',
  `bit_usuario_responsable` VARCHAR(10) NOT NULL COMMENT 'Cédula del usuario que realizó el cambio',
  `bit_detalles` JSON COMMENT 'Datos antiguos/nuevos',
  `bit_fecha` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha del cambio'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `bit_nvl` (
  `bit_id` INT AUTO_INCREMENT PRIMARY KEY,
  `bit_tabla` VARCHAR(50) NOT NULL COMMENT 'Nombre de la tabla afectada',
  `bit_operacion` ENUM('UPDATE', 'DELETE') NOT NULL COMMENT 'Tipo de operación',
  `bit_nvl_ide` INT COMMENT 'ID de nivel afectado (nvl_ide)',
  `bit_usuario_responsable` VARCHAR(10) NOT NULL COMMENT 'Cédula del usuario que realizó el cambio',
  `bit_detalles` JSON COMMENT 'Datos antiguos/nuevos',
  `bit_fecha` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha del cambio'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `bit_sup` (
  `bit_id` INT AUTO_INCREMENT PRIMARY KEY,
  `bit_tabla` VARCHAR(50) NOT NULL COMMENT 'Nombre de la tabla afectada (tessup)',
  `bit_operacion` ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL COMMENT 'Tipo de operación',
  `bit_sup_ide` INT COMMENT 'ID de suplencia afectada (sup_ide)',
  `bit_usuario_responsable` VARCHAR(10) NOT NULL COMMENT 'Cédula del usuario que realizó el cambio',
  `bit_detalles` JSON COMMENT 'Datos antiguos/nuevos',
  `bit_fecha` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha del cambio'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `bit_cep` (
  `bit_id` INT AUTO_INCREMENT PRIMARY KEY,
  `bit_tabla` VARCHAR(50) NOT NULL COMMENT 'Nombre de la tabla afectada (tescep)',
  `bit_operacion` ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL COMMENT 'Tipo de operación',
  `bit_cep_ide` INT COMMENT 'ID de registro afectado (cep_ide)',
  `bit_usuario_responsable` VARCHAR(10) NOT NULL COMMENT 'Cédula del usuario que realizó el cambio',
  `bit_detalles` JSON COMMENT 'Datos antiguos/nuevos',
  `bit_fecha` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha del cambio'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Bitácora de cambios en tescep';

CREATE TABLE `bit_ded` (
  `bit_id` INT AUTO_INCREMENT PRIMARY KEY,
  `bit_tabla` VARCHAR(50) NOT NULL COMMENT 'Nombre de la tabla afectada (tesded)',
  `bit_operacion` ENUM('UPDATE', 'DELETE') NOT NULL COMMENT 'Tipo de operación',
  `bit_ded_ide` INT COMMENT 'ID de deducción afectada (ded_ide)',
  `bit_usuario_responsable` VARCHAR(10) NOT NULL COMMENT 'Cédula del usuario que realizó el cambio',
  `bit_detalles` JSON COMMENT 'Datos antiguos/nuevos',
  `bit_fecha` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha del cambio'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `bit_pri` (
  `bit_id` INT AUTO_INCREMENT PRIMARY KEY,
  `bit_tabla` VARCHAR(50) NOT NULL COMMENT 'Nombre de la tabla afectada (tespri)',
  `bit_operacion` ENUM('UPDATE', 'DELETE') NOT NULL COMMENT 'Tipo de operación',
  `bit_pri_ide` INT NOT NULL COMMENT 'ID de prima afectada (pri_ide)',
  `bit_usuario_responsable` VARCHAR(10) NOT NULL COMMENT 'Cédula del usuario que realizó el cambio',
  `bit_detalles` JSON COMMENT 'Datos antiguos/nuevos',
  `bit_fecha` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha del cambio'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE ttrpre (
    pre_ide INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Identificador unico de prestamo',
    pre_fec DATE NOT NULL COMMENT 'fecha del prestamo',
    pre_ndo VARCHAR(50) NOT NULL UNIQUE COMMENT 'Número de documento (oficio)', 
    dep_ide INT NOT NULL COMMENT 'Departamento donde está prestado el bien (destino)', 
    pre_est TINYINT NOT NULL DEFAULT 1 COMMENT 'Estatus del préstamo (1: activo, 0: inactivo/devuelto)', 
    FOREIGN KEY (dep_ide) REFERENCES tesdep(dep_ide)
);

CREATE TABLE ttrdpr (
    dpr_ide INT PRIMARY KEY AUTO_INCREMENT COMMENT 'identificador unico de detalle del prestamo',
    pre_ide INT NOT NULL COMMENT 'ID del préstamo al que pertenece (clave foránea a ttrpre)',
    bim_ide VARCHAR(10) NOT NULL COMMENT 'ID del bien prestado (clave foránea a tmab_m)',
    dpr_est TINYINT NOT NULL DEFAULT 1 COMMENT 'Estatus del bien en el préstamo (1: prestado, 0: devuelto individualmente si fuera necesario)', -- 
    FOREIGN KEY (pre_ide) REFERENCES ttrpre(pre_ide),
    FOREIGN KEY (bim_ide) REFERENCES tmab_m(bim_ide),
    UNIQUE (bim_ide, dpr_ide) -- Un bien solo puede estar en un préstamo una vez
);

ALTER TABLE ttrpre
ADD COLUMN dep_origen_ide INT NOT NULL COMMENT 'Departamento de origen de los bienes en este prestamo',
ADD CONSTRAINT fk_ttrpre_dep_origen FOREIGN KEY (dep_origen_ide) REFERENCES tesdep(dep_ide);

CREATE TABLE rep_mensual (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT "Identificador único del registro.",
    anio INT NOT NULL COMMENT "El año al que corresponde el registro de cierre",
    mes INT NOT NULL COMMENT " El mes al que corresponde el registro de cierre",
    valor_existencia_anterior DECIMAL(18, 2) NOT NULL COMMENT "Aquí se guardará la suma total de los valores de los bienes que estaban activos al final del mes anterior",
    fecha_cierre DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT "La fecha y hora en que se realizó el cierre del mes",
    UNIQUE (anio, mes) -- Asegura que solo haya una entrada por mes
);

CREATE TABLE `bitb_m` (
    `bit_id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Identificador único del registro de bitácora',
    `usuario_id` INT DEFAULT NULL COMMENT 'ID del usuario que realizó la acción',
    `fecha_hora` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Marca de tiempo del cambio',
    `registro_id_afectado` VARCHAR(10) NOT NULL COMMENT 'ID del registro afectado en la tabla original (bim_ide)',
    `tipo_cambio` ENUM('INSERTO', 'ACTUALIZO', 'ELIMINO') NOT NULL COMMENT 'Tipo de operación (INSERT, UPDATE, DELETE)',
    `datos_antiguos` JSON COMMENT 'Estado del registro antes del cambio (en formato JSON)',
    `datos_nuevos` JSON COMMENT 'Estado del registro después del cambio (en formato JSON)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Bitácora de cambios para bienes muebles';

/* VOLCADO DE LA BASE DE DATOS */

-- TABLA TESCET

INSERT INTO `tescet` (`cet_car`) VALUES
('ABOGADO PI'),
('ABOGADO PII'),
('ANALISTA PI'),
('ANALISTA PII'),
('ASISTENTE ADMINISTRATIVO TSU I'),
('ASISTENTE ADMINISTRATIVO TSU II'),
('ASISTENTE DE TÉCNICO TSU II'),
('AUDITOR PI'),
('AUDITOR PII'),
('AUDITOR PIII'),
('AUXILIAR ADMINISTRATIVO BI'),
('AUXILIAR BI'),
('AUXILIAR BII'),
('AUXILIAR BIII'),
('CONSULTOR JURÍDICO'),
('CONTADOR PI'),
('DIRECTOR(A)(E) / ABOGADO PII - IV'),
('DIRECTOR(A)(E) / JEFE DE DIVISIÓN GENERAL'),
('DIRECTOR(A)(E) / JEFE DE DIVISIÓN'),
('DIRECTOR(A)'),
('DIRECTOR(A) DE LINEA'),
('DIRECTOR(A) GENERAL'),
('ENFERMERA'),
('JEFE DE DIVISIÓN'),
('JEFE DE DIVISIÓN(E) / ABOGADA PII - III'),
('JEFE DE DIVISIÓN GENERAL'),
('JEFE DE OFICINA'),
('MÉDICO'),
('NOTIFICADOR BIII'),
('ODONTÓLOGO'),
('PLANIFICADOR PI'),
('PROMOTOR SOCIAL TI'),
('SUPERVISOR'),
('CONTRALOR(A) DEL ESTADO');

-- TABLA TESONA

INSERT INTO `tesona` (`ona_car`) VALUES
('BACHILLER I (BI)'),
('BACHILLER II (BII)'),
('BACHILLER III (BIII)'),
('TSU I (TI)'),
('TSU II (TII)'),
('PROFESIONAL I (PI)'),
('PROFESIONAL II (PII)'),
('PROFESIONAL III (PIII)'),
('COORDINADOR(A) DE ÁREA'),
('DIRECTOR DE LINEA'),
('DIRECTOR GENERAL'),
('JEFE DE DIVISIÓN'),
('JEFE DE DIVISIÓN (COORDINADOR DE ÁREA)'),
('JEFE DE DIVISIÓN DE REMUNERACIONES'),
('JEFE DE DIVISIÓN GENERAL'),
('CONTRALOR(A) DEL ESTADO');

-- TABLA TESNVL

INSERT INTO `tesnvl` (`nvl_ran`, `nvl_sal`, `ona_ide`) VALUES
('I', 130.00, 1),
('II', 132.00, 1),
('III', 134.00, 1),
('IV', 135.00, 1),
('V', 137.00, 1),
('VI', 139.00, 1),
('VII', 141.00, 1),
('I', 148.00, 2),
('II', 150.00, 2),
('III', 152.00, 2),
('IV', 154.00, 2),
('V', 155.00, 2),
('VI', 157.00, 2),
('VII', 159.00, 2),
('I', 166.00, 3),
('II', 168.00, 3),
('III', 170.00, 3),
('IV', 172.00, 3),
('V', 174.00, 3),
('VI', 176.00, 3),
('VII', 177.00, 3),
('I', 192.00, 4),
('II', 194.00, 4),
('III', 196.00, 4),
('IV', 197.00, 4),
('V', 199.00, 4),
('VI', 201.00, 4),
('VII', 203.00, 4),
('I', 217.00, 5),
('II', 219.00, 5),
('III', 221.00, 5),
('IV', 223.00, 5),
('V', 225.00, 5),
('VI', 226.00, 5),
('VII', 228.00, 5),
('I', 246.00, 6),
('II', 248.00, 6),
('III', 250.00, 6),
('IV', 252.00, 6),
('V', 254.00, 6),
('VI', 256.00, 6),
('VII', 257.00, 6),
('I', 276.00, 7),
('II', 277.00, 7),
('III', 279.00, 7),
('IV', 281.00, 7),
('V', 283.00, 7),
('VI', 285.00, 7),
('VII', 287.00, 7),
('I', 305.00, 8),
('II', 307.00, 8),
('III', 308.00, 8),
('IV', 310.00, 8),
('V', 312.00, 8),
('VI', 314.00, 8),
('VII', 316.00, 8),
('I', 348.00, 9),
('I', 376.00, 10),
('I', 391.00, 11),
('I', 363.00, 12),
('I', 363.00, 13),
('I', 363.00, 14),
('I', 363.00, 15),
('I', 409.00, 16);

-- TABLA TESNVL HISTÓRICO

INSERT INTO `tesnvl_historico` (`nvl_ran`, `nvl_sal`, `ona_ide`, `nvl_fec`) VALUES
('I', 7.00, 1, '2021-05-01'),
('II', 7.14, 1, '2021-05-01'),
('III', 7.28, 1, '2021-05-01'),
('IV', 7.42, 1, '2021-05-01'),
('V', 7.56, 1, '2021-05-01'),
('VI', 7.70, 1, '2021-05-01'),
('VII', 7.84, 1, '2021-05-01'),
('I', 8.40, 2, '2021-05-01'),
('II', 8.54, 2, '2021-05-01'),
('III', 8.68, 2, '2021-05-01'),
('IV', 8.82, 2, '2021-05-01'),
('V', 8.96, 2, '2021-05-01'),
('VI', 9.10, 2, '2021-05-01'),
('VII', 9.24, 2, '2021-05-01'),
('I', 9.80, 3, '2021-05-01'),
('II', 9.94, 3, '2021-05-01'),
('III', 10.08, 3, '2021-05-01'),
('IV', 10.22, 3, '2021-05-01'),
('V', 10.36, 3, '2021-05-01'),
('VI', 10.50, 3, '2021-05-01'),
('VII', 10.64, 3, '2021-05-01'),
('I', 11.76, 4, '2021-05-01'),
('II', 11.90, 4, '2021-05-01'),
('III', 12.04, 4, '2021-05-01'),
('IV', 12.18, 4, '2021-05-01'),
('V', 12.32, 4, '2021-05-01'),
('VI', 12.46, 4, '2021-05-01'),
('VII', 12.60, 4, '2021-05-01'),
('I', 13.72, 5, '2021-05-01'),
('II', 13.86, 5, '2021-05-01'),
('III', 14.00, 5, '2021-05-01'),
('IV', 14.14, 5, '2021-05-01'),
('V', 14.28, 5, '2021-05-01'),
('VI', 14.42, 5, '2021-05-01'),
('VII', 14.56, 5, '2021-05-01'),
('I', 15.96, 6, '2021-05-01'),
('II', 16.10, 6, '2021-05-01'),
('III', 16.24, 6, '2021-05-01'),
('IV', 16.38, 6, '2021-05-01'),
('V', 16.52, 6, '2021-05-01'),
('VI', 16.66, 6, '2021-05-01'),
('VII', 16.80, 6, '2021-05-01'),
('I', 18.20, 7, '2021-05-01'),
('II', 18.34, 7, '2021-05-01'),
('III', 18.48, 7, '2021-05-01'),
('IV', 18.62, 7, '2021-05-01'),
('V', 18.76, 7, '2021-05-01'),
('VI', 18.90, 7, '2021-05-01'),
('VII', 19.04, 7, '2021-05-01'),
('I', 20.44, 8, '2021-05-01'),
('II', 20.58, 8, '2021-05-01'),
('III', 20.72, 8, '2021-05-01'),
('IV', 21.86, 8, '2021-05-01'),
('V', 21.00, 8, '2021-05-01'),
('VI', 21.14, 8, '2021-05-01'),
('VII', 21.28, 8, '2021-05-01'),
('I', 23.80, 9, '2021-05-01'),
('I', 25.90, 10, '2021-05-01'),
('I', 27.08, 11, '2021-05-01'),
('I', 24.92, 12, '2021-05-01'),
('I', 24.92, 13, '2021-05-01'),
('I', 24.92, 14, '2021-05-01'),
('I', 24.92, 15, '2021-05-01'),
('I', 28.48, 16, '2021-05-01');

-- TABLA TESDEP

INSERT INTO `tesdep` (`dep_nom`, `dep_des`) VALUES
  ('Despacho Contralor', 'Corresponde al Contralor o Contralora coordinar las acciones internas o externas que permitan a la Contraloría del Estado ejercer sus funciones de control, vigilancia y fiscalización del patrimonio público del Estado, de acuerdo con la Constitución de la República Bolivariana de Venezuela, Constitución del Estado Táchira, Ley Orgánica de la Contraloría General de la República y del Sistema Nacional de Control Fiscal, Ley de la Contraloría del Estado Táchira, el presente Reglamento Interno, y demás normativas nacionales y estadales que rigen la materia.'),

  ('Dirección de Secretaría del Despacho Contralor', 'Planifica y coordina todas aquellas actividades que coadyuven al cumplimiento y buen desempeño de los objetivos estratégicos del Órgano Contralor.'),

  ('Unidad de Auditoria Interna', 'Realiza el examen posterior, objetivo, sistemático y profesional, la evaluación del sistema de control interno establecido en la Contraloría del Estado, incluyendo el grado de operatividad y eficacia de los sistemas de administración y de información gerencial, así como del examen de los registros y estados financieros, para determinar su pertinencia, y confiabilidad en el marco de las operaciones realizadas. Asimismo le corresponde el ejercicio de las potestades de investigación fiscal y determinación de responsabilidades administrativas.'),

  ('Dirección General', 'Asiste al Contralor o Contralora del Estado en la planificación, coordinación, dirección y control de las funciones que de conformidad con las leyes debe cumplir la Contraloría del Estado, a través de cada una de las unidades administrativas que la conforman; así como la vigilancia en el cumplimiento de las políticas y objetivos establecidos por la institución.'),

  ('Dirección de Consultoria Jurídica', 'Asesora e interviene en todos los asuntos jurídicos relacionados con el Órgano Contralor, así como defiende los derechos e intereses de la Contraloría del Estado Táchira ante todas las autoridades de la República.'),

  ('Dirección Técnica', 'Actua como la unidad de asesoramiento técnico del Contralor o Contralora y de las diferentes unidades administrativas de la Contraloría en lo referente a las políticas, normas y procedimientos de control; planifica, organiza y desarrolla las actividades de la institución en lo referente a la informática; coordina en materia de cooperación técnica, así como fomenta y desarrolla normas, instrucciones y pautas técnicas para el funcionamiento del órgano contralor.'),

  ('Oficina de Seguridad', 'Planifica, coordina e implementa las políticas y acciones necesarias para garantizar la seguridad, custodia y salvaguarda de las instalaciones y personal de la Contraloría del Estado Táchira, de manera tal que asegure el normal funcionamiento de la institución.'),

  ('Dirección de Recursos Humanos', 'Planifica, coordina, ejecuta y controla las operaciones relacionadas con la administración del recurso humano, en particular, lo relacionado con el reclutamiento, selección, ingreso, clasificación, remuneración, desarrollo, evaluación, adiestramiento, registro, control y bienestar social del personal; además le corresponde la elaboración de planes de prevención y mejoramiento de la seguridad laboral y medio ambiente de trabajo, así como velar por el fortalecimiento de las relaciones públicas, políticas de comunicación, imagen e identidad corporativa del Órgano Contralor.'),

  ('Dirección de Administración', 'Planifica, coordina, dirige, ejecuta y supervisa las diferentes actividades en materia financiera y presupuestaria, servicios administrativos, así como, la guarda y custodia de los bienes muebles e inmuebles de la Contraloría.'),

  ('Oficina Atención al Público y Participación Ciudadana', 'Fomenta la participación ciudadana y el derecho de los ciudadanos a participar en el control sobre la gestión pública, promoviendo la formación y educación de las comunidades en el área del control fiscal y social, atendiendo sus iniciativas, reclamos, sugerencias, quejas, peticiones y denuncias.'),

  ('Oficina de Transporte y Servicios Generales', 'Planifica, coordina e implementa las políticas y acciones necesarias para garantizar la prestación de los servicios generales que aseguren el normal funcionamiento de la organización.'),

  ('Dirección de la Administración Central y Poder Legislativo', 'Coordina sistemas de control y evaluación gubernamental, para llevar a cabo el seguimiento y verificación del manejo racional, eficiente y eficaz de los recursos asignados a las dependencias de la Administración Central y el Poder Legislativo Estadal, mediante la práctica de revisiones, exámenes, inspecciones, auditorías e investigaciones de todo tipo, así como evaluar el cumplimiento y los resultados de sus políticas y acciones administrativas.'),

  ('Dirección de la Administración Descentralizada', 'Coordina sistemas de control y evaluación gubernamental, para llevar a cabo el seguimiento y verificación del manejo racional, eficiente y eficaz de los recursos asignados a las dependencias de la Administración Descentralizada, mediante la práctica de revisiones, exámenes, inspecciones, auditorías e investigaciones de todo tipo, así como evaluar el cumplimiento y los resultados de sus políticas y acciones administrativas.'),

  ('Dirección de Investigaciones', 'Realiza las actuaciones que sean necesarias a fin de verificar la ocurrencia de actos, hechos y omisiones contrarios a una norma legal o sublegal, vinculados con el manejo, custodia o administración de fondos y bienes públicos, determinar el monto de los daños causados al patrimonio, si fuere el caso, así como la procedencia de acciones fiscales.'),

  ('Dirección de Determinación de Responsabilidades', 'Realiza las actuaciones que sean necesarias a fin de verificar la ocurrencia de actos, hechos y omisiones contrarios a una norma legal o sublegal, vinculados con el manejo, custodia o administración de fondos y bienes públicos, determinar el monto de los daños causados al patrimonio, si fuere el caso, así como la procedencia de acciones fiscales.');

-- TABLA TESDED

INSERT INTO tesded (ded_raz, ded_por) 
  VALUES 
  ('Seguro del Empleado', 4),
  ('Seguro Patronal', 9),
  ('R.P.E Empleado', 0.50),
  ('R.P.E Patronal', 2),
  ('F.A.O.V Empleado', 1),
  ('F.A.O.V Patronal', 200),
  ('F.E.J.P Empleado y Patronal', 3),
  ('Caja Empleado y Patronal', 10);

-- TABLA TESPRI

INSERT INTO `tespri` (`pri_raz`, `pri_por`) VALUES
('Prima por Transporte', 48.00),
('Prima por hogares', 40.00),
('Complemento de Alimentación', 5.00),
('Prima por Hijos', 12.50);

-- TABLA TESTIP

INSERT INTO `testip` (`tip_nom`) VALUES
('Visualizador'),
('Temporal'),
('Trabajador'),
('Jefe de Area'),
('Administrador');

-- TABLA TESACC

INSERT INTO `tesacc` (`acc_nom`) VALUES
('Acceso Global'),
('Módulo de Recursos Humanos'),
('Módulo de Bienes');

-- TABLA TMANOM (Contralor: Luis Aguilar DATA REAL)

INSERT INTO `tmanom` (`nom_ced`, `nom_nom`, `nom_ape`, `nom_fec`, `nom_gen`, `nom_nhi`, `nom_pro`, `cet_ide`, `ona_ide`, `nvl_ran`, `dep_ide`) VALUES 
('18845038', 'LUIS ALEJANDRO', 'AGUILAR MONTILVA', '2023-02-01', 'M', '1', '2', '34', '16', 'I', '1');

-- TABLA TMANOM (Directora General: Eliana Ramirez DATA REAL)

INSERT INTO `tmanom` (`nom_ced`, `nom_nom`, `nom_ape`, `nom_fec`, `nom_gen`, `nom_nhi`, `nom_pro`, `cet_ide`, `ona_ide`, `nvl_ran`, `dep_ide`) VALUES ('17368181', 'ELIANA CRISTINA', 'RAMIREZ DE GUERRERO', '2023-11-01', 'F', '2', '2', '22', '11', 'I', '4');

-- TABLA TMANOM (Jefe de RRHH: Luis Arias DATA REAL)

INSERT INTO `tmanom` (`nom_ced`, `nom_nom`, `nom_ape`, `nom_fec`, `nom_gen`, `nom_nhi`, `nom_pro`, `cet_ide`, `ona_ide`, `nvl_ran`, `dep_ide`) VALUES ('15028510', 'LUIS GERARDO', 'ARIAS NIÑO', '2019-02-18', 'M', '1', '2', '24', '9', 'I', '8');

-- TABLA TMANOM (Jefe de Bienes: Ender Mogollon DATA REAL)

INSERT INTO `tmanom` (`nom_ced`, `nom_nom`, `nom_ape`, `nom_fec`, `nom_gen`, `nom_nhi`, `nom_pro`, `cet_ide`, `ona_ide`, `nvl_ran`, `dep_ide`) VALUES ('26403363', 'ENDER NICOLAY', 'MOGOLLON MARQUEZ', '2021-03-16', 'M', '0', '2', '26', '12', 'I', '9');

-- TABLA TMANOM (Jefe Área Técnica: Jesus Salamanca DATA REAL)

INSERT INTO `tmanom` (`nom_ced`, `nom_nom`, `nom_ape`, `nom_fec`, `nom_gen`, `nom_nhi`, `nom_pro`, `cet_ide`, `ona_ide`, `nvl_ran`, `dep_ide`) VALUES ('14502107', 'JESUS DAVID', 'SALAMANCA CARVAJAL', '2023-03-01', 'M', '1', '2', '26', '15', 'I', '4');

-- TABLA TESUSU (Usuario del CONTRALOR: CONTRASEÑA ES 12345)

INSERT INTO `tesusu` (`usu_usu`, `usu_con`, `usu_nom`, `usu_ape`, `usu_tip`, `usu_mod`, `nom_ced`) VALUES ('LuisAgui23', '$2y$12$zLekvZkVCw4Iy9TpkjOue.aCIBNdZgT.dwcAGOPxc7bW3CIInF3ku', 'LUIS ALEJANDRO', 'AGUILAR MONTILVA', '5', '1', '18845038'); 

-- TABLA TESUSU (Usuario de Director General: CONTRASEÑA ES 12345)

INSERT INTO `tesusu` (`usu_usu`, `usu_con`, `usu_nom`, `usu_ape`, `usu_tip`, `usu_mod`, `nom_ced`) VALUES ('EliCris23', '$2y$12$JzctV2PntXoUkksVmfSMXOdOpMyCHHnvNyOgMiW/DFbjPsPTMSZlW', 'ELIANA CRISTINA', 'RAMIREZ DE GUERRERO', '4', '1', '17368181');

-- TABLA TESUSU (Usuario de Jefe de RRHH: CONTRASEÑA ES 12345)

INSERT INTO `tesusu` (`usu_usu`, `usu_con`, `usu_nom`, `usu_ape`, `usu_tip`, `usu_mod`, `nom_ced`) VALUES ('LuisArias1', '$2y$12$2gsERLg2ZUdQ6/GfQ0Wos.492R3p/SGhKGpFdnKvZ4fUj1BOK4TvS', 'LUIS GERARDO', 'ARIAS NIÑO', '4', '2', '15028510');

-- TABLA TESUSU (Usuario de Jefe de Bienes: CONTRASEÑA ES 12345)

INSERT INTO `tesusu` (`usu_usu`, `usu_con`, `usu_nom`, `usu_ape`, `usu_tip`, `usu_mod`, `nom_ced`) VALUES ('EnderMar21', '$2y$12$oUKu3BId/VnUQ20cdAUzcO2.j6Y.yKpaClmYurBdCi719xjJ33l4a', 'ENDER NICOLAY', 'MOGOLLON MARQUEZ', '4', '3', '26403363');

-- TABLA TESUSU (Usuario de Área Técnica: CONTRASEÑA ES 12345)
INSERT INTO `tesusu` (`usu_usu`, `usu_con`, `usu_nom`, `usu_ape`, `usu_tip`, `usu_mod`, `nom_ced`) VALUES ('JesusCar23', '$2y$12$/FSFzNj8rdiyN9EELET45.rRcUUp5raL7jXmd4x/o8TPzi0RrxqNm', 'JESUS DAVID', 'SALAMANCA CARVAJAL', '5', '1', '14502107');

-- TABLA TMACAT

INSERT INTO `tmacat` (`cat_ide`, `cat_cat`) VALUES 
(1, 'Maquinaria y demás equipos de contrucción campo industria y taller'),
(2, 'Equipos de comunicaciones y de señalamiento'),
(3, 'Equipos medicos quirúrgicos dentales y veterinarios'),
(4, 'Equipos científicos religiosos de enseñanza y recreación'),
(5, 'Equipos de defensa y seguridad del Estado'),
(6, 'Máquinas muebles y demás equipos de oficina y de alojamiento');

-- TABLA TESSCA

INSERT INTO `tessca` (`sca_ide`, `sca_sca`, `cat_ide`) VALUES 
(1, 'Mobiliario y equipos de oficina', 6),
(2, 'Equipos de procesamiento de datos', 6),
(3, 'Mobiliario y equipos de alojamiento', 6),
(4, 'Otras máquinas muebles y demás equipos de oficina y de alojamiento', 6);

INSERT INTO `tessca` (`sca_ide`, `sca_sca`, `cat_ide`) VALUES 
(5, 'Maquinaria y equipos de construcción y mantenimiento', 1),
(6, 'Maquinarias y equipos para mantenimiento de automotores', 1),
(7, 'Maquinarias y equipos agrícolas y pecuarios', 1),
(8, 'Maquinarias y equipos de artes gráficas y reproducción', 1),
(9, 'Maquinarias y equipos industriales y de taller', 1),
(10, 'Maquinarias y equipos de energía', 1),
(11, 'Maquinarias y equipos de riego y acueductos', 1),
(12, 'Equipos de almacen', 1);

INSERT INTO `tessca` (`sca_ide`, `sca_sca`, `cat_ide`) VALUES 
(13, 'Equipos de telecomunicaciones', 2),
(14, 'Equipos de señalamiento', 2),
(15, 'Equipos de control de tráfico aéreo', 2),
(16, 'Equipos de correo', 2),
(17, 'Otros equipos de comunicaciones y de señalamiento', 2);

INSERT INTO `tessca` (`sca_ide`, `sca_sca`, `cat_ide`) VALUES 
(18, 'Equipos médicos quirúrgicos dentales y veterinarios', 3),
(19, 'Otros Equipos médicos quirúrgicos dentales y veterinarios', 3);

INSERT INTO `tessca` (`sca_ide`, `sca_sca`, `cat_ide`) VALUES 
(20, 'Equipos científicos y de laboratorio', 4),
(21, 'Equipos de enseñanza deporte y recreación', 4),
(22, 'Obras de arte', 4),
(23, 'Libros y revistas', 4),
(24, 'Equipos religiosos', 4),
(25, 'Instrumentos musicales', 4),
(26, 'Otros equipos científicos religiosos de enseñanza y recreación', 4);

INSERT INTO `tessca` (`sca_ide`, `sca_sca`, `cat_ide`) VALUES 
(27, 'Equipos y armamentos de defensa y seguridad pública', 5),
(28, 'Otros equipos para la defensa y seguridad pública', 5);

-- TABLA TESCAE

INSERT INTO `tescae` (`cae_ide`, `cae_cae`, `sca_ide`) VALUES
(1, 'Abecedarios de golpe (punzones)', 5),
(2, 'Abecedarios metálicos', 5),
(3, 'Acanaladoras', 5),
(4, 'Aceiteras', 5),
(5, 'Alicates', 5),
(6, 'Alineadores', 5),
(7, 'Alternadores eléctricos', 5),
(8, 'Amoladores', 5),
(9, 'Aparatos para probar generadores', 5),
(10, 'Aparatos para tuercas de cámara', 5),
(11, 'Asentadores de válvulas', 5),
(12, 'Balanzas', 5),
(13, 'Bancos de taller', 5),
(14, 'Básculas', 5),
(15, 'Batidoras de pintura', 5),
(16, 'Berbiquíes', 5),
(17, 'Bombas mecánicas', 5),
(18, 'Bruñidoras', 5),
(19, 'Burros para mecánica', 5),
(20, 'Cajas de herramientas', 5),
(21, 'Cajas de ingletes', 5),
(22, 'Calderas de vapor', 5),
(23, 'Calibradores', 5),
(24, 'Canteadores para maderas', 5),
(25, 'Calibradoras de madera (máquinas)', 5),
(26, 'Carretillas', 5),
(27, 'Cepilladoras-', 5),
(28, 'Cepilladoras-canteadoras', 5),
(29, 'Cepilladoras (máquinas)', 5),
(30, 'Cizallas para láminas metálicas', 5),
(31, 'Cizallas punzonadoras', 5),
(32, 'Compresores de aire', 5),
(33, 'Compresores de refrigeración', 5),
(34, 'Comprobadores de conmutadores', 5),
(35, 'Contadores', 5),
(36, 'Contadores eléctricos', 5),
(37, 'Convertidores eléctricos', 5),
(38, 'Cortadores de acero', 5),
(39, 'Cortadoras de cables', 5),
(40, 'Cortafríos', 5),
(41, 'Cortatubos', 5),
(42, 'Cortavidrios', 5),
(43, 'Correas transportadoras', 5),
(44, 'Cribadoras', 5),
(45, 'Destornilladores', 5),
(46, 'Detonadores', 5),
(47, 'Dinamos', 5),
(48, 'Disparadores eléctricos', 5),
(49, 'Elevadores de voltaje', 5),
(50, 'Envasadoras de tuberías y tuercas', 5),
(51, 'Equipos de refrigeración', 5),
(52, 'Equipos para ablandar agua', 5),
(53, 'Equipos para cortar y embutir tubos de cobre', 5),
(54, 'Equipos para fundición', 5),
(55, 'Equipos para galvanosplastia', 5),
(56, 'Equipos para pintar', 5),
(57, 'Equipos para soldaduras autógena', 5),
(58, 'Equipos para soldadura eléctrica', 5),
(59, 'Equipos para terminado de metal', 5),
(60, 'Escaleras portátiles', 5),
(61, 'Escariadoras', 5),
(62, 'Escoplos', 5),
(63, 'Escorfinas', 5),
(64, 'Esmaltadoras', 5),
(65, 'Esmeriladoras', 5),
(66, 'Espigadoras mecánicas', 5),
(67, 'Extintores de incendio', 5),
(68, 'Extractores', 5),
(69, 'Flejadores', 5),
(70, 'Formones', 5),
(71, 'Fraguas o forjas portátiles', 5),
(72, 'Fresadoras', 5),
(73, 'Garlopas', 5),
(74, 'Garruchas', 5),
(75, 'Gatos de latonería', 5),
(76, 'Gatos mecánicos', 5),
(77, 'Generadores de acetileno', 5),
(78, 'Generadores eléctricos', 5),
(79, 'Grabadoras para metal', 5),
(80, 'Gramiles', 5),
(81, 'Guantes de amianto', 5),
(82, 'Gubias', 5),
(83, 'Guillames', 5),
(84, 'Hachas', 5),
(85, 'Hileras', 5),
(86, 'Hornos industriales', 5),
(87, 'Juegos de autoclaits', 5),
(88, 'Juegos de herramientas en estuche', 5),
(89, 'Juegos de llaves', 5),
(90, 'Juego de punzones', 5),
(91, 'Laminadoras', 5),
(92, 'Lijadoras', 5),
(93, 'Limpiadoras a vapor', 5),
(94, 'Llaves de impacto', 5),
(95, 'Mandarrias', 5),
(96, 'Mandriles', 5),
(97, 'Mangueras', 5),
(98, 'Manómetros', 5),
(99, 'Máquinas a vapor', 5),
(100, 'Máquinas calibradoras de pintura', 5),
(101, 'Máquinas cepilladoras', 5),
(102, 'Máquinas cortadoras y terminadoras de engranaje', 5),
(103, 'Máquinas de cortadura al arco', 5),
(104, 'Máquinas de coser industriales', 5),
(105, 'Máquinas disparadoras', 5),
(106, 'Máquinas embaladoras', 5),
(107, 'Máquinas empaquetadoras', 5),
(108, 'Máquinas engrapadoras (excepto las de tipo de oficina)', 5),
(109, 'Máquinas escariadoras', 5),
(110, 'Máquinas esclopadoras', 5),
(111, 'Máquinas estañadoras', 5),
(112, 'Máquinas etiquetadoras', 5),
(113, 'Maquinas dibujadoras', 5),
(114, 'Maquinas fraguadoras', 5),
(115, 'Máquinas laminadoras para carnets', 5),
(116, 'Máquinas limadoras', 5),
(117, 'Máquinas para doblar tubos', 5),
(118, 'Máquinas para hacer chompines', 5),
(119, 'Máquinas para hacer llaves', 5),
(120, 'Máquinas recobradoras de fudente', 5),
(121, 'Máquinas roscadoras', 5),
(122, 'Máquinas roscadoras de tornillos', 5),
(123, 'Máquinas soldadoras de punto', 5),
(124, 'Máquinas selladoras de paquetes', 5),
(125, 'Máquinas torcedoras y formadoras', 5),
(126, 'Máquinas universales para latonería dobladora y envarilladora', 5),
(127, 'Marcos para segueta', 5),
(128, 'Martillos', 5),
(129, 'Martillos neumáticos', 5),
(130, 'Máscaras para soldador', 5),
(131, 'Máscaras protectoras', 5),
(132, 'Mazos', 5),
(133, 'Medidores de presión', 5),
(134, 'Mesones para mecánico', 5),
(135, 'Metalizadores', 5),
(136, 'Micrómetros', 5),
(137, 'Motones', 5),
(138, 'Motores a explosión', 5),
(139, 'Motores diésel', 5),
(140, 'Motores eléctricos', 5),
(141, 'Niveles', 5),
(142, 'Numeradores de golpe (punzones)', 5),
(143, 'Palas', 5),
(144, 'Pasadores para llaves de copa', 5),
(145, 'Perforadoras', 5),
(146, 'Pinzas', 5),
(147, 'Pisones', 5),
(148, 'Pistolas de aire', 5),
(149, 'Plantas eléctricas (pequeñas)', 5),
(150, 'Poleas', 5),
(151, 'Prensas', 5),
(152, 'Prensas hidráulicas', 5),
(153, 'Pulidoras-lijadoras', 5),
(154, 'Punzonadoras', 5),
(155, 'Punzones', 5),
(156, 'Quemadores', 5),
(157, 'Raches', 5),
(158, 'Rasquetas', 5),
(159, 'Rectificadores de corriente', 5),
(160, 'Reflectores', 5),
(161, 'Reguladores de aire', 5),
(162, 'Reguladores de velocidad', 5),
(163, 'Relays', 5),
(164, 'Remachadoras', 5),
(165, 'Rumas', 5),
(166, 'Romanas', 5),
(167, 'Sacabocados', 5),
(168, 'Sargentos de carpintera', 5),
(169, 'Seguetas eléctricas', 5),
(170, 'Señoritas (polipasto)', 5),
(171, 'Serruchos', 5),
(172, 'Sierras', 5),
(173, 'Sirenas', 5),
(174, 'Soldadores', 5),
(175, 'Soldadores de punto', 5),
(176, 'Sopladores', 5),
(177, 'Sopletes', 5),
(178, 'Soportes', 5),
(179, 'Tableros de soldadura', 5),
(180, 'Tableros eléctricos', 5),
(181, 'Tableros para herramientas', 5),
(182, 'Taladros', 5),
(183, 'Tamizadores', 5),
(184, 'Tanques de sedimentación', 5),
(185, 'Tenazas', 5),
(186, 'Termómetros', 5),
(187, 'Terrajas', 5),
(188, 'Tornos', 5),
(189, 'Trajes de amianto', 5),
(190, 'Transformadores eléctricos', 5),
(191, 'Trompos para carpintera', 5),
(192, 'Troqueladores', 5),
(193, 'Turbinas', 5),
(194, 'Winches', 5),
(195, 'Yunques', 5),
(196, 'Zunchadoras', 5),
(197, 'Abre-trochas', 5),
(198, 'Andamios corredizos para túneles', 5),
(199, 'Andamios corredizos para concretar túneles', 5),
(200, 'Andamios metálicos', 5),
(201, 'Apisonadoras', 5),
(202, 'Aplanadoras', 5),
(203, 'Aplanadoras de vibración', 5),
(204, 'Aplanadoras de madera', 5),
(205, 'Aserradoras de piedra', 5),
(206, 'Asfaltadoras', 5),
(207, 'Bombeadoras de concreto', 5),
(208, 'Cabrestantes', 5),
(209, 'Cabrias (ver grúas)', 5),
(210, 'Calentadores para asfalto', 5),
(211, 'Camiones-mezcladoras de concreto', 5),
(212, 'Cargadoras de piedra', 5),
(213, 'Cargadores de cangilones', 5),
(214, 'Carros para túneles (jumbos)', 5),
(215, 'Centrífugas de asfalto', 5),
(216, 'Clasificadoras y lavadoras de arena y grava', 5),
(217, 'Comprensores', 5),
(218, 'Cortadoras de cabillas', 5),
(219, 'Distribuidoras de asfalto', 5),
(220, 'Dobladoras de cabillas', 5),
(221, 'Dragas', 5),
(222, 'Equipos de perforación', 5),
(223, 'Equipos drag-line para palas mecánicas', 5),
(224, 'Escarificadoras (reoters)', 5),
(225, 'Escobas mecánicas', 5),
(226, 'Escoplos de cadena', 5),
(227, 'Esparcidoras de arena', 5),
(228, 'Esparcidoras de materiales', 5),
(229, 'Excavadoras', 5),
(230, 'Extractores hidráulicos para pernos de orugas', 5),
(231, 'Furgonetas', 5),
(232, 'Grúas (móviles)', 5),
(233, 'Herramientas de construcción', 5),
(234, 'Inyectadoras de cemento', 5),
(235, 'Malacates', 5),
(236, 'Máquinas barredoras', 5),
(237, 'Máquinas derretidoras-esparcidoras de asfalto', 5),
(238, 'Máquinas para armar y desarmar orugas', 5),
(239, 'Máquinas para descoser sacos de cemento', 5),
(240, 'Máquinas para fabricar bloques de concreto', 5),
(241, 'Máquinas para marcar caminos', 5),
(242, 'Máquinas para trozar madera', 5),
(243, 'Máquinas secadoras de arena para asfalto', 5),
(244, 'Máquinas terra-cobra', 5),
(245, 'Martillos para clavar pilotes (ver martinetes)', 5),
(246, 'Martillos para ensayos de suelos', 5),
(247, 'Martillos perforadores', 5),
(248, 'Martillos rompedores neumáticos', 5),
(249, 'Martillos rotativos', 5),
(250, 'Martinetes', 5),
(251, 'Mezcladoras de asfalto', 5),
(252, 'Mezcladoras de concreto', 5),
(253, 'Montacargas', 5),
(254, 'Motobombas', 5),
(255, 'Motoniveladoras', 5),
(256, 'Niveladora (bulldozers)', 5),
(257, 'Niveladora de ángulo (anglodozers)', 5),
(258, 'Palas cargadoras', 5),
(259, 'Palas mecánicas', 5),
(260, 'Patas de cabra (ver rodillos)', 5),
(261, 'Pavimentadoras', 5),
(262, 'Payloaders', 5),
(263, 'Perforadoras de pozos', 5),
(264, 'Petrolizadoras', 5),
(265, 'Picadoras de piedras', 5),
(266, 'Plantas clasificadoras de agregados', 5),
(267, 'Plantas mezcladoras de asfalto', 5),
(268, 'Plataformas para mantenimiento de pistas de aviación', 5),
(269, 'Pulvi-mezcladoras', 5),
(270, 'Remachadoras', 5),
(271, 'Rociadoras', 5),
(272, 'Rociadoras de arena', 5),
(273, 'Rodillos', 5),
(274, 'Secadoras de arena', 5),
(275, 'Taladros sobre carretillo (ver vagones drill)', 5),
(276, 'Tanques de remolque', 5),
(277, 'Tanque para concreto', 5),
(278, 'Tanques petrolizadores de remolque', 5),
(279, 'Tolvas', 5),
(280, 'Torres de elevación', 5),
(281, 'Tournapulls', 5),
(282, 'Tractores', 5),
(283, 'Traillas', 5),
(284, 'Transportadores de bandas', 5),
(285, 'Traxcavators', 5),
(286, 'Tree-dozers', 5),
(287, 'Trituradoras de piedras', 5),
(288, 'Troleys', 5),
(289, 'Vagonetas', 5),
(290, 'Vibradores de concreto', 5),
(291, 'Vibradores de vigas', 5),
(292, 'Vibradores neumáticos', 5),
(293, 'Zanjadoras', 5),
(294, 'Zorras', 5);

INSERT INTO `tescae` (`cae_ide`, `cae_cae`, `sca_ide`) VALUES
(295, 'Ajustadores de bombas de frenos', 6),
(296, 'Alineadores', 6),
(297, 'Aparatos para limpiar bujías', 6),
(298, 'Aparatos para reparar frenos', 6),
(299, 'Apretadores de tuercas', 6),
(300, 'Bancos de pruebas', 6),
(301, 'Cargadores de batería', 6),
(302, 'Colocadores de anillos', 6),
(303, 'Engrasadores', 6),
(304, 'Equipos de engrase', 6),
(305, 'Equipos para cambios de aceite', 6),
(306, 'Equipos para entonar motores', 6),
(307, 'Equipos para lavar radiadores', 6),
(308, 'Equipos para prueba de mecanismos aviones', 6),
(309, 'Equipos para reparar cauchos y tripas', 6),
(310, 'Equipos para reparar parafangos', 6),
(311, 'Esmeriladoras de válvulas', 6),
(312, 'Estrados para sostener aviones durante su reparación', 6),
(313, 'Extractores', 6),
(314, 'Extractores de aceite', 6),
(315, 'Gatos carretos', 6),
(316, 'Gatos extensores', 6),
(317, 'Gatos extractores', 6),
(318, 'Herramientas de taller', 6),
(319, 'Lavadoras de vehículos', 6),
(320, 'Limpiadoras a vapor', 6),
(321, 'Lubricadores (ver engrasadores)', 6),
(322, 'Máquinas cambiadoras de cauchos', 6),
(323, 'Máquinas de hacer estoperas', 6),
(324, 'Máquinas descarbonizadoras de pistones', 6),
(325, 'Máquinas lavadoras de carros', 6),
(326, 'Máquinas para bandas de frenos', 6),
(327, 'Máquinas para remendar zapatas de frenos', 6),
(328, 'Máquinas de quitaruedas', 6),
(329, 'Medidores de presión de aire', 6),
(330, 'Pistolas de engrase', 6),
(331, 'Pistolas para bombas de gasolina', 6),
(332, 'Pistolas para gasoil', 6),
(333, 'Probadores', 6),
(334, 'Pulidoras de cilindros', 6),
(335, 'Rectificadoras', 6),
(336, 'Remachadoras de bandas de freno', 6),
(337, 'Sincronizadores de distribuidores', 6),
(338, 'Suministradores de grasas', 6),
(339, 'Testers (ver probadores)', 6),
(340, 'Valvulineras', 6),
(341, 'Vulcanizadoras', 6);

INSERT INTO `tescae` (`cae_ide`, `cae_cae`, `sca_ide`) VALUES
(342, 'Aparatos para digestión de proteínas', 7),
(343, 'Arados', 7),
(344, 'Artesas', 7),
(345, 'Arreos y atalajes', 7),
(346, 'Asperjadoras', 7),
(347, 'Aventadores para el beneficio del café', 7),
(348, 'Azadas', 7),
(349, 'Azadones', 7),
(350, 'Bombas', 7),
(351, 'Carretas', 7),
(352, 'Centrífugas', 7),
(353, 'Cintas de agrimensores', 7),
(354, 'Clasificadoras para granos', 7),
(355, 'Conejeras metálicas', 7),
(356, 'Cortadoras', 7),
(357, 'Cosechadoras', 7),
(358, 'Criadoras avícolas', 7),
(359, 'Cultivadoras', 7),
(360, 'Desarraigadoras de tocones', 7),
(361, 'Desfibradoras', 7),
(362, 'Desgranadoras', 7),
(363, 'Desmontadoras de café', 7),
(364, 'Desterronadoras', 7),
(365, 'Digestores para análisis de caña', 7),
(366, 'Distribuidoras de abonos', 7),
(367, 'Esmasculadoras', 7),
(368, 'Enfriadoras eléctricas de leche', 7),
(369, 'Equipos para análisis de suelos', 7),
(370, 'Escardillas', 7),
(371, 'Escarificadoras', 7),
(372, 'Espolvoreadoras (máquina)', 7),
(373, 'Estercoleras', 7),
(374, 'Exprimidoras de lana', 7),
(375, 'Extirpadoras', 7),
(376, 'Fertilizadoras', 7),
(377, 'Fumigadoras', 7),
(378, 'Germinadoras', 7),
(379, 'Gradas', 7),
(380, 'Incubadoras', 7),
(381, 'Jaulas', 7),
(382, 'Lavadoras de café', 7),
(383, 'Máquinas extractoras de grasa', 7),
(384, 'Máquinas homogeneizadoras', 7),
(385, 'Máquinas para cortar epitelios', 7),
(386, 'Máquinas para cortar forrajes', 7),
(387, 'Máquinas para matar bachacos', 7),
(388, 'Máquinas perforadoras agrícolas', 7),
(389, 'Máquinas secadoras para granos', 7),
(390, 'Molinos', 7),
(391, 'Motocultores (ver cultivadoras)', 7),
(392, 'Ordeñadoras mecánicas', 7),
(393, 'Ovoscopios', 7),
(394, 'Pailas', 7),
(395, 'Palomares (móviles)', 7),
(396, 'Picadoras (máquinas)', 7),
(397, 'Podadoras (máquinas)', 7),
(398, 'Pulidoras de granos', 7),
(399, 'Pulverizadores', 7),
(400, 'Rastrillos y rastras aradoras', 7),
(401, 'Rociadoras', 7),
(402, 'Rodillos agrícolas', 7),
(403, 'Rolos', 7),
(404, 'Secadoras', 7),
(405, 'Segadoras', 7),
(406, 'Segadoras de grama', 7),
(407, 'Sembradoras', 7),
(408, 'Silos (móviles)', 7),
(409, 'Sillas de montar', 7),
(410, 'Tanques y depósitos', 7),
(411, 'Tractores agrícolas', 7),
(412, 'Trallas agrícolas', 7),
(413, 'Trapiches', 7),
(414, 'Trilladoras', 7),
(415, 'Trozeros', 7),
(416, 'Ventiladores de granos', 7),
(417, 'Zanjadoras agrícolas', 7);

INSERT INTO `tescae` (`cae_ide`, `cae_cae`, `sca_ide`) VALUES
(418, 'Maquinarias y equipos de artes gráficas y reproducción', 8),
(419, 'Biseladoras-encuadernadoras', 8),
(420, 'Cajas de madera para guarniciones', 8),
(421, 'Cisnadoras-perforadoras', 8),
(422, 'Cizallas de mano', 8),
(423, 'Coleros eléctricos', 8),
(424, 'Cortadoras de clisés', 8),
(425, 'Cortadoras índice', 8),
(426, 'Cosedoras (máquinas)', 8),
(427, 'Chivaletes', 8),
(428, 'Decnígrafos paragón', 8),
(429, 'Dobladoras', 8),
(430, 'Editoras portátiles', 8),
(431, 'Empaquetadoras', 8),
(432, 'Engrapadoras tipográficas', 8),
(433, 'Equipos de dibujo', 8),
(434, 'Equipos de fotograbado', 8),
(435, 'Equipos de zincograbado', 8),
(436, 'Equipos litográficos', 8),
(437, 'Foliadoras-numeradoras', 8),
(438, 'Fotograbadoras', 8),
(439, 'Fresadoras', 8),
(440, 'Fuentes de tipos', 8),
(441, 'Fundidoras de plomo', 8),
(442, 'Grabadoras eléctricas tipo-gráficas', 8),
(443, 'Graneadoras para planchas litográficas', 8),
(444, 'Guillotinas para panel', 8),
(445, 'Hornillos', 8),
(446, 'Impresoras de fotografía', 8),
(447, 'Invertidoras de imagen', 8),
(448, 'Lámparas de arco', 8),
(449, 'Lavadoras de planchas', 8),
(450, 'Linotipos', 8),
(451, 'Máquinas biseladoras', 8),
(452, 'Máquinas cortadoras interlíneas', 8),
(453, 'Máquinas de proceso a gelatina', 8),
(454, 'Máquina cosedoras', 8),
(455, 'Máquinas de proceso a offset', 8),
(456, 'Máquinas encuadernadoras', 8),
(457, 'Máquinas heliográficas', 8),
(458, 'Máquinas intertipe automáticas', 8),
(459, 'Máquinas para adolar', 8),
(460, 'Máquinas para bordear planos', 8),
(461, 'Máquinas para dorar a fuego', 8),
(462, 'Máquinas para empastar libros', 8),
(463, 'Máquinas para fabricar sobres', 8),
(464, 'Máquinas para formar cajas', 8),
(465, 'Máquinas para fundiciones', 8),
(466, 'Máquinas para hacer sellos', 8),
(467, 'Máquinas para pegar sobres', 8),
(468, 'Máquinas para trazar círculos y óvulos', 8),
(469, 'Máquinas realizadoras de imprenta', 8),
(470, 'Máquinas secadoras automáticas', 8),
(471, 'Monotipos', 8),
(472, 'Perforadoras para tipografía', 8),
(473, 'Prensas impresoras (otras)', 8),
(474, 'Prensas litográficas', 8),
(475, 'Prensas para ponchar', 8),
(476, 'Prensas para tipografía', 8),
(477, 'Prensas planas', 8),
(478, 'Rayadoras', 8),
(479, 'Ribeteadoras', 8),
(480, 'Rotativas', 8),
(481, 'Sacapuntas', 8),
(482, 'Sierras-cepilladoras', 8),
(483, 'Sifones para lavar impresos', 8),
(484, 'Tituladoras', 8),
(485, 'Torneadoras', 8),
(486, 'Troqueladoras', 8);

INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (487, 'Maquinarias y equipos industriales', 9);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (488, 'Maquinarias y equipos de taller', 9);

INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (489, 'Calderas', 10);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (490, 'Generadores', 10);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (491, 'Motores', 10);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (492, 'Turbinas', 10);

INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (493, 'Maquinarias y equipos de riego', 11);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (494, 'Maquinarias y equipos de acueductos', 11);

INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (495, 'Equipos de almacén', 12);

INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (496, 'Amplificadores', 13);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (497, 'Analizadoras', 13);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (498, 'Antenas fácilmente desmontables', 13);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (499, 'Centrales telefónicas manuales (ver conmutadores telefónicos)', 13);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (500, 'Concentradores', 13);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (501, 'Conmutadores telefónicos', 13);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (502, 'Conmutadores telegráficos', 13);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (503, 'Equipos de control remoto', 13);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (504, 'Equipos de sloran', 13);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (505, 'Equipos de luces de señales para torres de antena', 13);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (506, 'Equipos de radar', 13);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (507, 'Equipos de radiocomunicación portátiles', 13);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (508, 'Equipos de comunicación interna (intercomunicadores)', 13);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (509, 'Generadores de señales', 13);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (510, 'Jacks panels', 13);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (511, 'Manipuladores', 13);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (512, 'Mesas para teleimpresoras', 13);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (513, 'Micrófonos', 13);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (514, 'Multicanales para telefonía', 13);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (515, 'Multicanales para telegrafía', 13);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (516, 'Pilas húmedas o de gravedad', 13);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (517, 'Plantas eléctricas', 13);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (518, 'Probadores de tubos electrónicos', 13);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (519, 'Racks', 13);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (520, 'Radioreceptores (ver receptores radioeléctricos)', 13);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (521, 'Radiotransmisores (ver transmisores radioeléctricos)', 13);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (522, 'Receptores radioeléctricos', 13);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (523, 'Rectificadores', 13);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (524, 'Teléfonos', 13);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (525, 'Teleimpresoras', 13);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (526, 'Teletipos', 13);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (527, 'Transmisores radioeléctricos', 13);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (528, 'Trazadores de señales', 13);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (529, 'Voltímetros', 13);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (530, 'Balizas', 13);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (531, 'Boyas', 13);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (532, 'Faros', 13);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (533, 'Semáforos', 13);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (534, 'Equipos de control de tráfico aéreo', 13);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (535, 'Equipos de correo', 13);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (536, 'Otros equipos de comunicaciones y señalamiento', 13);

INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (537, 'Balizas', 14);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (538, 'Boyas', 14);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (539, 'Faros', 14);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (540, 'Semáforos', 14);

INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (541, 'Equipos de control de tráfico aéreo', 15);

INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (542, 'Equipos de correo', 16);

INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (543, 'Otros equipos de comunicaciones y señalamiento', 17);

INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (544, 'Agitadores de pipetas', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (545, 'Agitadores serológicos', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (546, 'Analizadores de cido-alcalinidad de la sangre', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (547, 'Anteojos para prueba de vidrios ópticos', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (548, 'Antroscopios', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (549, 'Anuscopios', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (550, 'Aparatos de anestesia', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (551, 'Aparatos de diatermia', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (552, 'Aparatos de galvanización y electroterapia', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (553, 'Aparatos de hidroterapia', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (554, 'Aparatos de luz ultravioleta', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (555, 'Aparatos de metabolismo basal', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (556, 'Aparatos de presión venosa', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (557, 'Aparatos de radioterapia profunda', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (558, 'Aparatos de rayos x', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (559, 'Aparatos de rayos x portátiles', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (560, 'Aparatos gastro-evacuadores', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (561, 'Aparatos imperatori', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (562, 'Aparatos para inductotermia', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (563, 'Aparatos para electrocoagulación', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (564, 'Aparatos para electroforesis', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (565, 'Aparatos para eter ombrédame', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (566, 'Aparatos para lavados uterales', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (567, 'Aparatos para lavar y entalcar guantes', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (568, 'Aparatos para succión de cataratas', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (569, 'Aplicadores metalicos para otorrino', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (570, 'Aplicadores para irradiación', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (571, 'Atomizadores para otorrino', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (572, 'Audímetros', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (573, 'Autoclaves', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (574, 'Baos de vapor', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (575, 'Baos serológicos', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (576, 'Barrenas para cirugía', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (577, 'Básculas de clínicas', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (578, 'Berbiquíes para ortopedia', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (579, 'Bisturíes', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (580, 'Blefaro separadores', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (581, 'Blesfarostatos', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (582, 'Bocks (envase)', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (583, 'Botiquines de primeros auxilios', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (584, 'Caballos mecánicos', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (585, 'Calculadores de ackermann', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (586, 'Cámaras cuentaglóbulos de Neubauer', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (587, 'Cámaras de oxígeno (tiendas)', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (588, 'Cámaras retinales', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (589, 'Camas clínicas de hospital', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (590, 'Camillas', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (591, 'Caminaderas de resistencias', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (592, 'Campanas para irrigación', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (593, 'Campímetros', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (594, 'Cánulas', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (595, 'Carretillas para oxígeno', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (596, 'Carros para curaciones', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (597, 'Cafalómetros', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (598, 'Centrífugas clínicas', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (599, 'Cinceles para huesos', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (600, 'Citoscopias', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (601, 'Citotomos', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (602, 'Cizallas para yesos y vendas', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (603, 'Clamps abdominales', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (604, 'Cleoides', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (605, 'Coaguladores', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (606, 'Colposcopios', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (607, 'Cofres termo para transportar sangre', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (608, 'Colorímetros visuales', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (609, 'Contadores de colonias de bacterias', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (610, 'Cortadores para ligaduras', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (611, 'Cortadores para película de rayos x', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (612, 'Craneografos', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (613, 'Cronógrafos', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (614, 'Cronómetros', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (615, 'Cuchillos para parafina', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (616, 'Cuchillos para síntesis del tímpano', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (617, 'Cuchillos para yeso', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (618, 'Curetas', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (619, 'Delantales de plomo para rayos x', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (620, 'Diafanoscopios', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (621, 'Dilatadores lagrimales', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (622, 'Dilatadores uterales', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (623, 'Dinamómetros', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (624, 'Dispensadores de alcohol', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (625, 'Dispensadores múltiples de botones', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (626, 'Electrocardiógrafos', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (627, 'Embriotomos', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (628, 'Endoscopios', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (629, 'Equipos de disección', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (630, 'Equipos de oftalmoscopia', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (631, 'Equipos de otorrinolaringología', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (632, 'Equipos para anestesia', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (633, 'Equipos para cirugía menor', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (634, 'Equipos para determinación de la urea', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (635, 'Equipos para electrocirugía', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (636, 'Equipos para intubación de la laringe', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (637, 'Equipos para la determinación del azúcar en la sangre', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (638, 'Equipos para la determinación del colesterol en la sangre', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (639, 'Equipo para operaciones de labios leporino', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (640, 'Equipo para operaciones del seno frontal', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (641, 'Equipo para oxígeno', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (642, 'Equipo para primeros auxilios traumatológicos', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (643, 'Equipos para terapia con aerosol', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (644, 'Equipos para transfusión', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (645, 'Escalpelos', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (646, 'Esofagoscopios', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (647, 'Espéculos', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (648, 'Espejos frontales', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (649, 'Espejos laringeos', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (650, 'Espirómetros', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (651, 'Esterilizadores', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (652, 'Esterilizadores para colchones', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (653, 'Esterilizadoras ultravioleta', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (654, 'Estetoscopios (fomendoscopio)', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (655, 'Estuches para diagnóstico', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (656, 'Exoftalmeómetros', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (657, 'Faringoscopios', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (658, 'Férulas articulares', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (659, 'Fluoroscopios', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (660, 'Fomenteras eléctricas', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (661, 'Forceps', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (662, 'Fumigadoras', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (663, 'Foroptero', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (664, 'Gabinetes para botiquines', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (665, 'Gabinete para instrumental', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (666, 'Galvanocauterios', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (667, 'Gastrofotores', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (668, 'Gineoscopios', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (669, 'Ginógrafos de weissman', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (670, 'Goniómetros para antropometría', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (671, 'Guantes de plomo para rayos x', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (672, 'Hematímetros', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (673, 'Hemoglobímetros', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (674, 'Hervidoras', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (675, 'Histerómetros', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (676, 'Hornos crematorios para basura', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (677, 'Hyfrecatores', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (678, 'Incubadoras', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (679, 'Infantómetros', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (680, 'Inhaladores', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (681, 'Insufladores', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (682, 'Juegos de bujías ginecológicas', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (683, 'Juegos de diapasones', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (684, 'Juegos de dilatadores rectales', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (685, 'Juegos de espéculos para nariz', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (686, 'Juegos de lancetas para oídos', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (687, 'Keratómetros', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (688, 'Lámparas de hendiduras con microscopio corneal', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (689, 'Lámparas de rayos infrarrojos', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (690, 'Lámparas frontales', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (691, 'Lámparas para operaciones', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (692, 'Laringoscopios en estuches', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (693, 'Lavadoras para hematocritos', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (694, 'Lentes ópticos para pruebas', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (695, 'Lentes rubí para lámparas de hendiduras', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (696, 'Localizadores de granger', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (697, 'Lupas para disección', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (698, 'Maletines para médicos', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (699, 'Mamadores', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (700, 'Mamómetros lumbares', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (701, 'Martillos de reflejos', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (702, 'Máscaras de anestesia', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (703, 'Máscara de oxígeno', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (704, 'Meatotomos', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (705, 'Mesas ginecológicas', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (706, 'Mesas hidráulicas para terapia', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (707, 'Mesas para cirugía', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (708, 'Mesas para examen clínico', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (709, 'Mesas para partos', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (710, 'Microtomos', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (711, 'Nasofaringoscopios', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (712, 'Nasolaringoscopio', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (713, 'Negatoscopios', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (714, 'Neumotoraces', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (715, 'Numeradores para rayos x', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (716, 'Oftalmodinamómetros', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (717, 'Oftalmoscopios', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (718, 'Optotipos', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (719, 'Ortho-rateres', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (720, 'Oscilómetros', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (721, 'Otoscopios', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (722, 'Pantalla de hess', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (723, 'Pantostatos', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (724, 'Pagadoras de películas para rayos x', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (725, 'Pelvímetros', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (726, 'Perforadoras de huesos', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (727, 'Peritoneoscopios', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (728, 'Pinzas', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (729, 'Podogramas', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (730, 'Porta-algodones', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (731, 'Proyectores para medir la agudeza visual', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (732, 'Pulmones de acero', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (733, 'Queratómetro', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (734, 'Rectoscopios', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (735, 'Refractómetros', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (736, 'Regatoscopios', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (737, 'Remadores hidráulicos', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (738, 'Resucitadores', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (739, 'Retinoscopios', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (740, 'Retractores', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (741, 'Renoscopios', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (742, 'Riñones artificiales', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (743, 'Ruginas', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (744, 'Secadores para láminas', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (745, 'Seguetas quirúrgicas', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (746, 'Separadores de yeso', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (747, 'Sierras eléctricas para cráneo', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (748, 'Sigmoidoscopios', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (749, 'Sillas para examen de otorrinolaringología', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (750, 'Sillas para inválidos', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (751, 'Sillas para oftalmología', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (752, 'Sillas para ortóptica', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (753, 'Sillas para radiólogos', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (754, 'Soportes para hematocritos', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (755, 'Soportes para sueros', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (756, 'Succionadores eléctricos', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (757, 'Tensiómetros', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (758, 'Teñidores serologicos', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (759, 'Termocauterios', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (760, 'Tijeras quirúrgicas', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (761, 'Tonómetros', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (762, 'Torniquetes ortopédicos', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (763, 'Trépanos', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (764, 'Trocares', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (765, 'Trocalleys de ruedas para camillas', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (766, 'Unidades de refracción', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (767, 'Ultratermos de onda corta', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (768, 'Unidad iluminada para friend', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (769, 'Urodensímetros (urómetro)', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (770, 'Valvas', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (771, 'Valvulotomos de dubost', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (772, 'Vaporizadores', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (773, 'Vasiótribos', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (774, 'Ventiladores de jefferson', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (775, 'Vertómetros', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (776, 'Vibradores', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (777, 'Vitrinas para instrumentos', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (778, 'Wings-test', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (779, 'Abrebocas metálicas', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (780, 'Algodoneras', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (781, 'Alveolotomos', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (782, 'Almalgamadores', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (783, 'Ángulos de odontología', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (784, 'Aparatos dentales de rayos x', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (785, 'Aparatos para anestesia', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (786, 'Aplicadores metálicos', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (787, 'Atomizadores', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (788, 'Automatomos', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (789, 'Asas de ferroníquel', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (790, 'Bajalenguas metálicos', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (791, 'Balanzas de precisión', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (792, 'Biseladores', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (793, 'Bisturíes', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (794, 'Bruñidores', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (795, 'Cánulas para irrigación senos maxilares', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (796, 'Centrífugas para fundición', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (797, 'Cinceles para huesos', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (798, 'Cleoides', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (799, 'Contra-ángulos', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (800, 'Cortadores de gancho para sutura', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (801, 'Cortafríos odontológicos', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (802, 'Crisoles', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (803, 'Cubetas metálicas', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (804, 'Cuchillos lovel', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (805, 'Curetas', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (806, 'Chassises', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (807, 'Discoides', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (808, 'Elevadores odontológicos', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (809, 'Empacadores de amalgama', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (810, 'Ensanchadores', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (811, 'Escupideras de pie', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (812, 'Escupideras de pedestal', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (813, 'Estuches con tensiómetros y fonendoscopio', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (814, 'Escavadores', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (815, 'Exploradores', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (816, 'Ganchos para revelar películas', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (817, 'Grapas para tela de caucho', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (818, 'Hachas odontológicas', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (819, 'Instrumentos para piorrea', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (820, 'Instrumentos para porcelana', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (821, 'Juegos de separadores', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (822, 'Lámparas de alcohol', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (823, 'Lámparas de seguridad', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (824, 'Lámparas para orificación', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (825, 'Limas odontológicas', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (826, 'Localizadores para radiografías', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (827, 'Lupas odontológicas', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (828, 'Mangos para espejos bucales', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (829, 'Máquinas dentales', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (830, 'Mangos para bisturíes', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (831, 'Marginadores', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (832, 'Martillos automáticos', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (833, 'Martillos quirúrgicos', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (834, 'Muebles dentales', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (835, 'Obturadores par conductos', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (836, 'Ovoides', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (837, 'Periostómos', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (838, 'Picos para puntas de raíces', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (839, 'Pinzas odontológicas', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (840, 'Porta amalgamas', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (841, 'Port -bandas', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (842, 'Porta-gasas', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (843, 'Porta-matriz', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (844, 'Recipientes para desperdicios', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (845, 'Retractores de colgajos', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (846, 'Seguetas quirúrgicas', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (847, 'Sillones dentales', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (848, 'Sondas bucales', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (849, 'Sopletes dentales', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (850, 'Talladores', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (851, 'Tanques para lavado de películas', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (852, 'Tanques para revelador', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (853, 'Tazas de cristal para medicamentos', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (854, 'Tijeras odontológicas', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (855, 'Tiranervios', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (856, 'Ternos eléctricos adontotécnicos', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (857, 'Trépanos de ritter de pedestal', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (858, 'Unidades completas para odontología', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (859, 'Ventiladores para sacar películas', 18);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (860, 'Vitametros (pulpómetros)', 18);

INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (861, 'Otros equipos médicos-quirúrgicos dentales y veterinarios', 19);

INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (862, 'Agitadores', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (863, 'Alambiques', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (864, 'Alcalímetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (865, 'Alcoholmetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (866, 'Altímetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (867, 'Altoparlantes', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (868, 'Amperímetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (869, 'Ampliadores', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (870, 'Analizadores', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (871, 'Anemógrafos', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (872, 'Anemómetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (873, 'Aneroides (ver barómetros)', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (874, 'Aparatos de explotación geográfica de terrenos', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (875, 'Aparatos de reducción kjeldahl', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (876, 'Aparatos de reducción catalítica', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (877, 'Aparatos para colorear', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (878, 'Aparatos para destilar agua', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (879, 'Aparatos para electrólisis', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (880, 'Aparatos para interpretación de vistas aéreas', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (881, 'Aparatos para la indeterminación del peso molecular', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (882, 'Aparatos para pruebas de sedimentación', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (883, 'Arcos voltaicos', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (884, 'Areómetros (ver densímetros)', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (885, 'Autoclaves', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (886, 'Balanzas de laboratorio', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (887, 'Bancos ópticos', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (888, 'Baños de maría (no de uso clínico)', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (889, 'Baños para impregnación de parafinas', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (890, 'Barómetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (891, 'Binóculos', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (892, 'Biofotocolorímetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (893, 'Bombas de laboratorio', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (894, 'Brújulas', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (895, 'Caleidoscopios', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (896, 'Calorímetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (897, 'Cámaras microfotográficas', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (898, 'Cámaras de recuento', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (899, 'Cámaras lúcidas', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (900, 'Cámaras fotográficas', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (901, 'Catetómetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (902, 'Carretes de ruhmkorff', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (903, 'Centrifugadores', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (904, 'Centrífugas', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (905, 'Círculos meridianos', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (906, 'Clicimetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (907, 'Colorímetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (908, 'Condensadores de campo oscuro para microscopios', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (909, 'Contadores de rayos ionizados', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (910, 'Contadores geiger', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (911, 'Convertidores microfotográficos', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (912, 'Copiadores fotográficos', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (913, 'Cronómetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (914, 'Cubetas esmaltadas', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (915, 'Cuentahílos', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (916, 'Densímetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (917, 'Desecadores', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (918, 'Deshumecedores', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (919, 'Destiladores', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (920, 'Detectores de minas', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (921, 'Determinadores del carbono', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (922, 'Dializadores', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (923, 'Dicroscopios', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (924, 'Digestorios', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (925, 'Dinamómetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (926, 'Dispensadores de placas de vidrio', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (927, 'Eclímetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (928, 'Editoras para películas fotográficas', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (929, 'Electroanalizadores', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (930, 'Electrodos de platino', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (931, 'Electróforos', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (932, 'Electrografos', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (933, 'Electroimanes', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (934, 'Electrómetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (935, 'Electrópodos', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (936, 'Electroscopios', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (937, 'Eliminadores de batería', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (938, 'Empacadoras de píldoras', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (939, 'Emulsificadores', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (940, 'Equipos de micro-combustión', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (941, 'Equipos de telemetración', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (942, 'Equipos de tratamiento al calor para metales', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (943, 'Equipos fotoeléctricos', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (944, 'Escleroscopios', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (945, 'Escurridores', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (946, 'Esferómetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (947, 'Espectrofotómetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (948, 'Espectroscopios', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (949, 'Estereómetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (950, 'Estereoscopios', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (951, 'Estroboscopios', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (952, 'Estuches para accesorios fotográficos', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (953, 'Estufas de laboratorio', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (954, 'Eudiómetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (955, 'Evaporímetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (956, 'Extractores', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (957, 'Filmadoras', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (958, 'Filtros de laboratorio', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (959, 'Flash fotográficos', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (960, 'Flexómetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (961, 'Fluoroscopios', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (962, 'Fluxómetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (963, 'Fotómetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (964, 'Gabinetes de laboratorio', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (965, 'Gabinetes de fermentación', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (966, 'Galvanómetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (967, 'Gavetas para láminas microscópicas', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (968, 'Generadores de señales', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (969, 'Giroscopios', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (970, 'Goniómetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (971, 'Grafómetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (972, 'Gramurios', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (973, 'Gravitómetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (974, 'Guarada-láminas (ver laminotecas)', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (975, 'Heliografos', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (976, 'Hemisferios de magdeburgo', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (977, 'Hidrogenadores catalíticos', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (978, 'Higrómetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (979, 'Higroscopios', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (980, 'Hipsómetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (981, 'Hornillos', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (982, 'Hornos de laboratorio', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (983, 'Hornos prensa al vaco', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (984, 'Incubadoras de laboratorio', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (985, 'Indicadores del punto de fusión', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (986, 'Inductores', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (987, 'Juegos de lentes en estuche', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (988, 'Juegos de pesas de laboratorio', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (989, 'Laboratorios químicos de campo (portátiles)', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (990, 'Laminotecas', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (991, 'Lámparas infrarrojas', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (992, 'Lámparas para microscopios', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (993, 'Lámparas ultravioletas', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (994, 'Largavistas', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (995, 'Lavadoras de pipetas', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (996, 'Lijadoras metalográficas', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (997, 'Lupas', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (998, 'Magnetómetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (999, 'Magnetos', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1000, 'Máquinas neumáticas', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1001, 'Máquinas para supositorios', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1002, 'Marcadores de películas', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1003, 'Mecheros bunsen', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1004, 'Megáfonos', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1005, 'Medidores de ácidos (ph)', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1006, 'Medidores de fluido', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1007, 'Mesas de laboratorio', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1008, 'Mezcladoras (laboratorio)', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1009, 'Microfilmadores', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1010, 'Microscopios', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1011, 'Micrótomos', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1012, 'Miras', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1013, 'Moldes para pruebas de compactación de suelos', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1014, 'Moldes para supositorios', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1015, 'Molinos', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1016, 'Multímetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1017, 'Morteros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1018, 'Muflas (ver hornos de laboratorio)', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1019, 'Neveras de laboratorio', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1020, 'Niveles', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1021, 'Niveles de anteojo (amney)', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1022, 'Objetivos microscópicos', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1023, 'Octantes', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1024, 'Oculares', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1025, 'Ohmímetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1026, 'Oscilógrafos', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1027, 'Oscilómetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1028, 'Osciloscopios', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1029, 'Penetrómetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1030, 'Perforadores de corchos', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1031, 'Periscopios', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1032, 'Permeámetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1033, 'Pesahilos de precisión', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1034, 'Pipeteadores automáticos', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1035, 'Pipeteros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1036, 'Pirómetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1037, 'Planchetas', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1038, 'Planímetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1039, 'Pluviómetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1040, 'Podómetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1041, 'Polarímetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1042, 'Polarizadores', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1043, 'Porta-láminas', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1044, 'Potenciómetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1045, 'Prensas metalográficas', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1046, 'Probadores de humedad', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1047, 'Probadores de consistencia de concreto', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1048, 'Probadores de ductibilidad', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1049, 'Probadores del punto de flash', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1050, 'Probadores de resistencias', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1051, 'Probadores de tubos electrónicos', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1052, 'Puentes de wheatstone', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1053, 'Pulidoras metalográficas', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1054, 'Radiadores acústicos', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1055, 'Radiadores de calor', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1056, 'Refractómetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1057, 'Registradores fotoeléctricos', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1058, 'Registradores minifn', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1059, 'Reglas de cálculo', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1060, 'Reguladores', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1061, 'Reóstatos', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1062, 'Sacarímetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1063, 'Scintilómetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1064, 'Secadores eléctricos', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1065, 'Serpentines', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1066, 'Sextantes', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1067, 'Sismógrafos', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1068, 'Sitómetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1069, 'Sonómetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1070, 'Soportes', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1071, 'Taquímetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1072, 'Telémetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1073, 'Telescopios', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1074, 'Tensiómetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1075, 'Teodolitos', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1076, 'Termógrafos', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1077, 'Termómetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1078, 'Termostatos', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1079, 'Torsiómetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1080, 'Tránsitos', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1081, 'Transportadores', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1082, 'Trazadores de señales', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1083, 'Trípodes', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1084, 'Trituradores -pulverizadores', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1085, 'Turbidmetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1086, 'Velocímetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1087, 'Vescocimetros', 20);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1088, 'Voltímetros', 20);

INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1089, 'Billares', 21);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1090, 'Carteleras', 21);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1091, 'Cátedras', 21);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1092, 'Colecciones de animales disecados para la enseñanza', 21);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1093, 'Colecciones de preparaciones microscópicas en estuche', 21);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1094, 'Colecciones de minerales para la enseñanza', 21);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1095, 'Cuadros murales', 21);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1096, 'Discos educativos', 21);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1097, 'Episcopios', 21);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1098, 'Equipos instructivos', 21);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1099, 'Equipos para deportes', 21);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1100, 'Equipos para gimnasia y parques recreativos', 21);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1101, 'Esferas celestes', 21);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1102, 'Esferas terrestres', 21);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1103, 'Herbarios', 21);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1104, 'Juegos de sólidos geométricos', 21);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1105, 'Juegos recreativos', 21);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1106, 'Mapas murales', 21);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1107, 'Máquinas disparadoras de skeet', 21);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1108, 'Modelos didácticos', 21);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1109, 'Pantallas de proyección', 21);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1110, 'Películas educativas', 21);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1111, 'Pizarrones', 21);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1112, 'Proyectores de películas', 21);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1113, 'Pupitres', 21);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1114, 'Radio-receptores', 21);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1115, 'Sillas pupitre', 21);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1116, 'Televisores', 21);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1117, 'Tocadiscos', 21);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1118, 'Video grabador', 21);

INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1119, 'Cuadros', 22);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1120, 'Esculturas', 22);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1121, 'Estatuas', 22);

INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1122, 'Libros', 23);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1123, 'Revistas', 23);

INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1124, 'Altares', 24);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1125, 'Aras', 24);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1126, 'Atriles litúrgicos', 24);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1127, 'Cálices', 24);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1128, 'Campanas', 24);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1129, 'Candelabros', 24);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1130, 'Candeleros', 24);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1131, 'Casullas', 24);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1132, 'Confesionarios', 24);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1133, 'Copas', 24);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1134, 'Copones', 24);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1135, 'Crismeros', 24);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1136, 'Crucifijos', 24);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1137, 'Cuadros religiosos', 24);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1138, 'Cubre-copones', 24);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1139, 'Custodias', 24);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1140, 'Estatuas religiosas', 24);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1141, 'Evangelios', 24);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1142, 'Hostiarios', 24);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1143, 'Incensarios', 24);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1144, 'Ornamentos religiosos', 24);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1145, 'Vinajeras', 24);

INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1146, 'Acordeones', 25);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1147, 'Armonios', 25);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1148, 'Arpas', 25);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1149, 'Atriles', 25);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1150, 'Bandola', 25);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1151, 'Banjos', 25);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1152, 'Baterías', 25);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1153, 'Bugles', 25);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1154, 'Bustos (excepto los situados en plazas públicas)', 25);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1155, 'Celestes', 25);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1156, 'Clarinetes', 25);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1157, 'Clarines', 25);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1158, 'Contrabajos', 25);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1159, 'Cornetas', 25);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1160, 'Cornetines', 25);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1161, 'Cornos ingleses', 25);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1162, 'Cuadros artísticos', 25);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1163, 'Discos musicales', 25);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1164, 'Estatuas (excepto las situadas en plazas públicas)', 25);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1165, 'Flautas', 25);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1166, 'Flautines', 25);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1167, 'Guitarras', 25);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1168, 'Joyas', 25);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1169, 'Laúdes', 25);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1170, 'Liras', 25);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1171, 'Mandolas', 25);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1172, 'Mandolinas', 25);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1173, 'Metrónomos', 25);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1174, 'Objetos ornamentales', 25);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1175, 'Oboes', 25);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1176, 'Órganos', 25);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1177, 'Pianos', 25);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1178, 'Platillos', 25);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1179, 'Tambores', 25);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1180, 'Timbales', 25);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1181, 'Triángulos', 25);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1182, 'Trombones', 25);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1183, 'Trompas', 25);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1184, 'Trompetas', 25);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1185, 'Tubas', 25);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1186, 'Redoblantes', 25);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1187, 'Saxofones', 25);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1188, 'Violas', 25);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1189, 'Violines', 25);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1190, 'Violoncelos', 25);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1191, 'Xilófonos', 25);

INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1192, 'Otros equipos científicos religiosos de enseñanza y recreación', 26);

INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1193, 'Escopetas', 27);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1194, 'Fusiles', 27);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1195, 'Pistolas', 27);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1196, 'Revólveres', 27);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1197, 'Sub-ametrelladoras', 27);

INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1198, 'Otros equipos para la defensa y seguridad pública', 28);

INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1199, 'Acondicionadores de aire', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1200, 'Alfombras', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1201, 'Anaqueles (ver estantes)', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1202, 'Archivadores de gavetas', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1203, 'Archivadores de puertas', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1204, 'Aspiradoras', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1205, 'Balanzas', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1206, 'Bancos (asientos)', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1207, 'Bancos (mesas)', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1208, 'Banderas nacionales', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1209, 'Bibliotecas', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1210, 'Borradores eléctricos', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1211, 'Burros (ver caballetes)', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1212, 'Caballetes', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1213, 'Cafeteras', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1214, 'Cajas fuertes', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1215, 'Cajas registradoras', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1216, 'Calculadoras', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1217, 'Carteleras', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1218, 'Carteleras', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1219, 'Ceniceros de pie', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1220, 'Cestas para botar papeles', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1221, 'Cestas para escritorios', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1222, 'Circuladores de aire', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1223, 'Compases', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1224, 'Comptómetros', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1225, 'Cortinas', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1226, 'Cortineros', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1227, 'Curvígrafos', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1228, 'Dictáfonos', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1229, 'Díngrafos', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1230, 'Dispensadores de cinta engomada', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1231, 'Enfriadores de agua', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1232, 'Engrapadoras', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1233, 'Escalímetros', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1234, 'Escaparates', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1235, 'Escritorios', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1236, 'Escuadras', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1237, 'Escudos nacionales', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1238, 'Espaciadores para máquinas de escribir', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1239, 'Estantes', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1240, 'Estenógrafos (máquinas)', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1241, 'Estuches de matemáticas', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1242, 'Estuches de plantillas', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1243, 'Ficheros (tarjeteros)', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1244, 'Fotocopiadoras', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1245, 'Gabinetes', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1246, 'Guillotinas para papel manuales', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1247, 'Grabadores de sonido', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1248, 'Impresoras de rótulos', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1249, 'Juegos de instrumentos para dibujo', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1250, 'Juegos de muebles para recibo', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1251, 'Kardex', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1252, 'Lámparas móviles', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1253, 'Litografías montadas en marcos (ver cuadros)', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1254, 'Lockers (ver escaparates)', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1255, 'Maletines', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1256, 'Mapas montados en marcos (ver cuadros)', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1257, 'Mapotecas (ver planotecas)', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1258, 'Máquinas de contabilidad', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1259, 'Máquinas de escribir', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1260, 'Máquinas eléctricas y electrónicas de contabilidad', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1261, 'Máquinas foliadoras (ver numeradoras)', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1262, 'Máquinas franqueadoras de correspondencia', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1263, 'Mesas', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1264, 'Microfilmadoras', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1265, 'Mimeógrafos', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1266, 'Multígrafos', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1267, 'Neveras', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1268, 'Normógrafos', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1269, 'Numeradoras', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1270, 'Organigramas montados (ver cuadros)', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1271, 'Pantógrafos', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1272, 'Percheros', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1273, 'Perforadoras para mas de 2 ojetes', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1274, 'Pesa-cartas', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1275, 'Pizarrones', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1276, 'Planímetros', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1277, 'Planotecas', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1278, 'Plantillas de dibujo', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1279, 'Poltronas', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1280, 'Porta-copias', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1281, 'Prensas para copias', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1282, 'Protectoras de cheques', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1283, 'Proyectores para dibujo', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1284, 'Reglas', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1285, 'Relojes', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1286, 'Relojes de control', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1287, 'Relojes fechadores', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1288, 'Roperos', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1289, 'Saca-puntas', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1290, 'Sellos-prensa metálicos', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1291, 'Sillas para escritorios', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1292, 'Sofás', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1293, 'Soportes para sellos', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1294, 'Sumadoras', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1295, 'Tableros (ni pizarrones ni carteleras)', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1296, 'Taburetes', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1297, 'Teléfonos (internos)', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1298, 'Transportadores', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1299, 'Televisores', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1300, 'Ventiladores', 1);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1301, 'Vitrinas', 1);

INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1302, 'Adaptador de bienes múltiples', 2);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1303, 'Cadena de impresora intercambiable', 2);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1304, 'Discos', 2);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1305, 'Lectora óptica', 2);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1306, 'Lectora de tarjeta', 2);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1307, 'Lectora de cintas de papel', 2);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1308, 'Microcomputador', 2);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1309, 'Modulador y desmodulador (modem)', 2);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1310, 'Perforadora de tarjeta', 2);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1311, 'Perforadora de cinta de papel', 2);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1312, 'Terminal con teclado', 2);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1313, 'Unidad central de proceso (CPU)', 2);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1314, 'Unidad de control de líneas remotas', 2);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1315, 'Unidad de control local de terminales', 2);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1316, 'Unidad de control remoto de terminales', 2);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1317, 'Unidad de control de cinta', 2);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1318, 'Unidad de control de impresora', 2);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1319, 'Unidad de cinta magnética', 2);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1320, 'Unidad de acceso directo (discos)', 2);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1321, 'Unidad de diskettes', 2);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1322, 'Unidad impresora', 2);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1323, 'Visores de microfichas', 2);

INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1324, 'Acondicionadores de aire', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1325, 'Acuarios', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1326, 'Alfombras', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1327, 'Anaqueles (ver estantes)', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1328, 'Aparadores', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1329, 'Aparatos desmanchadores para lavanderas', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1330, 'Armarios (ver escaparates)', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1331, 'Atomizadores', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1332, 'Azafates', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1333, 'Balanzas', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1334, 'Bancas y banquetas (ver bancos)', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1335, 'Bancos (asientos)', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1336, 'Bancos (mesas)', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1337, 'Banderas nacionales', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1338, 'Bañeras móviles', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1339, 'Bares', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1340, 'Barqueos', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1341, 'Bases para alfombras', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1342, 'Batidoras', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1343, 'Bibelots (ver objetos decorativos)', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1344, 'Biombos', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1345, 'Botiquines', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1346, 'Butacas (ver poltronas)', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1347, 'Burros (ver caballetes)', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1348, 'Caballetes', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1349, 'Cafeteras', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1350, 'Calderos', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1351, 'Calentadores', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1352, 'Camas', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1353, 'Canapés (ver sofás)', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1354, 'Cantaras', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1355, 'Carros de comida', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1356, 'Cocinas móviles', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1357, 'Cocinillas portátiles', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1358, 'Cofres', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1359, 'Cómodas', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1360, 'Congeladoras', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1361, 'Conservadoras', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1362, 'Consolas', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1363, 'Cortadoras de césped', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1364, 'Cortinas', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1365, 'Cortineros', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1366, 'Cunas', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1367, 'Chiffonieres (ver cómodas)', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1368, 'Chinchorros', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1369, 'Divanes (ver sofás)', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1370, 'Enfriadores de agua', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1371, 'Equipos para desperdicios', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1372, 'Escabeles', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1373, 'Escaparates', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1374, 'Escudos nacionales', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1375, 'Estantes', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1376, 'Espejos', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1377, 'Estufas móviles', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1378, 'Exprimidoras', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1379, 'Exprimidoras de lavandera', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1380, 'Filtros de agua', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1381, 'Floreros', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1382, 'Freidores', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1383, 'Gabinetes', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1384, 'Gaveteros (ver cómodas)', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1385, 'Grecas para el café', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1386, 'Hamacas', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1387, 'Jardineras móviles', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1388, 'Jarrones', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1389, 'Juegos de cristal', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1390, 'Juegos de dormitorio', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1391, 'Juegos de muebles de comedor', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1392, 'Juegos de muebles de recibo', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1393, 'Juegos de pesas para balanzas', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1394, 'Juego de porcelana', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1395, 'Lámparas móviles', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1396, 'Lavabos móviles', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1397, 'Lavacopas y vasos', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1398, 'Lavadoras de ropa', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1399, 'Lavaplatos móviles', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1400, 'Licuadoras', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1401, 'Máquinas ayudante de cocina', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1402, 'Máquinas amasadoras', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1403, 'Máquinas de afeitar', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1404, 'Máquinas de almidonar', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1405, 'Máquinas de coser', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1406, 'Máquinas de planchar', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1407, 'Máquinas para cortar carne', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1408, 'Máquinas para cortar jamón', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1409, 'Máquinas para fabricar cubos de hielo', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1410, 'Máquinas para hacer helados', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1411, 'Máquinas para lavar alfombras', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1412, 'Máquinas ralladoras', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1413, 'Máquinas secadoras de ropa', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1414, 'Marcadoras de ropa', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1415, 'Marmitas', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1416, 'Materos', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1417, 'Macedores', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1418, 'Mesas', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1419, 'Mesones', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1420, 'Molinos para carne', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1421, 'Molinos para granos', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1422, 'Mostradores', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1423, 'Neveras', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1424, 'Neveras-mostrador', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1425, 'Objetos decorativos', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1426, 'Ollas grandes', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1427, 'Paravanes (ver biombos)', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1428, 'Parrillas móviles', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1429, 'Peinadoras (ver tocadores)', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1430, 'Peladoras de papas', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1431, 'Percheros', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1432, 'Persianas', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1433, 'Planchas eléctricas', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1434, 'Platones', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1435, 'Poltronas', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1436, 'Pulidoras de pisos', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1437, 'Purificadores de agua', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1438, 'Radio-receptores', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1439, 'Rebanadas de fiambres', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1440, 'Recipientes', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1441, 'Repisas', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1442, 'Revisteros', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1443, 'Roperos', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1444, 'Sartenes', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1445, 'Secadores de ropa', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1446, 'Sillas', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1447, 'Sillones (ver poltronas)', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1448, 'Sillones de barbera', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1449, 'Sofás', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1450, 'Taburetes', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1451, 'Tapetes (ver alfombras)', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1452, 'Tarimas', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1453, 'Televisores', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1454, 'Tiendas de campaña', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1455, 'Tinajeros', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1456, 'Tocadores', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1457, 'Tostadoras', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1458, 'Vajillas de lujo', 3);
INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1459, 'Video grabadores', 3);

INSERT INTO tescae (cae_ide, cae_cae, sca_ide) VALUES (1460, 'Otras maquinas muebles y demás equipos de oficina y alojamiento', 4);



-- TABLA TMAESU

INSERT INTO `tmaesu` (`esu_ide`, `esu_esu`) VALUES
(1, 'EN USO'),
(2, 'EN COMODATO'),
(3, 'EN ARRENDAMIENTO'),
(4, 'EN ALMACÉN O DEPÓSITO PARA SU ASIGNACIÓN'),
(5, 'ASIGNACIÓN O ADSCRIPCIÓN'),
(6, 'CONCESIÓN'),
(7, 'PERMISO'),
(8, 'AUTORIZACIÓN');

-- TABLA TMACON

INSERT INTO `tmacon` (`con_ide`, `con_con`) VALUES
(1, 'ÓPTIMO'),
(2, 'BUENO'),
(3, 'REGULAR'),
(4, 'EN MAL ESTADO'),
(5, 'AVERIADO'),
(6, 'CHATARRA'),
(7, 'NO OPERATIVO'),
(8, 'OTRA CONDICIÓN FÍSICA');

-- TABLA TMAFOA

INSERT INTO `tmafoa` (`foa_ide`, `foa_nom`) VALUES
(1, 'COMPRA'),
(2, 'PERMUTA'),
(3, 'DACIÓN EN PAGO'),
(4, 'DONACIÓN'),
(5, 'TRANSFERENCIA'),
(6, 'EXPROPIACIÓN'),
(7, 'CONFISCACIÓN'),
(8, 'APORTE A CAPITAL SOCIAL'),
(9, 'COMISO'),
(10, 'EMBARGO'),
(11, 'NACIONALIZACIÓN'),
(12, 'FUSIÓN POR INCORPORACIÓN Y/O ABSORCIÓN'),
(13, 'CUSTODIA / ASIGNACIÓN'),
(14, 'CUSTODIA / BIENES SIN TITULARIDAD'),
(15, 'CESION DE DERECHOS'),
(16, 'ADJUDICACION');

-- TABLA TESCEP (CAJA DE AHORRO)

INSERT INTO `tescep` (`cep_ide`, `cep_activa`, `nom_ced`) VALUES ('1', '1', '18845038');
INSERT INTO `tescep` (`cep_ide`, `cep_activa`, `nom_ced`) VALUES ('2', '1', '17368181');

-- TABLA TESANT (ANTIGUEDADES DE LOS EMPLEADOS)

INSERT INTO `tesant` (`ant_ide`, `ant_ani`, `ant_anf`, `nom_ced`) VALUES ('1', '2014-01-07', '2014-09-30', '17368181');
INSERT INTO `tesant` (`ant_ide`, `ant_ani`, `ant_anf`, `nom_ced`) VALUES ('2', '2019-03-14', '2022-01-17', '17368181');
INSERT INTO `tesant` (`ant_ide`, `ant_ani`, `ant_anf`, `nom_ced`) VALUES ('3', '2008-09-11', '2011-05-20', '17368181');
INSERT INTO `tesant` (`ant_ide`, `ant_ani`, `ant_anf`, `nom_ced`) VALUES ('4', '2011-02-09', '2011-03-10', '17368181');


INSERT INTO `tmaest`(`est_ide`, `est_est`) VALUES ('4','Operativo'), ('1', 'Sin etiqueta'), ('2', 'Inoperativo'), ('3', 'Faltante');

INSERT INTO tmacom (com_ide, com_com) VALUES (1, 'Inventario inicial');
INSERT INTO tmacom (com_ide, com_com) VALUES (2, 'Incorporación por traspaso');
INSERT INTO tmacom (com_ide, com_com) VALUES (3, 'Compras');
INSERT INTO tmacom (com_ide, com_com) VALUES (4, 'Construcción de inmuebles');
INSERT INTO tmacom (com_ide, com_com) VALUES (5, 'Adiciones y mejoras');
INSERT INTO tmacom (com_ide, com_com) VALUES (6, 'Producción de elementos (muebles)');
INSERT INTO tmacom (com_ide, com_com) VALUES (7, 'Suministro de bienes de otras entidades');
INSERT INTO tmacom (com_ide, com_com) VALUES (8, 'Devolución de bienes suministrados a contratistas');
INSERT INTO tmacom (com_ide, com_com) VALUES (9, 'Nacimiento de semovientes');
INSERT INTO tmacom (com_ide, com_com) VALUES (10, 'Reconstrucción de equipos');
INSERT INTO tmacom (com_ide, com_com) VALUES (11, 'Incorporación por donación');
INSERT INTO tmacom (com_ide, com_com) VALUES (12, 'Incorporación por permuta');
INSERT INTO tmacom (com_ide, com_com) VALUES (13, 'Adscripción de bienes');
INSERT INTO tmacom (com_ide, com_com) VALUES (14, 'Omisión de inventario');
INSERT INTO tmacom (com_ide, com_com) VALUES (15, 'Incorporación por cambio de sub-agrupación');
INSERT INTO tmacom (com_ide, com_com) VALUES (16, 'Corrección de desincorporaciones');
INSERT INTO tmacom (com_ide, com_com) VALUES (17, 'Incorporaciones por otros conceptos');
INSERT INTO tmacom (com_ide, com_com) VALUES (18, 'Incorporación de muebles procedentes de los almacenes');
INSERT INTO tmacom (com_ide, com_com) VALUES (19, 'Desincorporación por traspaso');
INSERT INTO tmacom (com_ide, com_com) VALUES (20, 'Ventas');
INSERT INTO tmacom (com_ide, com_com) VALUES (21, 'Suministro de bienes a contratistas');
INSERT INTO tmacom (com_ide, com_com) VALUES (22, 'Suministro de bienes a otras entidades');
INSERT INTO tmacom (com_ide, com_com) VALUES (23, 'Desarme');
INSERT INTO tmacom (com_ide, com_com) VALUES (24, 'Inservibilidad');
INSERT INTO tmacom (com_ide, com_com) VALUES (25, 'Deterioro');
INSERT INTO tmacom (com_ide, com_com) VALUES (26, 'Demolición');
INSERT INTO tmacom (com_ide, com_com) VALUES (27, 'Muerte por semovientes');
INSERT INTO tmacom (com_ide, com_com) VALUES (28, 'Faltantes por investigar');
INSERT INTO tmacom (com_ide, com_com) VALUES (29, 'Desincorporación por Permuta');
INSERT INTO tmacom (com_ide, com_com) VALUES (30, 'Desincorporación por Donación');
INSERT INTO tmacom (com_ide, com_com) VALUES (31, 'Desincorporación por adscripción');
INSERT INTO tmacom (com_ide, com_com) VALUES (32, 'Desincorporación por cambio de Sub-agrupación');
INSERT INTO tmacom (com_ide, com_com) VALUES (33, 'Corrección de Incorporaciones');
INSERT INTO tmacom (com_ide, com_com) VALUES (34, 'Desincorporaciones por otros conceptos');

-- FUTUROS VOLCADOS EN LA BASE DE DATOS

-- CIERRE DE FUTUROS VOLCADOS EN LA BASE DE DATOS

/* INICIO DE DISPARADORES DE LA BASE DE DATOS */
  /* TRIGGER PARA TABLA TESUSU */
    DELIMITER //

    CREATE TRIGGER `despues_insertar_usuario`
    AFTER INSERT ON `tesusu`
    FOR EACH ROW
    BEGIN
        INSERT INTO `bit_usu` (
            `bit_tabla`,
            `bit_operacion`,
            `bit_usu_ide`,
            `bit_usu_usu`,
            `bit_usuario_responsable`,
            `bit_detalles`
        ) VALUES (
            'tesusu',
            'INSERT',
            NEW.usu_ide,
            NEW.usu_usu,
            IFNULL(@usuario_php, 'SISTEMA'),
            JSON_OBJECT(
                'nuevo_registro', JSON_OBJECT(
                    'usu_usu', NEW.usu_usu,
                    'usu_con', '[PROTEGIDO]',
                    'usu_nom', NEW.usu_nom,
                    'usu_ape', NEW.usu_ape,
                    'usu_tip', NEW.usu_tip,
                    'usu_mod', NEW.usu_mod,
                    'nom_ced', NEW.nom_ced
                )
            )
        );
    END//

    CREATE TRIGGER `despues_actualizar_usuario`
    AFTER UPDATE ON `tesusu`
    FOR EACH ROW
    BEGIN
        DECLARE cambios JSON DEFAULT JSON_OBJECT();
        
        -- Solo registrar campos que realmente cambiaron
        IF NEW.usu_usu != OLD.usu_usu THEN
            SET cambios = JSON_SET(cambios, '$.usu_usu', JSON_OBJECT('antes', OLD.usu_usu, 'ahora', NEW.usu_usu));
        END IF;
        
        IF NEW.usu_con != OLD.usu_con THEN
            SET cambios = JSON_SET(cambios, '$.usu_con', JSON_OBJECT('antes', '[PROTEGIDO]', 'ahora', '[PROTEGIDO]'));
        END IF;
        
        IF NEW.usu_nom != OLD.usu_nom THEN
            SET cambios = JSON_SET(cambios, '$.usu_nom', JSON_OBJECT('antes', OLD.usu_nom, 'ahora', NEW.usu_nom));
        END IF;
        
        IF NEW.usu_ape != OLD.usu_ape THEN
            SET cambios = JSON_SET(cambios, '$.usu_ape', JSON_OBJECT('antes', OLD.usu_ape, 'ahora', NEW.usu_ape));
        END IF;
        
        IF NEW.usu_tip != OLD.usu_tip THEN
            SET cambios = JSON_SET(cambios, '$.usu_tip', JSON_OBJECT('antes', OLD.usu_tip, 'ahora', NEW.usu_tip));
        END IF;
        
        IF NEW.usu_mod != OLD.usu_mod THEN
            SET cambios = JSON_SET(cambios, '$.usu_mod', JSON_OBJECT('antes', OLD.usu_mod, 'ahora', NEW.usu_mod));
        END IF;
        
        IF NEW.nom_ced != OLD.nom_ced THEN
            SET cambios = JSON_SET(cambios, '$.nom_ced', JSON_OBJECT('antes', OLD.nom_ced, 'ahora', NEW.nom_ced));
        END IF;
        
        -- Solo registrar si hubo cambios reales
        IF JSON_LENGTH(cambios) > 0 THEN
            INSERT INTO `bit_usu` (
                `bit_tabla`,
                `bit_operacion`,
                `bit_usu_ide`,
                `bit_usu_usu`,
                `bit_usuario_responsable`,
                `bit_detalles`
            ) VALUES (
                'tesusu',
                'UPDATE',
                NEW.usu_ide,
                NEW.usu_usu,
                IFNULL(@usuario_php, 'SISTEMA'),
                cambios
            );
        END IF;
    END//

    CREATE TRIGGER `despues_eliminar_usuario`
    AFTER DELETE ON `tesusu`
    FOR EACH ROW
    BEGIN
        INSERT INTO `bit_usu` (
            `bit_tabla`,
            `bit_operacion`,
            `bit_usu_ide`,
            `bit_usu_usu`,
            `bit_usuario_responsable`,
            `bit_detalles`
        ) VALUES (
            'tesusu',
            'DELETE',
            OLD.usu_ide,
            OLD.usu_usu,
            IFNULL(@usuario_php, 'SISTEMA'),
            JSON_OBJECT(
                'registro_eliminado', JSON_OBJECT(
                    'usu_usu', OLD.usu_usu,
                    'usu_con', '[PROTEGIDO]',
                    'usu_nom', OLD.usu_nom,
                    'usu_ape', OLD.usu_ape,
                    'usu_tip', OLD.usu_tip,
                    'usu_mod', OLD.usu_mod,
                    'nom_ced', OLD.nom_ced
                )
            )
        );
    END//

    DELIMITER ;

    /* TRIGGER PARA TABLA TMANOM */
    DELIMITER //

    CREATE TRIGGER `despues_insertar_nomina`
    AFTER INSERT ON `tmanom`
    FOR EACH ROW
    BEGIN
        INSERT INTO `bit_nom` (
            `bit_tabla`,
            `bit_operacion`,
            `bit_nom_ced`,
            `bit_usuario_responsable`,
            `bit_detalles`
        ) VALUES (
            'tmanom',
            'INSERT',
            NEW.nom_ced,
            IFNULL(@usuario_php, 'SISTEMA'),
            JSON_OBJECT(
                'nuevo_registro', JSON_OBJECT(
                    'nom_nom', NEW.nom_nom,
                    'nom_ape', NEW.nom_ape,
                    'nom_fec', NEW.nom_fec,
                    'nom_gen', NEW.nom_gen,
                    'nom_nhi', NEW.nom_nhi,
                    'nom_pro', NEW.nom_pro,
                    'cet_ide', NEW.cet_ide,
                    'ona_ide', NEW.ona_ide,
                    'nvl_ran', NEW.nvl_ran,
                    'dep_ide', NEW.dep_ide
                )
            )
        );
    END//

    CREATE TRIGGER `despues_actualizar_nomina`
    AFTER UPDATE ON `tmanom`
    FOR EACH ROW
    BEGIN
        DECLARE cambios JSON DEFAULT JSON_OBJECT();
        
        IF NEW.nom_nom != OLD.nom_nom THEN
            SET cambios = JSON_SET(cambios, '$.nom_nom', JSON_OBJECT('antes', OLD.nom_nom, 'ahora', NEW.nom_nom));
        END IF;
        
        IF NEW.nom_ape != OLD.nom_ape THEN
            SET cambios = JSON_SET(cambios, '$.nom_ape', JSON_OBJECT('antes', OLD.nom_ape, 'ahora', NEW.nom_ape));
        END IF;
        
        IF NEW.nom_fec != OLD.nom_fec THEN
            SET cambios = JSON_SET(cambios, '$.nom_fec', JSON_OBJECT('antes', OLD.nom_fec, 'ahora', NEW.nom_fec));
        END IF;
        
        IF NEW.nom_gen != OLD.nom_gen THEN
            SET cambios = JSON_SET(cambios, '$.nom_gen', JSON_OBJECT('antes', OLD.nom_gen, 'ahora', NEW.nom_gen));
        END IF;
        
        IF NEW.nom_nhi != OLD.nom_nhi THEN
            SET cambios = JSON_SET(cambios, '$.nom_nhi', JSON_OBJECT('antes', OLD.nom_nhi, 'ahora', NEW.nom_nhi));
        END IF;
        
        IF NEW.nom_pro != OLD.nom_pro THEN
            SET cambios = JSON_SET(cambios, '$.nom_pro', JSON_OBJECT('antes', OLD.nom_pro, 'ahora', NEW.nom_pro));
        END IF;
        
        IF NEW.cet_ide != OLD.cet_ide THEN
            SET cambios = JSON_SET(cambios, '$.cet_ide', JSON_OBJECT('antes', OLD.cet_ide, 'ahora', NEW.cet_ide));
        END IF;
        
        IF NEW.ona_ide != OLD.ona_ide THEN
            SET cambios = JSON_SET(cambios, '$.ona_ide', JSON_OBJECT('antes', OLD.ona_ide, 'ahora', NEW.ona_ide));
        END IF;
        
        IF NEW.nvl_ran != OLD.nvl_ran THEN
            SET cambios = JSON_SET(cambios, '$.nvl_ran', JSON_OBJECT('antes', OLD.nvl_ran, 'ahora', NEW.nvl_ran));
        END IF;
        
        IF NEW.dep_ide != OLD.dep_ide THEN
            SET cambios = JSON_SET(cambios, '$.dep_ide', JSON_OBJECT('antes', OLD.dep_ide, 'ahora', NEW.dep_ide));
        END IF;
        
        IF JSON_LENGTH(cambios) > 0 THEN
            INSERT INTO `bit_nom` (
                `bit_tabla`,
                `bit_operacion`,
                `bit_nom_ced`,
                `bit_usuario_responsable`,
                `bit_detalles`
            ) VALUES (
                'tmanom',
                'UPDATE',
                NEW.nom_ced,
                IFNULL(@usuario_php, 'SISTEMA'),
                cambios
            );
        END IF;
    END//

    CREATE TRIGGER `despues_eliminar_nomina`
    AFTER DELETE ON `tmanom`
    FOR EACH ROW
    BEGIN
        INSERT INTO `bit_nom` (
            `bit_tabla`,
            `bit_operacion`,
            `bit_nom_ced`,
            `bit_usuario_responsable`,
            `bit_detalles`
        ) VALUES (
            'tmanom',
            'DELETE',
            OLD.nom_ced,
            IFNULL(@usuario_php, 'SISTEMA'),
            JSON_OBJECT(
                'registro_eliminado', JSON_OBJECT(
                    'nom_nom', OLD.nom_nom,
                    'nom_ape', OLD.nom_ape,
                    'nom_fec', OLD.nom_fec,
                    'nom_gen', OLD.nom_gen,
                    'nom_nhi', OLD.nom_nhi,
                    'nom_pro', OLD.nom_pro,
                    'cet_ide', OLD.cet_ide,
                    'ona_ide', OLD.ona_ide,
                    'nvl_ran', OLD.nvl_ran,
                    'dep_ide', OLD.dep_ide
                )
            )
        );
    END//

    DELIMITER ;

    /* TRIGGER PARA TABLA TESCET */
    DELIMITER //

    CREATE TRIGGER `despues_insertar_cargo_cet`
    AFTER INSERT ON `tescet`
    FOR EACH ROW
    BEGIN
        INSERT INTO `bit_cet` (
            `bit_tabla`,
            `bit_operacion`,
            `bit_cet_ide`,
            `bit_usuario_responsable`,
            `bit_detalles`
        ) VALUES (
            'tescet',
            'INSERT',
            NEW.cet_ide,
            IFNULL(@usuario_php, 'SISTEMA'),
            JSON_OBJECT(
                'nuevo_registro', JSON_OBJECT(
                    'cet_car', NEW.cet_car
                )
            )
        );
    END//

    CREATE TRIGGER `despues_actualizar_cargo_cet`
    AFTER UPDATE ON `tescet`
    FOR EACH ROW
    BEGIN
        IF NEW.cet_car != OLD.cet_car THEN
            INSERT INTO `bit_cet` (
                `bit_tabla`,
                `bit_operacion`,
                `bit_cet_ide`,
                `bit_usuario_responsable`,
                `bit_detalles`
            ) VALUES (
                'tescet',
                'UPDATE',
                NEW.cet_ide,
                IFNULL(@usuario_php, 'SISTEMA'),
                JSON_OBJECT(
                    'cet_car', JSON_OBJECT(
                        'antes', OLD.cet_car,
                        'ahora', NEW.cet_car
                    )
                )
            );
        END IF;
    END//

    CREATE TRIGGER `despues_eliminar_cargo_cet`
    AFTER DELETE ON `tescet`
    FOR EACH ROW
    BEGIN
        INSERT INTO `bit_cet` (
            `bit_tabla`,
            `bit_operacion`,
            `bit_cet_ide`,
            `bit_usuario_responsable`,
            `bit_detalles`
        ) VALUES (
            'tescet',
            'DELETE',
            OLD.cet_ide,
            IFNULL(@usuario_php, 'SISTEMA'),
            JSON_OBJECT(
                'registro_eliminado', JSON_OBJECT(
                    'cet_car', OLD.cet_car
                )
            )
        );
    END//

    DELIMITER ;

    /* TRIGGER PARA TABLA TESONA */
    DELIMITER //

    CREATE TRIGGER `despues_insertar_cargo_onapre`
    AFTER INSERT ON `tesona`
    FOR EACH ROW
    BEGIN
        INSERT INTO `bit_ona` (
            `bit_tabla`,
            `bit_operacion`,
            `bit_ona_ide`,
            `bit_usuario_responsable`,
            `bit_detalles`
        ) VALUES (
            'tesona',
            'INSERT',
            NEW.ona_ide,
            IFNULL(@usuario_php, 'SISTEMA'),
            JSON_OBJECT(
                'nuevo_registro', JSON_OBJECT(
                    'ona_car', NEW.ona_car
                )
            )
        );
    END//

    CREATE TRIGGER `despues_actualizar_cargo_onapre`
    AFTER UPDATE ON `tesona`
    FOR EACH ROW
    BEGIN
        IF NEW.ona_car != OLD.ona_car THEN
            INSERT INTO `bit_ona` (
                `bit_tabla`,
                `bit_operacion`,
                `bit_ona_ide`,
                `bit_usuario_responsable`,
                `bit_detalles`
            ) VALUES (
                'tesona',
                'UPDATE',
                NEW.ona_ide,
                IFNULL(@usuario_php, 'SISTEMA'),
                JSON_OBJECT(
                    'ona_car', JSON_OBJECT(
                        'antes', OLD.ona_car,
                        'ahora', NEW.ona_car
                    )
                )
            );
        END IF;
    END//

    CREATE TRIGGER `despues_eliminar_cargo_onapre`
    AFTER DELETE ON `tesona`
    FOR EACH ROW
    BEGIN
        INSERT INTO `bit_ona` (
            `bit_tabla`,
            `bit_operacion`,
            `bit_ona_ide`,
            `bit_usuario_responsable`,
            `bit_detalles`
        ) VALUES (
            'tesona',
            'DELETE',
            OLD.ona_ide,
            IFNULL(@usuario_php, 'SISTEMA'),
            JSON_OBJECT(
                'registro_eliminado', JSON_OBJECT(
                    'ona_car', OLD.ona_car
                )
            )
        );
    END//

    DELIMITER ;

    /* TRIGGER PARA TABLA TESNVL */
    DELIMITER //

    CREATE TRIGGER `despues_actualizar_nivel`
    AFTER UPDATE ON `tesnvl`
    FOR EACH ROW
    BEGIN
        DECLARE cambios JSON DEFAULT JSON_OBJECT();
        
        IF NEW.nvl_ran != OLD.nvl_ran THEN
            SET cambios = JSON_SET(cambios, '$.nvl_ran', JSON_OBJECT('antes', OLD.nvl_ran, 'ahora', NEW.nvl_ran));
        END IF;
        
        IF NEW.nvl_sal != OLD.nvl_sal THEN
            SET cambios = JSON_SET(cambios, '$.nvl_sal', JSON_OBJECT('antes', OLD.nvl_sal, 'ahora', NEW.nvl_sal));
            
            -- Registrar en histórico cuando cambia el salario
            INSERT INTO `tesnvl_historico` (
                `nvl_ran`,
                `nvl_sal`,
                `ona_ide`,
                `nvl_fec`
            ) VALUES (
                OLD.nvl_ran,
                OLD.nvl_sal,
                OLD.ona_ide,
                CURDATE()
            );
        END IF;
        
        IF NEW.ona_ide != OLD.ona_ide THEN
            SET cambios = JSON_SET(cambios, '$.ona_ide', JSON_OBJECT('antes', OLD.ona_ide, 'ahora', NEW.ona_ide));
        END IF;
        
        IF JSON_LENGTH(cambios) > 0 THEN
            INSERT INTO `bit_nvl` (
                `bit_tabla`,
                `bit_operacion`,
                `bit_nvl_ide`,
                `bit_usuario_responsable`,
                `bit_detalles`
            ) VALUES (
                'tesnvl',
                'UPDATE',
                NEW.nvl_ide,
                IFNULL(@usuario_php, 'SISTEMA'),
                cambios
            );
        END IF;
    END//

    CREATE TRIGGER `despues_eliminar_nivel`
    AFTER DELETE ON `tesnvl`
    FOR EACH ROW
    BEGIN
        INSERT INTO `bit_nvl` (
            `bit_tabla`,
            `bit_operacion`,
            `bit_nvl_ide`,
            `bit_usuario_responsable`,
            `bit_detalles`
        ) VALUES (
            'tesnvl',
            'DELETE',
            OLD.nvl_ide,
            IFNULL(@usuario_php, 'SISTEMA'),
            JSON_OBJECT(
                'registro_eliminado', JSON_OBJECT(
                    'nvl_ran', OLD.nvl_ran,
                    'nvl_sal', OLD.nvl_sal,
                    'ona_ide', OLD.ona_ide
                )
            )
        );
    END//

    DELIMITER ;

    /* TRIGGER PARA TABLA TESSUP */
    DELIMITER //

    CREATE TRIGGER `despues_insertar_suplencia`
    AFTER INSERT ON `tessup`
    FOR EACH ROW
    BEGIN
        INSERT INTO `bit_sup` (
            `bit_tabla`,
            `bit_operacion`,
            `bit_sup_ide`,
            `bit_usuario_responsable`,
            `bit_detalles`
        ) VALUES (
            'tessup',
            'INSERT',
            NEW.sup_ide,
            IFNULL(@usuario_php, 'SISTEMA'),
            JSON_OBJECT(
                'nuevo_registro', JSON_OBJECT(
                    'nom_ced', NEW.nom_ced,
                    'sup_fec_ini', NEW.sup_fec_ini,
                    'sup_fec_fin', NEW.sup_fec_fin,
                    'cet_ide', NEW.cet_ide,
                    'ona_ide', NEW.ona_ide,
                    'nvl_ran', NEW.nvl_ran,
                    'dep_ide', NEW.dep_ide,
                    'sup_activa', NEW.sup_activa
                )
            )
        );
    END//

    CREATE TRIGGER `despues_actualizar_suplencia`
    AFTER UPDATE ON `tessup`
    FOR EACH ROW
    BEGIN
        DECLARE cambios JSON DEFAULT JSON_OBJECT();
        
        IF NEW.nom_ced != OLD.nom_ced THEN
            SET cambios = JSON_SET(cambios, '$.nom_ced', JSON_OBJECT('antes', OLD.nom_ced, 'ahora', NEW.nom_ced));
        END IF;
        
        IF NEW.sup_fec_ini != OLD.sup_fec_ini THEN
            SET cambios = JSON_SET(cambios, '$.sup_fec_ini', JSON_OBJECT('antes', OLD.sup_fec_ini, 'ahora', NEW.sup_fec_ini));
        END IF;
        
        IF NEW.sup_fec_fin != OLD.sup_fec_fin THEN
            SET cambios = JSON_SET(cambios, '$.sup_fec_fin', JSON_OBJECT('antes', OLD.sup_fec_fin, 'ahora', NEW.sup_fec_fin));
        END IF;
        
        IF NEW.cet_ide != OLD.cet_ide THEN
            SET cambios = JSON_SET(cambios, '$.cet_ide', JSON_OBJECT('antes', OLD.cet_ide, 'ahora', NEW.cet_ide));
        END IF;
        
        IF NEW.ona_ide != OLD.ona_ide THEN
            SET cambios = JSON_SET(cambios, '$.ona_ide', JSON_OBJECT('antes', OLD.ona_ide, 'ahora', NEW.ona_ide));
        END IF;
        
        IF NEW.nvl_ran != OLD.nvl_ran THEN
            SET cambios = JSON_SET(cambios, '$.nvl_ran', JSON_OBJECT('antes', OLD.nvl_ran, 'ahora', NEW.nvl_ran));
        END IF;
        
        IF NEW.dep_ide != OLD.dep_ide THEN
            SET cambios = JSON_SET(cambios, '$.dep_ide', JSON_OBJECT('antes', OLD.dep_ide, 'ahora', NEW.dep_ide));
        END IF;
        
        IF NEW.sup_activa != OLD.sup_activa THEN
            SET cambios = JSON_SET(cambios, '$.sup_activa', JSON_OBJECT('antes', OLD.sup_activa, 'ahora', NEW.sup_activa));
        END IF;
        
        IF JSON_LENGTH(cambios) > 0 THEN
            INSERT INTO `bit_sup` (
                `bit_tabla`,
                `bit_operacion`,
                `bit_sup_ide`,
                `bit_usuario_responsable`,
                `bit_detalles`
            ) VALUES (
                'tessup',
                'UPDATE',
                NEW.sup_ide,
                IFNULL(@usuario_php, 'SISTEMA'),
                cambios
            );
        END IF;
    END//

    CREATE TRIGGER `despues_eliminar_suplencia`
    AFTER DELETE ON `tessup`
    FOR EACH ROW
    BEGIN
        INSERT INTO `bit_sup` (
            `bit_tabla`,
            `bit_operacion`,
            `bit_sup_ide`,
            `bit_usuario_responsable`,
            `bit_detalles`
        ) VALUES (
            'tessup',
            'DELETE',
            OLD.sup_ide,
            IFNULL(@usuario_php, 'SISTEMA'),
            JSON_OBJECT(
                'registro_eliminado', JSON_OBJECT(
                    'nom_ced', OLD.nom_ced,
                    'sup_fec_ini', OLD.sup_fec_ini,
                    'sup_fec_fin', OLD.sup_fec_fin,
                    'cet_ide', OLD.cet_ide,
                    'ona_ide', OLD.ona_ide,
                    'nvl_ran', OLD.nvl_ran,
                    'dep_ide', OLD.dep_ide,
                    'sup_activa', OLD.sup_activa
                )
            )
        );
    END//

    DELIMITER ;

    /* TRIGGER PARA TABLA TESCEP */
    DELIMITER //

    CREATE TRIGGER `despues_insertar_caja_ahorro`
    AFTER INSERT ON `tescep`
    FOR EACH ROW
    BEGIN
        INSERT INTO `bit_cep` (
            `bit_tabla`,
            `bit_operacion`,
            `bit_cep_ide`,
            `bit_usuario_responsable`,
            `bit_detalles`
        ) VALUES (
            'tescep',
            'INSERT',
            NEW.cep_ide,
            IFNULL(@usuario_php, 'SISTEMA'),
            JSON_OBJECT(
                'nuevo_registro', JSON_OBJECT(
                    'cep_activa', NEW.cep_activa,
                    'nom_ced', NEW.nom_ced
                )
            )
        );
    END//

    CREATE TRIGGER `despues_actualizar_caja_ahorro`
    AFTER UPDATE ON `tescep`
    FOR EACH ROW
    BEGIN
        DECLARE cambios JSON DEFAULT JSON_OBJECT();
        
        IF NEW.cep_activa != OLD.cep_activa THEN
            SET cambios = JSON_SET(cambios, '$.cep_activa', JSON_OBJECT('antes', OLD.cep_activa, 'ahora', NEW.cep_activa));
        END IF;
        
        IF NEW.nom_ced != OLD.nom_ced THEN
            SET cambios = JSON_SET(cambios, '$.nom_ced', JSON_OBJECT('antes', OLD.nom_ced, 'ahora', NEW.nom_ced));
        END IF;
        
        IF JSON_LENGTH(cambios) > 0 THEN
            INSERT INTO `bit_cep` (
                `bit_tabla`,
                `bit_operacion`,
                `bit_cep_ide`,
                `bit_usuario_responsable`,
                `bit_detalles`
            ) VALUES (
                'tescep',
                'UPDATE',
                NEW.cep_ide,
                IFNULL(@usuario_php, 'SISTEMA'),
                cambios
            );
        END IF;
    END//

    CREATE TRIGGER `despues_eliminar_caja_ahorro`
    AFTER DELETE ON `tescep`
    FOR EACH ROW
    BEGIN
        INSERT INTO `bit_cep` (
            `bit_tabla`,
            `bit_operacion`,
            `bit_cep_ide`,
            `bit_usuario_responsable`,
            `bit_detalles`
        ) VALUES (
            'tescep',
            'DELETE',
            OLD.cep_ide,
            IFNULL(@usuario_php, 'SISTEMA'),
            JSON_OBJECT(
                'registro_eliminado', JSON_OBJECT(
                    'cep_activa', OLD.cep_activa,
                    'nom_ced', OLD.nom_ced
                )
            )
        );
    END//

    DELIMITER ;

    /* TRIGGER PARA TABLA TESDED */
    DELIMITER //

    CREATE TRIGGER `despues_actualizar_deduccion`
    AFTER UPDATE ON `tesded`
    FOR EACH ROW
    BEGIN
        DECLARE cambios JSON DEFAULT JSON_OBJECT();
        
        IF NEW.ded_raz != OLD.ded_raz THEN
            SET cambios = JSON_SET(cambios, '$.ded_raz', JSON_OBJECT('antes', OLD.ded_raz, 'ahora', NEW.ded_raz));
        END IF;
        
        IF NEW.ded_por != OLD.ded_por THEN
            SET cambios = JSON_SET(cambios, '$.ded_por', JSON_OBJECT('antes', OLD.ded_por, 'ahora', NEW.ded_por));
        END IF;
        
        IF JSON_LENGTH(cambios) > 0 THEN
            INSERT INTO `bit_ded` (
                `bit_tabla`,
                `bit_operacion`,
                `bit_ded_ide`,
                `bit_usuario_responsable`,
                `bit_detalles`
            ) VALUES (
                'tesded',
                'UPDATE',
                NEW.ded_ide,
                IFNULL(@usuario_php, 'SISTEMA'),
                cambios
            );
        END IF;
    END//

    CREATE TRIGGER `despues_eliminar_deduccion`
    AFTER DELETE ON `tesded`
    FOR EACH ROW
    BEGIN
        INSERT INTO `bit_ded` (
            `bit_tabla`,
            `bit_operacion`,
            `bit_ded_ide`,
            `bit_usuario_responsable`,
            `bit_detalles`
        ) VALUES (
            'tesded',
            'DELETE',
            OLD.ded_ide,
            IFNULL(@usuario_php, 'SISTEMA'),
            JSON_OBJECT(
                'registro_eliminado', JSON_OBJECT(
                    'ded_raz', OLD.ded_raz,
                    'ded_por', OLD.ded_por
                )
            )
        );
    END//

    DELIMITER ;

    /* TRIGGER PARA TABLA TESPRI */
    DELIMITER //

    CREATE TRIGGER `despues_actualizar_prima`
    AFTER UPDATE ON `tespri`
    FOR EACH ROW
    BEGIN
        DECLARE cambios JSON DEFAULT JSON_OBJECT();
        
        IF NEW.pri_raz != OLD.pri_raz THEN
            SET cambios = JSON_SET(cambios, '$.pri_raz', JSON_OBJECT('antes', OLD.pri_raz, 'ahora', NEW.pri_raz));
        END IF;
        
        IF NEW.pri_por != OLD.pri_por THEN
            SET cambios = JSON_SET(cambios, '$.pri_por', JSON_OBJECT('antes', OLD.pri_por, 'ahora', NEW.pri_por));
        END IF;
        
        IF JSON_LENGTH(cambios) > 0 THEN
            INSERT INTO `bit_pri` (
                `bit_tabla`,
                `bit_operacion`,
                `bit_pri_ide`,
                `bit_usuario_responsable`,
                `bit_detalles`
            ) VALUES (
                'tespri',
                'UPDATE',
                NEW.pri_ide,
                IFNULL(@usuario_php, 'SISTEMA'),
                cambios
            );
        END IF;
    END//

    CREATE TRIGGER `despues_eliminar_prima`
    AFTER DELETE ON `tespri`
    FOR EACH ROW
    BEGIN
        INSERT INTO `bit_pri` (
            `bit_tabla`,
            `bit_operacion`,
            `bit_pri_ide`,
            `bit_usuario_responsable`,
            `bit_detalles`
        ) VALUES (
            'tespri',
            'DELETE',
            OLD.pri_ide,
            IFNULL(@usuario_php, 'SISTEMA'),
            JSON_OBJECT(
                'registro_eliminado', JSON_OBJECT(
                    'pri_raz', OLD.pri_raz,
                    'pri_por', OLD.pri_por
                )
            )
        );
    END//

    DELIMITER ;

/* TRIGGER PARA TABLA TMAB_M */
DELIMITER $$

-- 1. Trigger para INSERT: 'despues_insertar_bienes'
-- Se ejecuta DESPUÉS de insertar un nuevo bien en tmab_m
CREATE TRIGGER `despues_insertar_bienes`
AFTER INSERT ON `tmab_m`
FOR EACH ROW
BEGIN
    INSERT INTO `bitb_m` (
        `usuario_id`,
        `fecha_hora`,
        `registro_id_afectado`,
        `tipo_cambio`,
        `datos_antiguos`,
        `datos_nuevos`
    )
    VALUES (
        @user_id_for_audit,             -- El ID de usuario establecido por tu aplicación
        NOW(),                          -- La fecha y hora actual
        NEW.bim_ide,                    -- El ID del nuevo bien insertado
        'INSERTO',                       -- Tipo de cambio
        NULL,                           -- No hay datos antiguos para una inserción
        JSON_OBJECT(                    -- Todos los datos del nuevo registro en JSON
            'bim_ide', NEW.bim_ide,
            'bim_des', NEW.bim_des,
            'bim_fec', NEW.bim_fec,
            'bim_ndo', NEW.bim_ndo,
            'bim_val', NEW.bim_val,
            'bim_moneda', NEW.bim_moneda,
            'bim_color', NEW.bim_color,
            'bim_ser', NEW.bim_ser,
            'bim_cod', NEW.bim_cod,
            'bim_obs', NEW.bim_obs,
            'bim_sede', NEW.bim_sede,
            'est_ide', NEW.est_ide,
            'foa_ide', NEW.foa_ide,
            'con_ide', NEW.con_ide,
            'esu_ide', NEW.esu_ide,
            'mod_ide', NEW.mod_ide,
            'cae_ide', NEW.cae_ide,
            'bim_inc', NEW.bim_inc,
            'bim_fed', NEW.bim_fed,
            'com_ide', NEW.com_ide, 
            'dep_ide', NEW.dep_ide 
        )
    );
END$$

-- 2. Trigger para UPDATE: 'despues_actualizar_bienes'
-- Se ejecuta DESPUÉS de actualizar un bien en tmab_m
CREATE TRIGGER `despues_actualizar_bienes`
AFTER UPDATE ON `tmab_m`
FOR EACH ROW
BEGIN
    INSERT INTO `bitb_m` (
        `usuario_id`,
        `fecha_hora`,
        `registro_id_afectado`,
        `tipo_cambio`,
        `datos_antiguos`,
        `datos_nuevos`
    )
    VALUES (
        @user_id_for_audit,             -- El ID de usuario
        NOW(),                          -- La fecha y hora actual
        NEW.bim_ide,                    -- El ID del bien actualizado (puede ser OLD.bim_ide también)
        'ACTUALIZO',                       -- Tipo de cambio
        JSON_OBJECT(                    -- Todos los datos del registro ANTES de la actualización en JSON
            'bim_ide', OLD.bim_ide,
            'bim_des', OLD.bim_des,
            'bim_fec', OLD.bim_fec,
            'bim_ndo', OLD.bim_ndo,
            'bim_val', OLD.bim_val,
            'bim_moneda', OLD.bim_moneda,
            'bim_color', OLD.bim_color,
            'bim_ser', OLD.bim_ser,
            'bim_cod', OLD.bim_cod,
            'bim_obs', OLD.bim_obs,
            'bim_sede', OLD.bim_sede,
            'est_ide', OLD.est_ide,
            'foa_ide', OLD.foa_ide,
            'con_ide', OLD.con_ide,
            'esu_ide', OLD.esu_ide,
            'mod_ide', OLD.mod_ide,
            'cae_ide', OLD.cae_ide,
            'bim_inc', OLD.bim_inc,
            'bim_fed', OLD.bim_fed,
            'com_ide', OLD.com_ide,
            'dep_ide', OLD.dep_ide
        ),
        JSON_OBJECT(                    -- Todos los datos del registro DESPUÉS de la actualización en JSON
            'bim_ide', NEW.bim_ide,
            'bim_des', NEW.bim_des,
            'bim_fec', NEW.bim_fec,
            'bim_ndo', NEW.bim_ndo,
            'bim_val', NEW.bim_val,
            'bim_moneda', NEW.bim_moneda,
            'bim_color', NEW.bim_color,
            'bim_ser', NEW.bim_ser,
            'bim_cod', NEW.bim_cod,
            'bim_obs', NEW.bim_obs,
            'bim_sede', NEW.bim_sede,
            'est_ide', NEW.est_ide,
            'foa_ide', NEW.foa_ide,
            'con_ide', NEW.con_ide,
            'esu_ide', NEW.esu_ide,
            'mod_ide', NEW.mod_ide,
            'cae_ide', NEW.cae_ide,
            'bim_inc', NEW.bim_inc,
            'bim_fed', NEW.bim_fed,
            'com_ide', NEW.com_ide,
            'dep_ide', NEW.dep_ide
        )
    );
END$$

-- 3. Trigger para DELETE: 'despues_borrar_bienes'
-- Se ejecuta ANTES de eliminar un bien en tmab_m para poder capturar los datos de OLD
CREATE TRIGGER `despues_borrar_bienes`
BEFORE DELETE ON `tmab_m`
FOR EACH ROW
BEGIN
    INSERT INTO `bitb_m` (
        `usuario_id`,
        `fecha_hora`,
        `registro_id_afectado`,
        `tipo_cambio`,
        `datos_antiguos`,
        `datos_nuevos`
    )
    VALUES (
        @user_id_for_audit,             -- El ID de usuario
        NOW(),                          -- La fecha y hora actual
        OLD.bim_ide,                    -- El ID del bien a borrar
        'ELIMINO',                       -- Tipo de cambio
        JSON_OBJECT(                    -- Todos los datos del registro ANTES de ser eliminado en JSON
            'bim_ide', OLD.bim_ide,
            'bim_des', OLD.bim_des,
            'bim_fec', OLD.bim_fec,
            'bim_ndo', OLD.bim_ndo,
            'bim_val', OLD.bim_val,
            'bim_moneda', OLD.bim_moneda,
            'bim_color', OLD.bim_color,
            'bim_ser', OLD.bim_ser,
            'bim_cod', OLD.bim_cod,
            'bim_obs', OLD.bim_obs,
            'bim_sede', OLD.bim_sede,
            'est_ide', OLD.est_ide,
            'foa_ide', OLD.foa_ide,
            'con_ide', OLD.con_ide,
            'esu_ide', OLD.esu_ide,
            'mod_ide', OLD.mod_ide,
            'cae_ide', OLD.cae_ide,
            'bim_inc', OLD.bim_inc,
            'bim_fed', OLD.bim_fed,
            'com_ide', OLD.com_ide,
            'dep_ide', OLD.dep_ide
        ),
        NULL                            -- No hay datos nuevos para una eliminación
    );
END$$

-- Volver a establecer el delimitador por defecto
DELIMITER ;

/* FIN DE DISPARADORES DE LA BASE DE DATOS */

/*VISTAS */

CREATE VIEW vw_bienes_muebles AS
SELECT 
    b.bim_ide,
    b.bim_des,
    b.bim_fec,
    b.bim_ndo,
    b.bim_val,
    b.bim_moneda,
    b.bim_color,
    b.bim_ser,
    b.bim_cod,
    b.bim_sede,
    f.foa_nom AS forma_adquisicion,
    c.con_con AS condicion,
    eu.esu_esu AS estado_uso,      
    mar.mar_mar AS marca,      
    m.mod_mod AS modelo,  
    cat.cat_cat AS categoria_general,
    sc.sca_sca AS subcategoria,
    ca.cae_cae AS categoria_especifica,
    d.dep_nom AS departamento
FROM tmab_m b
LEFT JOIN tmafoa f ON b.foa_ide = f.foa_ide
LEFT JOIN tmacon c ON b.con_ide = c.con_ide
LEFT JOIN tmaesu eu ON b.esu_ide = eu.esu_ide
LEFT JOIN tesmod m ON b.mod_ide = m.mod_ide      
LEFT JOIN tmamar mar ON m.mar_ide = mar.mar_ide 
LEFT JOIN tescae ca ON b.cae_ide = ca.cae_ide
LEFT JOIN tessca sc ON sc.sca_ide = ca.sca_ide
LEFT JOIN tmacat cat ON cat.cat_ide = sc.cat_ide
LEFT JOIN tesdep d ON b.dep_ide = d.dep_ide
WHERE b.bim_inc = 1 AND b.est_ide != 3;
  
CREATE VIEW vw_bienes_muebles_bm1 AS
SELECT 
    b.bim_ide,
    b.bim_des,
    b.bim_val,
    cat.cat_ide AS categoria_general,
    sc.sca_ide AS subcategoria,
    ca.cae_ide AS categoria_especifica
FROM tmab_m b 
LEFT JOIN tescae ca ON b.cae_ide = ca.cae_ide
LEFT JOIN tessca sc ON sc.sca_ide = ca.sca_ide
LEFT JOIN tmacat cat ON cat.cat_ide = sc.cat_ide
WHERE b.bim_inc = 1;

CREATE VIEW vw_bienes_muebles_bm3 AS SELECT b.bim_ide, b.bim_des, b.bim_val, cat.cat_ide AS categoria_general, sc.sca_ide AS subcategoria, ca.cae_ide AS categoria_especifica FROM tmab_m b LEFT JOIN tescae ca ON b.cae_ide = ca.cae_ide LEFT JOIN tessca sc ON sc.sca_ide = ca.sca_ide LEFT JOIN tmacat cat ON cat.cat_ide = sc.cat_ide WHERE b.bim_inc = 1 AND b.est_ide=3