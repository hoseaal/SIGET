-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 07-04-2026 a las 15:36:22
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `dbsigetrrhh-1`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cargos_cet`
--

CREATE TABLE `cargos_cet` (
  `cargo_cet_id` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cargos_cet`
--

INSERT INTO `cargos_cet` (`cargo_cet_id`, `nombre`) VALUES
(1, 'Auditor Interno'),
(2, 'Analista de Sistemas'),
(3, 'ASEADORA I'),
(4, 'ASEADORA II'),
(5, 'ASEADORA III'),
(6, 'ASEADORA IV'),
(7, 'ASEADORA V'),
(8, 'ASEADORA VI'),
(9, 'MENSAJERO I'),
(10, 'MENSAJERO II'),
(11, 'MENSAJERO III'),
(12, 'MENSAJERO IV'),
(13, 'MENSAJERO V'),
(14, 'MENSAJERO VI');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cargos_onapre`
--

CREATE TABLE `cargos_onapre` (
  `cargo_onapre_id` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cargos_onapre`
--

INSERT INTO `cargos_onapre` (`cargo_onapre_id`, `nombre`) VALUES
(1, 'Profesional III'),
(2, 'Técnico II'),
(3, 'Obrero I-MAX'),
(4, 'Obrero II-MIN'),
(5, 'Obrero III-MIN');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `condiciones_laborales`
--

