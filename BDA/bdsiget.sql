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
  `cae_ide` varchar(10) NOT NULL COMMENT 'Identificador de categoría especifica',
  `cae_cae` varchar(100) NOT NULL COMMENT 'descripcion de categoría especifica',
  `sca_ide` varchar(10) NOT NULL COMMENT 'Referencia a subcategoría en tessca'
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
  `sca_ide` varchar(10) NOT NULL COMMENT 'Identificador de sub-categoria',
  `sca_sca` varchar(100) NOT NULL COMMENT 'descripcion de sub-categoria',
  `cat_ide` varchar(10) NOT NULL COMMENT 'Referencia a categoría en tmacat'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tesusu`
--

CREATE TABLE `tesusu` (
  `usu_ide` varchar(10) NOT NULL COMMENT 'Identificador unico del usuario',
  `usu_con` varchar(255) NOT NULL COMMENT 'Contraseña del usuario (hashed)',
  `usu_tip` int(1) NOT NULL COMMENT 'Perfil o tipo de usuario',
  `nom_ced` varchar(10) DEFAULT NULL COMMENT 'Referencia a empleado en tmanom'
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
  `bim_cod` varchar(20) NOT NULL COMMENT 'Codigo de SUDEBIN del bien mueble',
  `bim_obs` text COMMENT 'Observacion del bien',
  `bim_sede` varchar(20) NOT NULL COMMENT 'Sede en la que se encuentra el bien (PRINCIPAL)',
  `est_ide` int(11) NOT NULL COMMENT 'Referencia a estado en tmaest',
  `tip_ide` varchar(10) NOT NULL COMMENT 'Referencia a tipo en tmatip',
  `foa_ide` int(11) NOT NULL COMMENT 'Referencia a forma adquisición en tmafoa',
  `con_ide` int(11) NOT NULL COMMENT 'Referencia a condición en tmacon',
  `esu_ide` int(11) NOT NULL COMMENT 'Referencia a estado uso en tmaesu',
  `mod_ide` varchar(10) DEFAULT NULL COMMENT 'Referencia a modelo en tesmod',
  `cae_ide` varchar(10) DEFAULT NULL COMMENT 'Referencia a categoría específica en tescae'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tmacat`
--

