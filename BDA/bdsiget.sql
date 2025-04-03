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
  `ant_ano` int(11) NOT NULL COMMENT 'Años de antigüedad',
  `ant_por` decimal(5,2) NOT NULL COMMENT 'Porcentaje de antigüedad'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tescae`
--

CREATE TABLE `tescae` (
  `cae_ide` varchar(10) NOT NULL COMMENT 'Identificador de categoría especifica',
  `cae_cae` varchar(50) NOT NULL COMMENT 'descripcion de categoría especifica'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tescet`
--

CREATE TABLE `tescet` (
  `cet_ide` int(11) NOT NULL COMMENT 'Identificador único de cargo CET',
  `cet_car` varchar(50) NOT NULL COMMENT 'Nombre del cargo CET',
  `cet_des` text DEFAULT NULL COMMENT 'Descripción del cargo CET',
  `cet_salario` decimal(10,2) NOT NULL COMMENT 'Salario del cargo CET'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tesded`
--

CREATE TABLE `tesded` (
  `ded_ide` int(11) NOT NULL COMMENT 'Identificador único de deducción',
  `ded_raz` varchar(100) NOT NULL COMMENT 'Razón de la deducción',
  `ded_por` decimal(5,2) NOT NULL COMMENT 'Porcentaje de la deducción'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tesdep`
--

CREATE TABLE `tesdep` (
  `dep_ide` int(11) NOT NULL COMMENT 'Identificador único de departamento',
  `dep_nom` varchar(50) NOT NULL COMMENT 'Nombre del departamento',
  `dep_des` text DEFAULT NULL COMMENT 'Descripción del departamento'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tesmod`
--

CREATE TABLE `tesmod` (
  `mod_ide` varchar(10) NOT NULL COMMENT 'Identificador de modelo',
  `mod_mod` varchar(50) NOT NULL COMMENT 'descripcion de modelo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tesona`
--

CREATE TABLE `tesona` (
  `ona_ide` int(11) NOT NULL COMMENT 'Identificador único de cargo ONAPRE',
  `ona_car` varchar(50) NOT NULL COMMENT 'Nombre del cargo ONAPRE',
  `ona_des` text DEFAULT NULL COMMENT 'Descripción del cargo ONAPRE'
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
  `sca_sca` varchar(50) NOT NULL COMMENT 'descripcion de sub-categoria'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tesusu`
--

CREATE TABLE `tesusu` (
  `usu_ide` varchar(11) NOT NULL COMMENT 'Identificador unico del usuario',
  `usu_con` int(11) NOT NULL COMMENT 'contraseña del usuario',
  `usu_tip` decimal(5,2) NOT NULL COMMENT 'Perfil o tipo de usuario'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tmab_m`
--

CREATE TABLE `tmab_m` (
  `bim_ide` varchar(10) NOT NULL COMMENT 'Codigo interno del bien',
  `bim_des` text NOT NULL COMMENT 'Descripcion del bien',
  `bim_fec` date NOT NULL COMMENT 'Fecha de adquisicion del bien',
  `bim_ndo` date NOT NULL COMMENT 'Numero de documento (factura) del bien',
  `bim_val` decimal(10,0) NOT NULL COMMENT 'Valor monetario de adquisicion del bien ',
  `bim_moneda` varchar(10) NOT NULL COMMENT 'Moneda en la que esta el valor del bien (Bolivares)',
  `bim_color` varchar(30) NOT NULL COMMENT 'Color del bien',
  `bim_cod` varchar(20) NOT NULL COMMENT 'Codigo de SUDEBIN del bien mueble',
  `bim_obs` text NOT NULL COMMENT 'Observacion del bien',
  `bim_sede` varchar(20) NOT NULL COMMENT 'Sede en la que se encuentra el bien (PRINCIPAL)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tmacat`
--

CREATE TABLE `tmacat` (
  `cat_ide` varchar(10) NOT NULL COMMENT 'Identificador de categoria',
  `cat_cat` varchar(50) NOT NULL COMMENT 'descripcion del categoria'
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
  `nom_nhi` int(11) NOT NULL COMMENT 'Número de hijos'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

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
  ADD PRIMARY KEY (`cae_ide`);

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
  ADD PRIMARY KEY (`mod_ide`);

--
-- Indices de la tabla `tesona`
--
ALTER TABLE `tesona`
  ADD PRIMARY KEY (`ona_ide`);

--
-- Indices de la tabla `tespri`
--
ALTER TABLE `tespri`
  ADD PRIMARY KEY (`pri_ide`);

--
-- Indices de la tabla `tessca`
--
ALTER TABLE `tessca`
  ADD PRIMARY KEY (`sca_ide`);

--
-- Indices de la tabla `tesusu`
--
ALTER TABLE `tesusu`
  ADD PRIMARY KEY (`usu_ide`);

--
-- Indices de la tabla `tmab_m`
--
ALTER TABLE `tmab_m`
  ADD PRIMARY KEY (`bim_ide`);

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
  ADD PRIMARY KEY (`nom_ced`);

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
  MODIFY `ant_ide` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único de antigüedad';

--
-- AUTO_INCREMENT de la tabla `tescet`
--
ALTER TABLE `tescet`
  MODIFY `cet_ide` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único de cargo CET';

--
-- AUTO_INCREMENT de la tabla `tesded`
--
ALTER TABLE `tesded`
  MODIFY `ded_ide` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único de deducción';

--
-- AUTO_INCREMENT de la tabla `tesdep`
--
ALTER TABLE `tesdep`
  MODIFY `dep_ide` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único de departamento';

--
-- AUTO_INCREMENT de la tabla `tesona`
--
ALTER TABLE `tesona`
  MODIFY `ona_ide` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único de cargo ONAPRE';

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
COMMIT;