CREATE TABLE `condiciones_laborales` (
  `condicion_laboral_id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `condiciones_laborales`
--

INSERT INTO `condiciones_laborales` (`condicion_laboral_id`, `nombre`) VALUES
(1, 'Fijo'),
(2, 'Contratado');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `configuracion_antiguedad`
--

CREATE TABLE `configuracion_antiguedad` (
  `antiguedad_id` int(11) NOT NULL,
  `anios_cumplidos` int(3) NOT NULL,
  `porcentaje_actual` decimal(5,2) NOT NULL,
  `porcentaje_anterior` decimal(5,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `configuracion_antiguedad`
--

INSERT INTO `configuracion_antiguedad` (`antiguedad_id`, `anios_cumplidos`, `porcentaje_actual`, `porcentaje_anterior`) VALUES
(1, 1, 2.00, NULL),
(2, 5, 10.00, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `datos_laborales`
--

CREATE TABLE `datos_laborales` (
  `empleado_id` int(11) NOT NULL,
  `cargo_cet_id` int(11) NOT NULL,
  `cargo_onapre_id` int(11) NOT NULL,
  `nivel_salarial_id` int(11) NOT NULL,
  `nivel_salarial_antiguo_id` int(11) DEFAULT NULL,
  `condicion_laboral_id` int(11) NOT NULL,
  `prima_profesional_id` int(11) DEFAULT NULL,
  `direccion_id` int(11) DEFAULT NULL,
  `division_id` int(11) DEFAULT NULL,
  `unidad_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `datos_laborales`
--

INSERT INTO `datos_laborales` (`empleado_id`, `cargo_cet_id`, `cargo_onapre_id`, `nivel_salarial_id`, `nivel_salarial_antiguo_id`, `condicion_laboral_id`, `prima_profesional_id`, `direccion_id`, `division_id`, `unidad_id`) VALUES
(5, 1, 1, 1, NULL, 1, NULL, 1, NULL, NULL),
(7, 1, 2, 1, NULL, 1, NULL, 2, 2, 2),
(11, 2, 1, 1, NULL, 2, NULL, 1, 1, 1),
(12, 2, 1, 1, NULL, 1, NULL, 1, 1, 1),
(15, 11, 3, 2, NULL, 1, NULL, 2, NULL, NULL),
(16, 2, 1, 1, NULL, 1, NULL, 1, 1, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `deducciones`
--

CREATE TABLE `deducciones` (
  `deduccion_id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `porcentaje` decimal(5,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `direcciones`
--

CREATE TABLE `direcciones` (
  `direccion_id` int(11) NOT NULL COMMENT 'Identificador único de la Dirección',
  `nombre` varchar(150) NOT NULL COMMENT 'Nombre completo de la Dirección'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `direcciones`
--

INSERT INTO `direcciones` (`direccion_id`, `nombre`) VALUES
(1, 'Dirección de Informática'),
(2, 'Dirección de Recursos Humanos');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `divisiones`
--

CREATE TABLE `divisiones` (
  `division_id` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `direccion_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `divisiones`
--

INSERT INTO `divisiones` (`division_id`, `nombre`, `direccion_id`) VALUES
(1, 'División de Desarrollo', 1),
(2, 'División de Reclutamiento', 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empleados`
--

CREATE TABLE `empleados` (
  `empleado_id` int(11) NOT NULL,
  `cedula` varchar(15) NOT NULL,
  `nombres` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `rif` varchar(20) DEFAULT NULL,
  `fecha_nacimiento` date NOT NULL,
  `lugar_nacimiento` varchar(100) NOT NULL,
  `genero` enum('M','F','O') NOT NULL,
  `estado_civil` varchar(50) NOT NULL,
  `tipo_sangre` varchar(5) DEFAULT NULL,
  `deportes` text DEFAULT NULL,
  `actividades_culturales` text DEFAULT NULL,
  `direccion_habitacion` varchar(255) NOT NULL,
  `telefono_fijo` varchar(20) DEFAULT NULL,
  `celular` varchar(20) NOT NULL,
  `correo_principal` varchar(150) NOT NULL,
  `correo_secundario` varchar(150) DEFAULT NULL,
  `fecha_ingreso` date NOT NULL,
  `estudios_actuales` varchar(255) DEFAULT NULL,
  `fecha_culminacion_estudios` date DEFAULT NULL,
  `contacto_emergencia_1` varchar(150) NOT NULL,
  `telefono_emergencia_1` varchar(20) NOT NULL,
  `contacto_emergencia_2` varchar(150) DEFAULT NULL,
  `telefono_emergencia_2` varchar(20) DEFAULT NULL,
  `profesion_id` int(11) DEFAULT NULL,
  `estatus_id` int(11) NOT NULL,
  `nro_cuenta_bancaria` varchar(20) NOT NULL,
  `cuenta_bancaria` varchar(25) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `empleados`
--

INSERT INTO `empleados` (`empleado_id`, `cedula`, `nombres`, `apellidos`, `rif`, `fecha_nacimiento`, `lugar_nacimiento`, `genero`, `estado_civil`, `tipo_sangre`, `deportes`, `actividades_culturales`, `direccion_habitacion`, `telefono_fijo`, `celular`, `correo_principal`, `correo_secundario`, `fecha_ingreso`, `estudios_actuales`, `fecha_culminacion_estudios`, `contacto_emergencia_1`, `telefono_emergencia_1`, `contacto_emergencia_2`, `telefono_emergencia_2`, `profesion_id`, `estatus_id`, `nro_cuenta_bancaria`, `cuenta_bancaria`) VALUES
(5, '9247771', 'Luis', 'Bolaños', 'V12345678', '2000-11-30', 'nlknlknlk', 'M', 'Casado', 'A', 'j bj', 'bauolsa', 'jbljbj', '0412345986', '098765', 'SONIARGUELLO10Y@GMAIL.COM', 'SONIARGUELLO10Y@GMAIL.COM', '2026-04-02', NULL, NULL, 'nlnkblk', '0000000', 'nlkpij[ol', '00000000', 1, 1, '', '0102111122223333'),
(7, '10146978', 'Ana Maria', 'Perez Roa', 'V2345678', '2003-09-09', 'ursdddddddbcoisdvoivbdsi', 'F', 'Soltero', 'A', 'j bj', 'bauolsa', 'Municipio Libertador, Calle 2, Casa n3', '04161373897', '090809809', 'lewis@gmail.com', 'lewis@gmail.com', '2026-04-02', NULL, NULL, 'nlnkblk', '0412345986', 'Luis Bolaños', '0412345986', 2, 1, '', NULL),
(11, '92477713', 'Luisa', 'Bolaños', 'V123456783', '2009-10-10', 'dfgtryuj', 'F', 'Viudo', 'A', 'j bj', 'bauolsa', 'Municipio Libertador, Calle 2, Casa n3', '0412345986', '098765', 'SONIARGUELLO11Y@GMAIL.COM', 'SONIARGUELLO10Y@GMAIL.COM', '2026-04-02', NULL, NULL, 'Luis Bolaños', '0412345986', 'nlkpij[ol', '0412345982', 1, 1, '', NULL),
(12, '29908320', 'Angela Marina', 'Villamizar Arguello', 'V29908320-1', '2003-02-08', 'Hospital Central', 'F', 'Soltero', 'A+', '', '', 'Municipio Libertador, Calle 2, Casa n3', '04161373897', '04247741424', 'angelavillamizar900@gmail.com', 'angelavillamizar900@gmail.com', '2026-04-02', NULL, NULL, 'sonia', '04149795188', 'mili', '0412345986', 1, 1, '', NULL),
(15, '31456098', 'Lenis', 'Perez Roa', 'V31456098', '2003-01-09', 'Los Roques', 'M', 'Casado', 'A+', 'j bj', 'bauiop\';olikugyfc bn', 'Municipio Libertador, Calle 2, Casa n3', '04161373897', '0987652`31', 'lewis@gmail.com', 'SONIARGUELLO10Y@GMAIL.COM', '2026-04-04', NULL, NULL, 'nlnkblk', '0412345986', 'Luis Bolaños', '00000000', NULL, 1, '01020319101792801', '12345678901234567890'),
(16, '30890123', 'Eric Alberto', 'Martinez Omaña', 'V30890123-1', '1969-02-04', 'Por ahi', 'F', 'Divorciado', 'A+', NULL, NULL, 'Municipio Libertador, Calle 2, Casa n3', '04161373897', '0412345986', 'SONIARGUELLO10Y@GMAIL.COM', 'SONIARGUELLO10Y@GMAIL.COM', '2003-12-09', NULL, NULL, 'Luis Bolaños', '0412345986', 'Luis Bolaños', '00000000', 1, 3, '', '12345678901234567890');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `encargos_temporales`
--

CREATE TABLE `encargos_temporales` (
  `encargo_id` int(11) NOT NULL,
  `empleado_id` int(11) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `estatus_encargo` tinyint(1) NOT NULL,
  `cargo_cet_id` int(11) NOT NULL,
  `cargo_onapre_id` int(11) NOT NULL,
  `nivel_salarial_id` int(11) NOT NULL,
  `nivel_salarial_antiguo_id` int(11) DEFAULT NULL,
  `direccion_id` int(11) NOT NULL,
  `division_id` int(11) NOT NULL,
  `unidad_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estatus_funcionarios`
--

CREATE TABLE `estatus_funcionarios` (
  `estatus_id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `estatus_funcionarios`
--

INSERT INTO `estatus_funcionarios` (`estatus_id`, `nombre`) VALUES
(1, 'Activo'),
(2, 'Permiso Remunerado'),
(3, 'Jubilado'),
(4, 'Pensionado'),
(5, 'Jubilado'),
(6, 'Pensionado'),
(7, 'Sobreviviente');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historial_salarios`
--

CREATE TABLE `historial_salarios` (
  `historial_salario_id` int(11) NOT NULL,
  `empleado_id` int(11) NOT NULL,
  `fecha_pago` date NOT NULL,
  `monto_neto` decimal(10,2) NOT NULL,
  `monto_bruto` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `jubilados`
--

CREATE TABLE `jubilados` (
  `jubilado_id` int(11) NOT NULL,
  `empleado_id` int(11) NOT NULL,
  `porcentaje_jubilacion` decimal(5,2) NOT NULL,
  `fecha_efectiva` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `jubilados`
--

INSERT INTO `jubilados` (`jubilado_id`, `empleado_id`, `porcentaje_jubilacion`, `fecha_efectiva`) VALUES
(1, 16, 2.00, '2026-04-06');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `modulos_acceso`
--

CREATE TABLE `modulos_acceso` (
  `modulo_id` int(11) NOT NULL,
  `nombre_modulo` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `modulos_acceso`
--

INSERT INTO `modulos_acceso` (`modulo_id`, `nombre_modulo`) VALUES
(1, 'Acceso Global'),
(2, 'Módulo de Recursos Humanos'),
(3, 'Módulo de Bienes');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `niveles_salariales`
--

CREATE TABLE `niveles_salariales` (
  `nivel_salarial_id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `salario_base` decimal(10,2) NOT NULL,
  `cargo_onapre_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `niveles_salariales`
--

INSERT INTO `niveles_salariales` (`nivel_salarial_id`, `nombre`, `salario_base`, `cargo_onapre_id`) VALUES
(1, 'Nivel P3-1', 1500.00, 1),
(2, 'Nivel T2-1', 950.00, 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `niveles_salariales_antiguos`
--

CREATE TABLE `niveles_salariales_antiguos` (
  `nivel_salarial_antiguo_id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `salario_antiguo` decimal(10,2) NOT NULL,
  `cargo_onapre_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `nucleo_familiar`
--

CREATE TABLE `nucleo_familiar` (
  `familiar_id` int(11) NOT NULL,
  `nombres` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `fecha_nacimiento` date NOT NULL,
  `estatus` tinyint(4) DEFAULT 1,
  `parentesco` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `nucleo_familiar`
--

INSERT INTO `nucleo_familiar` (`familiar_id`, `nombres`, `apellidos`, `fecha_nacimiento`, `estatus`, `parentesco`) VALUES
(1, 'Alberto Jesus', 'Bolaños Bolaños', '2008-02-09', 0, 'hijo'),
(2, 'Jesus Leonardo', 'Rujano', '2016-11-21', 1, 'hijo'),
(3, 'Miguel', 'Bolaños', '2010-02-09', 1, 'hijo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `permisos_remunerados`
--

CREATE TABLE `permisos_remunerados` (
  `permiso_id` int(11) NOT NULL,
  `empleado_id` int(11) NOT NULL,
  `motivo` varchar(255) NOT NULL,
  `requiere_justificativo` tinyint(1) NOT NULL DEFAULT 0,
  `fecha_solicitud` date NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `esta_aprobado` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `primas_generales`
--

CREATE TABLE `primas_generales` (
  `prima_id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `porcentaje` decimal(5,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `primas_profesionalizacion`
--

CREATE TABLE `primas_profesionalizacion` (
  `prima_profesional_id` int(11) NOT NULL,
  `descripcion` varchar(100) NOT NULL,
  `porcentaje_actual` decimal(5,2) NOT NULL,
  `porcentaje_anterior` decimal(5,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `primas_profesionalizacion`
--

INSERT INTO `primas_profesionalizacion` (`prima_profesional_id`, `descripcion`, `porcentaje_actual`, `porcentaje_anterior`) VALUES
(1, 'Especialización', 15.00, NULL),
(2, 'Maestría', 20.00, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `profesiones`
--

CREATE TABLE `profesiones` (
  `profesion_id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `profesiones`
--

INSERT INTO `profesiones` (`profesion_id`, `nombre`) VALUES
(1, 'Ingeniero de Sistemas'),
(2, 'Licenciado en Administración');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `registros_antiguedades`
--

CREATE TABLE `registros_antiguedades` (
  `antiguedad_id` int(11) NOT NULL,
  `empleado_id` int(11) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `registros_antiguedades`
--

INSERT INTO `registros_antiguedades` (`antiguedad_id`, `empleado_id`, `fecha_inicio`, `fecha_fin`) VALUES
(1, 7, '2026-04-01', NULL),
(3, 5, '2026-04-10', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `relacion_cargos`
--

CREATE TABLE `relacion_cargos` (
  `relacion_cargo_id` int(11) NOT NULL,
  `empleado_id` int(11) DEFAULT NULL,
  `cargo_cet_id` int(11) DEFAULT NULL,
  `fecha_inicio_actual` date DEFAULT NULL,
  `fecha_inicio_anterior` date DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `nombre_departamento` varchar(80) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles_sistema`
--

CREATE TABLE `roles_sistema` (
  `rol_id` int(11) NOT NULL,
  `nombre_rol` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `roles_sistema`
--

INSERT INTO `roles_sistema` (`rol_id`, `nombre_rol`) VALUES
(1, 'Visualizador'),
(2, 'Temporal'),
(3, 'Trabajador'),
(4, 'Jefe de Área'),
(5, 'Administrador');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sobreviviente`
--

CREATE TABLE `sobreviviente` (
  `id_sobreviviente` int(11) NOT NULL,
  `empleado_id` int(11) DEFAULT NULL,
  `familiar_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `sobreviviente`
--

INSERT INTO `sobreviviente` (`id_sobreviviente`, `empleado_id`, `familiar_id`) VALUES
(1, NULL, NULL),
(2, 5, 1),
(3, 15, 2),
(4, 5, 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sueldos_pensionados`
--

CREATE TABLE `sueldos_pensionados` (
  `sueldo_pensionado_id` int(11) NOT NULL,
  `salario_base` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `unidades`
--

CREATE TABLE `unidades` (
  `unidad_id` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `division_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `unidades`
--

INSERT INTO `unidades` (`unidad_id`, `nombre`, `division_id`) VALUES
(1, 'Unidad de Backend', 1),
(2, 'Unidad de Nómina', 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `usuario_id` int(11) NOT NULL,
  `username` varchar(20) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `nombres` varchar(50) NOT NULL,
  `apellidos` varchar(50) NOT NULL,
  `rol_id` int(11) NOT NULL,
  `modulo_id` int(11) NOT NULL,
  `cedula_referencia` varchar(15) DEFAULT NULL COMMENT 'Cédula del empleado si aplica'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`usuario_id`, `username`, `password_hash`, `nombres`, `apellidos`, `rol_id`, `modulo_id`, `cedula_referencia`) VALUES
(1, 'amvar', '$2b$12$SnnQFedf42t8Wzcer.c7qORVul2OuZDmN2kVdxjtM17Es1T0EzD8m', 'Angela', 'Villamizar', 5, 1, '29907321');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `cargos_cet`
--
ALTER TABLE `cargos_cet`
  ADD PRIMARY KEY (`cargo_cet_id`);

--
-- Indices de la tabla `cargos_onapre`
--
ALTER TABLE `cargos_onapre`
  ADD PRIMARY KEY (`cargo_onapre_id`);

--
-- Indices de la tabla `condiciones_laborales`
--
ALTER TABLE `condiciones_laborales`
  ADD PRIMARY KEY (`condicion_laboral_id`);

--
-- Indices de la tabla `configuracion_antiguedad`
--
ALTER TABLE `configuracion_antiguedad`
  ADD PRIMARY KEY (`antiguedad_id`),
  ADD UNIQUE KEY `anios_cumplidos` (`anios_cumplidos`);

--
-- Indices de la tabla `datos_laborales`
--
ALTER TABLE `datos_laborales`
  ADD PRIMARY KEY (`empleado_id`),
  ADD KEY `fk_lab_cet` (`cargo_cet_id`),
  ADD KEY `fk_lab_onapre` (`cargo_onapre_id`),
  ADD KEY `fk_lab_nivel` (`nivel_salarial_id`),
  ADD KEY `fk_lab_condicion` (`condicion_laboral_id`),
  ADD KEY `fk_lab_dir` (`direccion_id`),
  ADD KEY `fk_lab_div` (`division_id`),
  ADD KEY `fk_lab_uni` (`unidad_id`),
  ADD KEY `fk_lab_prima` (`prima_profesional_id`);

--
-- Indices de la tabla `deducciones`
--
ALTER TABLE `deducciones`
  ADD PRIMARY KEY (`deduccion_id`);

--
-- Indices de la tabla `direcciones`
--
ALTER TABLE `direcciones`
  ADD PRIMARY KEY (`direccion_id`);

--
-- Indices de la tabla `divisiones`
--
ALTER TABLE `divisiones`
  ADD PRIMARY KEY (`division_id`),
  ADD KEY `fk_division_direccion` (`direccion_id`);

--
-- Indices de la tabla `empleados`
--
ALTER TABLE `empleados`
  ADD PRIMARY KEY (`empleado_id`),
  ADD UNIQUE KEY `cedula` (`cedula`),
  ADD UNIQUE KEY `rif` (`rif`),
  ADD KEY `fk_empleado_profesion` (`profesion_id`),
  ADD KEY `fk_empleado_estatus` (`estatus_id`);

--
-- Indices de la tabla `encargos_temporales`
--
ALTER TABLE `encargos_temporales`
  ADD PRIMARY KEY (`encargo_id`),
  ADD KEY `fk_encargo_empleado` (`empleado_id`),
  ADD KEY `fk_encargo_cet` (`cargo_cet_id`),
  ADD KEY `fk_encargo_onapre` (`cargo_onapre_id`),
  ADD KEY `fk_encargo_nivel` (`nivel_salarial_id`),
  ADD KEY `fk_encargo_nivant` (`nivel_salarial_antiguo_id`),
  ADD KEY `fk_encargo_dir` (`direccion_id`),
  ADD KEY `fk_encargo_div` (`division_id`),
  ADD KEY `fk_encargo_uni` (`unidad_id`);

--
-- Indices de la tabla `estatus_funcionarios`
--
ALTER TABLE `estatus_funcionarios`
  ADD PRIMARY KEY (`estatus_id`);

--
-- Indices de la tabla `historial_salarios`
--
ALTER TABLE `historial_salarios`
  ADD PRIMARY KEY (`historial_salario_id`),
  ADD KEY `fk_hist_empleado` (`empleado_id`);

--
-- Indices de la tabla `jubilados`
--
ALTER TABLE `jubilados`
  ADD PRIMARY KEY (`jubilado_id`),
  ADD UNIQUE KEY `empleado_id` (`empleado_id`);

--
-- Indices de la tabla `modulos_acceso`
--
ALTER TABLE `modulos_acceso`
  ADD PRIMARY KEY (`modulo_id`);

--
-- Indices de la tabla `niveles_salariales`
--
ALTER TABLE `niveles_salariales`
  ADD PRIMARY KEY (`nivel_salarial_id`),
  ADD KEY `fk_nivel_onapre` (`cargo_onapre_id`);

--
-- Indices de la tabla `niveles_salariales_antiguos`
--
ALTER TABLE `niveles_salariales_antiguos`
  ADD PRIMARY KEY (`nivel_salarial_antiguo_id`),
  ADD KEY `fk_nivelant_onapre` (`cargo_onapre_id`);

--
-- Indices de la tabla `nucleo_familiar`
--
ALTER TABLE `nucleo_familiar`
  ADD PRIMARY KEY (`familiar_id`);

--
-- Indices de la tabla `permisos_remunerados`
--
ALTER TABLE `permisos_remunerados`
  ADD PRIMARY KEY (`permiso_id`),
  ADD KEY `fk_permiso_empleado` (`empleado_id`);

--
-- Indices de la tabla `primas_generales`
--
ALTER TABLE `primas_generales`
  ADD PRIMARY KEY (`prima_id`);

--
-- Indices de la tabla `primas_profesionalizacion`
--
ALTER TABLE `primas_profesionalizacion`
  ADD PRIMARY KEY (`prima_profesional_id`);

--
-- Indices de la tabla `profesiones`
--
ALTER TABLE `profesiones`
  ADD PRIMARY KEY (`profesion_id`);

--
-- Indices de la tabla `registros_antiguedades`
--
ALTER TABLE `registros_antiguedades`
  ADD PRIMARY KEY (`antiguedad_id`),
  ADD KEY `fk_antiguedad_empleado` (`empleado_id`);

--
-- Indices de la tabla `relacion_cargos`
--
ALTER TABLE `relacion_cargos`
  ADD PRIMARY KEY (`relacion_cargo_id`),
  ADD KEY `fk_empleado_id` (`empleado_id`),
  ADD KEY `fk_cargo_cet_id` (`cargo_cet_id`);

--
-- Indices de la tabla `roles_sistema`
--
ALTER TABLE `roles_sistema`
  ADD PRIMARY KEY (`rol_id`);

--
-- Indices de la tabla `sobreviviente`
--
ALTER TABLE `sobreviviente`
  ADD PRIMARY KEY (`id_sobreviviente`),
  ADD KEY `empleado_id` (`empleado_id`),
  ADD KEY `familiar_id` (`familiar_id`);

--
-- Indices de la tabla `sueldos_pensionados`
--
ALTER TABLE `sueldos_pensionados`
  ADD PRIMARY KEY (`sueldo_pensionado_id`);

--
-- Indices de la tabla `unidades`
--
ALTER TABLE `unidades`
  ADD PRIMARY KEY (`unidad_id`),
  ADD KEY `fk_unidad_division` (`division_id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`usuario_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `fk_usuario_rol` (`rol_id`),
  ADD KEY `fk_usuario_modulo` (`modulo_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `cargos_cet`
--
ALTER TABLE `cargos_cet`
  MODIFY `cargo_cet_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `cargos_onapre`
--
ALTER TABLE `cargos_onapre`
  MODIFY `cargo_onapre_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `condiciones_laborales`
--
ALTER TABLE `condiciones_laborales`
  MODIFY `condicion_laboral_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `configuracion_antiguedad`
--
ALTER TABLE `configuracion_antiguedad`
  MODIFY `antiguedad_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `deducciones`
--
ALTER TABLE `deducciones`
  MODIFY `deduccion_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `direcciones`
--
ALTER TABLE `direcciones`
  MODIFY `direccion_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único de la Dirección', AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `divisiones`
--
ALTER TABLE `divisiones`
  MODIFY `division_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `empleados`
--
ALTER TABLE `empleados`
  MODIFY `empleado_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `encargos_temporales`
--
ALTER TABLE `encargos_temporales`
  MODIFY `encargo_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `estatus_funcionarios`
--
ALTER TABLE `estatus_funcionarios`
  MODIFY `estatus_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `historial_salarios`
--
ALTER TABLE `historial_salarios`
  MODIFY `historial_salario_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `jubilados`
--
ALTER TABLE `jubilados`
  MODIFY `jubilado_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `modulos_acceso`
--
ALTER TABLE `modulos_acceso`
  MODIFY `modulo_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `niveles_salariales`
--
ALTER TABLE `niveles_salariales`
  MODIFY `nivel_salarial_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `niveles_salariales_antiguos`
--
ALTER TABLE `niveles_salariales_antiguos`
  MODIFY `nivel_salarial_antiguo_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `nucleo_familiar`
--
ALTER TABLE `nucleo_familiar`
  MODIFY `familiar_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `permisos_remunerados`
--
ALTER TABLE `permisos_remunerados`
  MODIFY `permiso_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `primas_generales`
--
ALTER TABLE `primas_generales`
  MODIFY `prima_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `primas_profesionalizacion`
--
ALTER TABLE `primas_profesionalizacion`
  MODIFY `prima_profesional_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `profesiones`
--
ALTER TABLE `profesiones`
  MODIFY `profesion_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `registros_antiguedades`
--
ALTER TABLE `registros_antiguedades`
  MODIFY `antiguedad_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `relacion_cargos`
--
ALTER TABLE `relacion_cargos`
  MODIFY `relacion_cargo_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `roles_sistema`
--
ALTER TABLE `roles_sistema`
  MODIFY `rol_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `sobreviviente`
--
ALTER TABLE `sobreviviente`
  MODIFY `id_sobreviviente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `sueldos_pensionados`
--
ALTER TABLE `sueldos_pensionados`
  MODIFY `sueldo_pensionado_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `unidades`
--
ALTER TABLE `unidades`
  MODIFY `unidad_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `usuario_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `datos_laborales`
--
ALTER TABLE `datos_laborales`
  ADD CONSTRAINT `fk_lab_cet` FOREIGN KEY (`cargo_cet_id`) REFERENCES `cargos_cet` (`cargo_cet_id`),
  ADD CONSTRAINT `fk_lab_condicion` FOREIGN KEY (`condicion_laboral_id`) REFERENCES `condiciones_laborales` (`condicion_laboral_id`),
  ADD CONSTRAINT `fk_lab_dir` FOREIGN KEY (`direccion_id`) REFERENCES `direcciones` (`direccion_id`),
  ADD CONSTRAINT `fk_lab_div` FOREIGN KEY (`division_id`) REFERENCES `divisiones` (`division_id`),
  ADD CONSTRAINT `fk_lab_empleado` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`empleado_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_lab_nivel` FOREIGN KEY (`nivel_salarial_id`) REFERENCES `niveles_salariales` (`nivel_salarial_id`),
  ADD CONSTRAINT `fk_lab_onapre` FOREIGN KEY (`cargo_onapre_id`) REFERENCES `cargos_onapre` (`cargo_onapre_id`),
  ADD CONSTRAINT `fk_lab_prima` FOREIGN KEY (`prima_profesional_id`) REFERENCES `primas_profesionalizacion` (`prima_profesional_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_lab_uni` FOREIGN KEY (`unidad_id`) REFERENCES `unidades` (`unidad_id`);

--
-- Filtros para la tabla `divisiones`
--
ALTER TABLE `divisiones`
  ADD CONSTRAINT `fk_division_direccion` FOREIGN KEY (`direccion_id`) REFERENCES `direcciones` (`direccion_id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `empleados`
--
ALTER TABLE `empleados`
  ADD CONSTRAINT `fk_empleado_estatus` FOREIGN KEY (`estatus_id`) REFERENCES `estatus_funcionarios` (`estatus_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_empleado_profesion` FOREIGN KEY (`profesion_id`) REFERENCES `profesiones` (`profesion_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `encargos_temporales`
--
ALTER TABLE `encargos_temporales`
  ADD CONSTRAINT `fk_encargo_cet` FOREIGN KEY (`cargo_cet_id`) REFERENCES `cargos_cet` (`cargo_cet_id`),
  ADD CONSTRAINT `fk_encargo_dir` FOREIGN KEY (`direccion_id`) REFERENCES `direcciones` (`direccion_id`),
  ADD CONSTRAINT `fk_encargo_div` FOREIGN KEY (`division_id`) REFERENCES `divisiones` (`division_id`),
  ADD CONSTRAINT `fk_encargo_empleado` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`empleado_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_encargo_nivant` FOREIGN KEY (`nivel_salarial_antiguo_id`) REFERENCES `niveles_salariales_antiguos` (`nivel_salarial_antiguo_id`),
  ADD CONSTRAINT `fk_encargo_nivel` FOREIGN KEY (`nivel_salarial_id`) REFERENCES `niveles_salariales` (`nivel_salarial_id`),
  ADD CONSTRAINT `fk_encargo_onapre` FOREIGN KEY (`cargo_onapre_id`) REFERENCES `cargos_onapre` (`cargo_onapre_id`),
  ADD CONSTRAINT `fk_encargo_uni` FOREIGN KEY (`unidad_id`) REFERENCES `unidades` (`unidad_id`);

--
-- Filtros para la tabla `historial_salarios`
--
ALTER TABLE `historial_salarios`
  ADD CONSTRAINT `fk_hist_empleado` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`empleado_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `jubilados`
--
ALTER TABLE `jubilados`
  ADD CONSTRAINT `fk_jubilado_empleado` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`empleado_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `niveles_salariales`
--
ALTER TABLE `niveles_salariales`
  ADD CONSTRAINT `fk_nivel_onapre` FOREIGN KEY (`cargo_onapre_id`) REFERENCES `cargos_onapre` (`cargo_onapre_id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `niveles_salariales_antiguos`
--
ALTER TABLE `niveles_salariales_antiguos`
  ADD CONSTRAINT `fk_nivelant_onapre` FOREIGN KEY (`cargo_onapre_id`) REFERENCES `cargos_onapre` (`cargo_onapre_id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `permisos_remunerados`
--
ALTER TABLE `permisos_remunerados`
  ADD CONSTRAINT `fk_permiso_empleado` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`empleado_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `registros_antiguedades`
--
ALTER TABLE `registros_antiguedades`
  ADD CONSTRAINT `fk_antiguedad_empleado` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`empleado_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `relacion_cargos`
--
ALTER TABLE `relacion_cargos`
  ADD CONSTRAINT `fk_cargo_cet_id` FOREIGN KEY (`cargo_cet_id`) REFERENCES `cargos_cet` (`cargo_cet_id`),
  ADD CONSTRAINT `fk_empleado_id` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`empleado_id`);

--
-- Filtros para la tabla `sobreviviente`
--
ALTER TABLE `sobreviviente`
  ADD CONSTRAINT `sobreviviente_ibfk_1` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`empleado_id`),
  ADD CONSTRAINT `sobreviviente_ibfk_2` FOREIGN KEY (`familiar_id`) REFERENCES `nucleo_familiar` (`familiar_id`);

--
-- Filtros para la tabla `unidades`
--
ALTER TABLE `unidades`
  ADD CONSTRAINT `fk_unidad_division` FOREIGN KEY (`division_id`) REFERENCES `divisiones` (`division_id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `fk_usuario_modulo` FOREIGN KEY (`modulo_id`) REFERENCES `modulos_acceso` (`modulo_id`),
  ADD CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`rol_id`) REFERENCES `roles_sistema` (`rol_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