CREATE TABLE `tmacat` (
  `cat_ide` varchar(10) NOT NULL COMMENT 'Identificador de categoria',
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
-- Estructura de tabla para la tabla `tmatip`
--

CREATE TABLE `tmatip` (
  `tip_ide` varchar(10) NOT NULL COMMENT 'Identificador de tipo debien',
  `tip_tip` varchar(50) NOT NULL COMMENT 'descripcion del tipo de bien'
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
  ADD KEY `fk_tmabm_tmatip` (`tip_ide`),
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
-- Indices de la tabla `tmatip`
--
ALTER TABLE `tmatip`
  ADD PRIMARY KEY (`tip_ide`);

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
  ADD CONSTRAINT `fk_tescae_tessca` FOREIGN KEY (`sca_ide`) REFERENCES `tessca` (`sca_ide`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `tesmod`
--
ALTER TABLE `tesmod`
  ADD CONSTRAINT `fk_tesmod_tmamar` FOREIGN KEY (`mar_ide`) REFERENCES `tmamar` (`mar_ide`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `tessca`
--
ALTER TABLE `tessca`
  ADD CONSTRAINT `fk_tessca_tmacat` FOREIGN KEY (`cat_ide`) REFERENCES `tmacat` (`cat_ide`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `tesusu`
--
ALTER TABLE `tesusu`
  ADD CONSTRAINT `fk_tesusu_tmanom` FOREIGN KEY (`nom_ced`) REFERENCES `tmanom` (`nom_ced`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Modificación para AI para la tabla `tesusu`
--
ALTER TABLE `tesusu`
MODIFY `usu_ide` INT NOT NULL AUTO_INCREMENT COMMENT 'Identificador unico del usuario';

--
-- Filtros para la tabla `tesant`
--
ALTER TABLE `tesant`
  ADD CONSTRAINT `fk_tesant_tmanom` FOREIGN KEY (`nom_ced`) REFERENCES `tmanom` (`nom_ced`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `tmab_m`
--
ALTER TABLE `tmab_m`
  ADD CONSTRAINT `fk_tmabm_tescae` FOREIGN KEY (`cae_ide`) REFERENCES `tescae` (`cae_ide`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tmabm_tesmod` FOREIGN KEY (`mod_ide`) REFERENCES `tesmod` (`mod_ide`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tmabm_tmacon` FOREIGN KEY (`con_ide`) REFERENCES `tmacon` (`con_ide`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tmabm_tmaest` FOREIGN KEY (`est_ide`) REFERENCES `tmaest` (`est_ide`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tmabm_tmaesu` FOREIGN KEY (`esu_ide`) REFERENCES `tmaesu` (`esu_ide`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tmabm_tmafoa` FOREIGN KEY (`foa_ide`) REFERENCES `tmafoa` (`foa_ide`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tmabm_tmatip` FOREIGN KEY (`tip_ide`) REFERENCES `tmatip` (`tip_ide`) ON DELETE CASCADE ON UPDATE CASCADE;

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
  `com_com` varchar(50) NOT NULL COMMENT 'Descripción de concepto de movimiento'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE `tmacom`
  ADD PRIMARY KEY (`com_ide`);

ALTER TABLE `tmab_m` ADD COLUMN `com_ide` int(11) COMMENT 'Referencia a concepto de movimiento en tmacom', ADD CONSTRAINT `fk_tmabm_tmacom` FOREIGN KEY (`com_ide`) REFERENCES `tmacom` (`com_ide`) ON DELETE CASCADE ON UPDATE CASCADE;
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
  FOREIGN KEY (`nom_ced`) REFERENCES `tmanom`(`nom_ced`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE tmacue ( `cue_id` int NOT NULL COMMENT 'Identificador de relacion de cuenta de BM del mes anterior', `cue_cue` float(10.2) NOT NULL COMMENT 'Monto de relacion de cuenta de BM del mes anterior' );

CREATE TABLE ttrpre ( 
  `pre_ide` INT NOT NULL AUTO_INCREMENT COMMENT "identificador unico de prestamo", 
  `bim_ide` VARCHAR(10) NOT NULL COMMENT "identificador unico del bien", 
  `dep_ide` INT NOT NULL COMMENT "identificador unico del departamento", 
  `pre_des` TEXT COMMENT "Observacion del prestamo", 
  `pre_est` TINYINT(1) COMMENT "Estado del prestamo (1 para prestado 0 para no prestado)", 
  PRIMARY KEY (`pre_ide`), FOREIGN KEY (`bim_ide`) REFERENCES `tmab_m`(`bim_ide`), 
  FOREIGN KEY (`dep_ide`) REFERENCES `tesdep`(`dep_ide`), 
  UNIQUE KEY `relacion_unica` (`bim_ide`, `dep_ide`) 
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE `tmab_m` 
ADD COLUMN `dep_ide` INT NULL COMMENT 'Departamento al que pertenece el bien',
ADD CONSTRAINT `fk_bien_departamento` 
    FOREIGN KEY (`dep_ide`) REFERENCES `tesdep`(`dep_ide`)
    ON DELETE SET NULL
    ON UPDATE CASCADE;
    
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
  ('R.P.E Empleado', 5),
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

-- TABLA TMANOM (Contralor DATA REAL SIN USUARIO)

INSERT INTO `tmanom` (`nom_ced`, `nom_nom`, `nom_ape`, `nom_fec`, `nom_gen`, `nom_nhi`, `nom_pro`, `cet_ide`, `ona_ide`, `nvl_ran`, `dep_ide`) VALUES 
('18845038', 'LUIS ALEJANDRO', 'AGUILAR MONTILVA', '2023-02-01', 'M', '1', '2', '34', '16', 'I', '1');

-- FUTUROS VOLCADOS EN LA BASE DE DATOS

INSERT INTO `tmacat` (`cat_ide`, `cat_cat`) VALUES 
(1, 'Maquinaria y demás equipos de contrucción campo industria y taller'),
(2, 'Equipos de comunicaciones y de señalamiento'),
(3, 'Equipos medicos quirúrgicos dentales y veterinarios'),
(4, 'Equipos científicos religiosos de enseñanza y recreación'),
(5, 'Equipos de defensa y seguridad del Estado'),
(6, 'Máquinas muebles y demás equipos de oficina y de alojamiento');

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

INSERT INTO `tmaesu` (`esu_ide`, `esu_esu`) VALUES
(1, 'EN USO'),
(2, 'EN COMODATO'),
(3, 'EN ARRENDAMIENTO'),
(4, 'EN ALMACÉN O DEPÓSITO PARA SU ASIGNACIÓN'),
(5, 'ASIGNACIÓN O ADSCRIPCIÓN'),
(6, 'CONCESIÓN'),
(7, 'PERMISO'),
(8, 'AUTORIZACIÓN');

INSERT INTO `tmacon` (`con_ide`, `con_con`) VALUES
(1, 'ÓPTIMO'),
(2, 'BUENO'),
(3, 'REGULAR'),
(4, 'DETERIORADO'),
(5, 'AVERIADO'),
(6, 'CHATARRA'),
(7, 'NO OPERATIVO'),
(8, 'OTRA CONDICIÓN FÍSICA');

INSERT INTO `tmatip` (`tip_ide`, `tip_tip`) VALUES
(1, 'CPU'),
(2, 'SWITCH'),
(3, 'MONITOR'),
(4, 'IMPRESORA'),
(5, 'CALCULADORA'),
(6, 'TELEFONO'),
(7, 'SACAPUNTA ELECTRICO'),
(8, 'SILLA'),
(9, 'AIRE ACONDICIONADO'),
(10, 'MESA'),
(11, 'ESTANTE'),
(12, 'CARTELERA'),
(13, 'UPS'),
(14, 'ENFRIADOR DE AGUA'),
(15, 'PANEL DE DIVISION'),
(16, 'PUESTO DE TRABAJO'),
(17, 'ESTACION'),
(18, 'REGULADOR'),
(19, 'ARCHIVADOR'),
(20, 'VENTILADOR'),
(21, 'LAPTOP'),
(22, 'CAMARA'),
(23, 'PATCH PANEL'),
(24, 'GABINETE PARA SWITCH DE RED'),
(25, 'PROTECTOR'),
(26, 'PIZARRA'),
(27, 'APARATO TELEFONICO'),
(28, 'ENGRAPADORA'),
(29, 'SACAPUNTA');

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


