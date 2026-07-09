-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 21-06-2026 a las 00:14:20
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

DROP DATABASE IF EXISTS `dbsigetrrhh-1`;
CREATE DATABASE IF NOT EXISTS `dbsigetrrhh-1`;
USE `dbsigetrrhh-1`;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `caja_ahorro`
--

CREATE TABLE `caja_ahorro` (
  `id_caja` int(11) NOT NULL,
  `empleado_id` int(11) NOT NULL,
  `tipo_personal` varchar(30) NOT NULL DEFAULT 'Funcionario' COMMENT 'Funcionario|Obrero Fijo|Jubilado|Pensionado|Sobreviviente',
  `quincena_no` tinyint(1) NOT NULL COMMENT '1 = Primera quincena, 2 = Segunda quincena',
  `mes` tinyint(2) NOT NULL COMMENT '1-12',
  `anio` smallint(6) NOT NULL,
  `monto` decimal(14,2) NOT NULL DEFAULT 0.00 COMMENT 'Aporte Empleado + Aporte Patrono',
  `aporte_empleado` decimal(14,2) NOT NULL DEFAULT 0.00,
  `aporte_patrono` decimal(14,2) NOT NULL DEFAULT 0.00,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `caja_ahorro`
--

INSERT INTO `caja_ahorro` (`id_caja`, `empleado_id`, `tipo_personal`, `quincena_no`, `mes`, `anio`, `monto`, `aporte_empleado`, `aporte_patrono`, `fecha_registro`) VALUES
(43, 49, 'Funcionario', 1, 7, 2026, 40.90, 20.45, 20.45, '2026-06-14 22:20:56'),
(44, 46, 'Funcionario', 1, 7, 2026, 37.60, 18.80, 18.80, '2026-06-14 22:20:56'),
(45, 67, 'Funcionario', 1, 7, 2026, 37.60, 18.80, 18.80, '2026-06-14 22:20:56'),
(46, 45, 'Funcionario', 1, 7, 2026, 24.80, 12.40, 12.40, '2026-06-14 22:20:56'),
(47, 51, 'Funcionario', 1, 7, 2026, 13.00, 6.50, 6.50, '2026-06-14 22:20:56'),
(48, 49, 'Funcionario', 2, 7, 2026, 40.90, 20.45, 20.45, '2026-06-14 22:20:59'),
(49, 46, 'Funcionario', 2, 7, 2026, 37.60, 18.80, 18.80, '2026-06-14 22:20:59'),
(50, 67, 'Funcionario', 2, 7, 2026, 37.60, 18.80, 18.80, '2026-06-14 22:20:59'),
(51, 45, 'Funcionario', 2, 7, 2026, 24.80, 12.40, 12.40, '2026-06-14 22:20:59'),
(52, 51, 'Funcionario', 2, 7, 2026, 13.00, 6.50, 6.50, '2026-06-14 22:20:59'),
(53, 54, 'Obrero Fijo', 1, 7, 2026, 16.10, 8.05, 8.05, '2026-06-14 22:21:21'),
(54, 55, 'Obrero Fijo', 1, 7, 2026, 16.10, 8.05, 8.05, '2026-06-14 22:21:21'),
(55, 66, 'Obrero Fijo', 1, 7, 2026, 16.10, 8.05, 8.05, '2026-06-14 22:21:21'),
(56, 54, 'Obrero Fijo', 2, 7, 2026, 16.10, 8.05, 8.05, '2026-06-14 22:21:25'),
(57, 55, 'Obrero Fijo', 2, 7, 2026, 16.10, 8.05, 8.05, '2026-06-14 22:21:25'),
(58, 66, 'Obrero Fijo', 2, 7, 2026, 16.10, 8.05, 8.05, '2026-06-14 22:21:25'),
(59, 56, 'Jubilado', 1, 7, 2026, 28.20, 14.10, 14.10, '2026-06-14 22:21:30'),
(60, 57, 'Jubilado', 1, 7, 2026, 10.40, 5.20, 5.20, '2026-06-14 22:21:30'),
(61, 56, 'Jubilado', 2, 7, 2026, 28.20, 14.10, 14.10, '2026-06-14 22:21:38'),
(62, 57, 'Jubilado', 2, 7, 2026, 10.40, 5.20, 5.20, '2026-06-14 22:21:38'),
(84, 58, 'Pensionado', 1, 7, 2026, 6.50, 6.50, 6.50, '2026-06-16 14:19:46'),
(85, 59, 'Pensionado', 1, 7, 2026, 6.50, 6.50, 6.50, '2026-06-16 14:19:46'),
(86, 58, 'Pensionado', 2, 7, 2026, 6.50, 6.50, 6.50, '2026-06-16 14:19:52'),
(87, 59, 'Pensionado', 2, 7, 2026, 6.50, 6.50, 6.50, '2026-06-16 14:19:52');

--
-- Disparadores `caja_ahorro`
--
DELIMITER $$
CREATE TRIGGER `before_insert_caja_ahorro` BEFORE INSERT ON `caja_ahorro` FOR EACH ROW BEGIN
  DECLARE msg VARCHAR(255);
  IF NEW.quincena_no NOT IN (1, 2) THEN
    SET msg = CONCAT('Valor inválido para quincena_no: ', NEW.quincena_no, '. Debe ser 1 o 2.');
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
  END IF;
  IF NEW.mes < 1 OR NEW.mes > 12 THEN
    SET msg = CONCAT('Valor inválido para mes: ', NEW.mes, '. Debe estar entre 1 y 12.');
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
  END IF;
  IF NEW.anio < 2000 OR NEW.anio > 2100 THEN
    SET msg = CONCAT('Valor inválido para anio: ', NEW.anio, '. Debe estar entre 2000 y 2100.');
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
  END IF;
  IF NEW.monto < 0 THEN
    SET msg = CONCAT('El monto de caja de ahorro no puede ser negativo: ', NEW.monto);
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
  END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `before_update_caja_ahorro` BEFORE UPDATE ON `caja_ahorro` FOR EACH ROW BEGIN
  DECLARE msg VARCHAR(255);
  IF NEW.empleado_id != OLD.empleado_id OR
     NEW.quincena_no != OLD.quincena_no OR
     NEW.mes != OLD.mes OR
     NEW.anio != OLD.anio THEN
    SET msg = 'No está permitido modificar empleado_id, quincena_no, mes o anio de un registro existente.';
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
  END IF;
  IF NEW.monto < 0 THEN
    SET msg = CONCAT('El monto de caja de ahorro no puede ser negativo: ', NEW.monto);
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
  END IF;
END
$$
DELIMITER ;

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
(40, 'Contralor del Estado'),
(41, 'Director General'),
(42, 'Jefe de Oficina'),
(43, 'Jefe de Division General'),
(44, 'Jefe de División'),
(45, 'Supervisor'),
(47, 'Analista Administrativo'),
(48, 'Analista de Sistema'),
(49, 'Analista Soporte Técnico'),
(50, 'Analista de Organización y Métodos'),
(51, 'Analista de Personal'),
(52, 'Analista de presupuesto'),
(53, 'Analista de Compras'),
(54, 'Analista de Bienes e Inventarios'),
(55, 'Planificador'),
(56, 'Auditor'),
(57, 'Auditor Interno'),
(59, 'Asistente de Auditoria'),
(60, 'Abogado'),
(61, 'Contador'),
(62, 'Trabajador Social'),
(63, 'Médico '),
(64, 'Odontólogo'),
(65, 'Enfermera'),
(67, 'Promotor Social'),
(68, 'Notificador'),
(69, 'Asistente Administrativo'),
(70, 'Asistente Técnico'),
(71, 'Asistente de Presupuesto'),
(72, 'Asistente de Seguridad'),
(73, 'Auxiliar de Oficina'),
(74, 'Auxiliar de Servicios Generales'),
(76, 'Obrero Aseadora'),
(77, 'Obrero Aseador'),
(78, 'Obrero Mensajero'),
(79, 'Obrero'),
(80, 'Director de Línea'),
(81, 'Auxiliar'),
(82, 'Recepcionista'),
(83, 'Secretaria'),
(84, 'Auxiliar de Auditoria'),
(85, 'Vigilante'),
(86, 'Coordinador de ┴rea');

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
(21, 'Contralor del Estado'),
(22, 'Director General'),
(23, 'Director de Linea'),
(24, 'Jefe de División'),
(25, 'Jefe de División General'),
(26, 'Profesional I'),
(27, 'Profesional II'),
(28, 'Profesional III'),
(33, 'Técnico I'),
(34, 'Técnico II'),
(40, 'Bachiller I'),
(41, 'Bachiller II'),
(42, 'Bachiller III'),
(43, 'Obrero Grado (1)-MIN'),
(44, 'Obrero Grado (2)-MIN'),
(45, 'Obrero Grado (3)-MAX'),
(46, 'Obrero Grado (4)-MAX'),
(57, 'Obrero Grado (1)-MAX'),
(58, 'Obrero Grado (2)-MAX'),
(59, 'Obrero Grado (3)-MIN'),
(60, 'Obrero Grado (4)-MIN');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `catalogo_instituciones`
--

CREATE TABLE `catalogo_instituciones` (
  `id_institucion` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `siglas` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `catalogo_instituciones`
--

INSERT INTO `catalogo_instituciones` (`id_institucion`, `nombre`, `siglas`) VALUES
(53, 'Agencia Bolivariana para Actividades Espaciales', 'ABAE'),
(132, 'Alcaldía del Municipio Andrés Bello (Cordero)', 'ALC_ANDRES_BELLO'),
(133, 'Alcaldía del Municipio Antonio Rómulo Costa (Las Mesas)', 'ALC_ARC'),
(134, 'Alcaldía del Municipio Ayacucho (San Juan de Colón)', 'ALC_AYACUCHO'),
(118, 'Alcaldía del Municipio Baruta (Miranda)', 'ALC_BARUTA'),
(135, 'Alcaldía del Municipio Bolívar (San Antonio del Táchira)', 'ALC_BOLIVAR_T'),
(136, 'Alcaldía del Municipio Cárdenas (Tarija / Táriba)', 'ALC_CARDENAS'),
(124, 'Alcaldía del Municipio Caroní (Bolívar - Ciudad Guayana)', 'ALC_CARONI'),
(119, 'Alcaldía del Municipio Chacao (Miranda)', 'ALC_CHACAO'),
(137, 'Alcaldía del Municipio Córdoba (Santa Ana del Táchira)', 'ALC_CORDOBA'),
(121, 'Alcaldía del Municipio El Hatillo (Miranda)', 'ALC_ELHATILLO'),
(138, 'Alcaldía del Municipio Fernández Feo (San Rafael del Piñal)', 'ALC_FEO'),
(139, 'Alcaldía del Municipio Francisco de Miranda (San José de Bolívar)', 'ALC_FMIRANDA'),
(140, 'Alcaldía del Municipio García de Hevia (La Fría)', 'ALC_GARCIA_H'),
(123, 'Alcaldía del Municipio Girardot (Aragua - Maracay)', 'ALC_GIRARDOT'),
(141, 'Alcaldía del Municipio Guásimos (Palmira)', 'ALC_GUASIMOS'),
(125, 'Alcaldía del Municipio Heres (Bolívar - Ciudad Bolívar)', 'ALC_HERES'),
(142, 'Alcaldía del Municipio Independencia (Capacho Nuevo)', 'ALC_INDEP'),
(122, 'Alcaldía del Municipio Iribarren (Lara - Barquisimeto)', 'ALC_IRIBARREN'),
(143, 'Alcaldía del Municipio Jáuregui (La Grita)', 'ALC_JAUREGUI'),
(144, 'Alcaldía del Municipio José María Vargas (El Cobre)', 'ALC_JMVARGAS'),
(145, 'Alcaldía del Municipio Junín (Rubio)', 'ALC_JUNIN'),
(146, 'Alcaldía del Municipio Libertad (Capacho Viejo)', 'ALC_LIBERTAD_T'),
(147, 'Alcaldía del Municipio Libertador (Abejales)', 'ALC_LIBERTADOR_T'),
(115, 'Alcaldía del Municipio Libertador (Distrito Capital)', 'ALC_LIBERTADOR'),
(148, 'Alcaldía del Municipio Lobatera', 'ALC_LOBATERA'),
(128, 'Alcaldía del Municipio Maneiro (Nueva Esparta - Pampatar)', 'ALC_MANEIRO'),
(116, 'Alcaldía del Municipio Maracaibo (Zulia)', 'ALC_MARACAIBO'),
(149, 'Alcaldía del Municipio Michelena', 'ALC_MICHELENA'),
(150, 'Alcaldía del Municipio Panamericano (Coloncito)', 'ALC_PANAMERICANO'),
(151, 'Alcaldía del Municipio Pedro María Ureña (Ureña)', 'ALC_UREÑA'),
(152, 'Alcaldía del Municipio Rafael Urdaneta (Delicias)', 'ALC_RURDANETA'),
(153, 'Alcaldía del Municipio Samuel Darío Maldonado (La Tendida)', 'ALC_SDM'),
(131, 'Alcaldía del Municipio San Cristóbal', 'ALC_SAN_CRISTOBAL'),
(154, 'Alcaldía del Municipio San Judas Tadeo (Umuquena)', 'ALC_SJTADEO'),
(129, 'Alcaldía del Municipio Santiago Mariño (Mérida)', 'ALC_MERIDA'),
(155, 'Alcaldía del Municipio Seboruco', 'ALC_SEBORUCO'),
(127, 'Alcaldía del Municipio Simón Bolívar (Anzoátegui - Barcelona)', 'ALC_SBOLIVAR'),
(156, 'Alcaldía del Municipio Simón Rodríguez (San Simón)', 'ALC_SRODRIGUEZ'),
(126, 'Alcaldía del Municipio Sotillo (Anzoátegui - Puerto La Cruz)', 'ALC_SOTILLO'),
(120, 'Alcaldía del Municipio Sucre (Miranda)', 'ALC_SUCRE_M'),
(157, 'Alcaldía del Municipio Sucre (Queniquea)', 'ALC_SUCRE_T'),
(158, 'Alcaldía del Municipio Torbes (San Josecito)', 'ALC_TORBES'),
(159, 'Alcaldía del Municipio Uribante (Pregonero)', 'ALC_URIBANTE'),
(117, 'Alcaldía del Municipio Valencia (Carabobo)', 'ALC_VALENCIA'),
(130, 'Alcaldía del Municipio Vargas (La Guaira)', 'ALC_VARGAS'),
(23, 'Asamblea Nacional', 'AN'),
(78, 'Banco Bicentenario del Pueblo, de la Clase Obrera, Mujer y Comunas', 'BBV'),
(14, 'Banco Central de Venezuela', 'BCV'),
(79, 'Banco de Comercio Exterior', 'BANCOEX'),
(15, 'Banco de Venezuela', 'BDV'),
(77, 'Banco del Tesoro, C.A. Banco Universal', 'BT'),
(59, 'Bolivariana de Aeropuertos', 'BAER'),
(60, 'Bolivariana de Puertos', 'BOLIPUERTOS'),
(63, 'C.A. Metro de Caracas', 'CAMETRO'),
(82, 'C.A. Venezolana de Televisión', 'VTV'),
(52, 'Centro Nacional de Tecnología Química', 'CNTQ'),
(80, 'Comisión Nacional de Telecomunicaciones', 'CONATEL'),
(16, 'Compañía Anónima Nacional Teléfonos de Venezuela', 'CANTV'),
(65, 'Compañía Nacional de Reforestación', 'CONARE'),
(22, 'Consejo Nacional Electoral', 'CNE'),
(4, 'Contraloría del Estado Táchira', 'CET'),
(1, 'Contraloría General de la República', 'CGR'),
(161, 'Contraloría Municipal de Andrés Bello', 'CM_ANDRES_BELLO'),
(162, 'Contraloría Municipal de Antonio Rómulo Costa', 'CM_ARC'),
(163, 'Contraloría Municipal de Ayacucho', 'CM_AYACUCHO'),
(164, 'Contraloría Municipal de Bolívar', 'CM_BOLIVAR_T'),
(165, 'Contraloría Municipal de Cárdenas', 'CM_CARDENAS'),
(166, 'Contraloría Municipal de Córdoba', 'CM_CORDOBA'),
(167, 'Contraloría Municipal de Fernández Feo', 'CM_FEO'),
(168, 'Contraloría Municipal de Francisco de Miranda', 'CM_FMIRANDA'),
(169, 'Contraloría Municipal de García de Hevia', 'CM_GARCIA_H'),
(170, 'Contraloría Municipal de Guásimos', 'CM_GUASIMOS'),
(171, 'Contraloría Municipal de Independencia', 'CM_INDEP'),
(172, 'Contraloría Municipal de Jáuregui', 'CM_JAUREGUI'),
(173, 'Contraloría Municipal de José María Vargas', 'CM_JMVARGAS'),
(174, 'Contraloría Municipal de Junín', 'CM_JUNIN'),
(175, 'Contraloría Municipal de Libertad', 'CM_LIBERTAD_T'),
(176, 'Contraloría Municipal de Libertador', 'CM_LIBERTADOR_T'),
(177, 'Contraloría Municipal de Lobatera', 'CM_LOBATERA'),
(178, 'Contraloría Municipal de Michelena', 'CM_MICHELENA'),
(179, 'Contraloría Municipal de Panamericano', 'CM_PANAMERICANO'),
(180, 'Contraloría Municipal de Pedro María Ureña', 'CM_UREÑA'),
(181, 'Contraloría Municipal de Rafael Urdaneta', 'CM_RURDANETA'),
(182, 'Contraloría Municipal de Samuel Darío Maldonado', 'CM_SDM'),
(160, 'Contraloría Municipal de San Cristóbal', 'CM_SAN_CRISTOBAL'),
(183, 'Contraloría Municipal de San Judas Tadeo', 'CM_SJTADEO'),
(184, 'Contraloría Municipal de Seboruco', 'CM_SEBORUCO'),
(185, 'Contraloría Municipal de Simón Rodríguez', 'CM_SRODRIGUEZ'),
(186, 'Contraloría Municipal de Sucre', 'CM_SUCRE_T'),
(187, 'Contraloría Municipal de Torbes', 'CM_TORBES'),
(188, 'Contraloría Municipal de Uribante', 'CM_URIBANTE'),
(69, 'Corporación de Abastecimiento de Servicios Agrícolas', 'CASA'),
(191, 'Corporación de Infraestructura, Mantenimiento de Obras y Servicios del Estado Táchira', 'CORPOINTA'),
(17, 'Corporación Eléctrica Nacional', 'CORPOELEC'),
(193, 'COTATUR', 'COTATUR'),
(12, 'Cuerpo de Investigaciones Científicas, Penales y Criminalísticas', 'CICPC'),
(85, 'Defensa Pública de la República Bolivariana de Venezuela', 'DP'),
(3, 'Defensoría del Pueblo', 'DDP'),
(25, 'Dirección de Protección Civil y Administración de Desastres Táchira', 'PC Táchira'),
(84, 'Dirección Ejecutiva de la Magistratura', 'DEM'),
(76, 'Fondo de Protección Social de los Depósitos Bancarios', 'FOGADE'),
(54, 'Fundación Centro Nacional de Desarrollo e Investigación en Tecnologías Libres', 'CENDITEL'),
(87, 'Fundación de Edificaciones y Dotaciones Educativas', 'FEDE'),
(89, 'Fundación Gran Mariscal de Ayacucho', 'FUNDAYACUCHO'),
(88, 'Fundación Infocentro', 'INFOCENTRO'),
(55, 'Fundación Instituto de Estudios Avanzados', 'IDEA'),
(57, 'Fundación Misión Hábitat', 'FMH'),
(92, 'Gobernación del Estado Amazonas', 'GEAMAZONAS'),
(93, 'Gobernación del Estado Anzoátegui', 'GEANZOATEGUI'),
(194, 'Gobernación del Estado APure', 'GEA'),
(94, 'Gobernación del Estado Apure', 'GEAPURE'),
(95, 'Gobernación del Estado Aragua', 'GEARAGUA'),
(96, 'Gobernación del Estado Barinas', 'GEBARINAS'),
(97, 'Gobernación del Estado Bolívar', 'GEBOLIVAR'),
(98, 'Gobernación del Estado Carabobo', 'GECARABOBO'),
(99, 'Gobernación del Estado Cojedes', 'GECOJEDES'),
(100, 'Gobernación del Estado Delta Amacuro', 'GEDELTA'),
(101, 'Gobernación del Estado Falcón', 'GEFALCON'),
(102, 'Gobernación del Estado Guárico', 'GEGUARICO'),
(114, 'Gobernación del Estado La Guaira', 'GELG'),
(103, 'Gobernación del Estado Lara', 'GELARA'),
(104, 'Gobernación del Estado Mérida', 'GEMERIDA'),
(105, 'Gobernación del Estado Miranda', 'GEMIRANDA'),
(106, 'Gobernación del Estado Monagas', 'GEMONAGAS'),
(107, 'Gobernación del Estado Nueva Esparta', 'GENE'),
(108, 'Gobernación del Estado Portuguesa', 'GEPORTUGUESA'),
(109, 'Gobernación del Estado Sucre', 'GESUCRE'),
(24, 'Gobernación del Estado Táchira', 'GET'),
(110, 'Gobernación del Estado Táchira', 'GET'),
(111, 'Gobernación del Estado Trujillo', 'GETRUJILLO'),
(112, 'Gobernación del Estado Yaracuy', 'GEYARACUY'),
(113, 'Gobernación del Estado Zulia', 'GEZULIA'),
(91, 'Gobierno del Distrito Capital', 'GDC'),
(20, 'Instituto de Previsión y Asistencia Social para el Personal del Ministerio de Educación', 'IPASME'),
(192, 'Instituto de Vialidad del Tachira', 'IVT'),
(61, 'Instituto del Ferrocarril del Estado', 'IFE'),
(58, 'Instituto Nacional de Aeronáutica Civil', 'INAC'),
(62, 'Instituto Nacional de Canalizaciones', 'INCANANALIZACIONES'),
(90, 'Instituto Nacional de Deportes', 'IND'),
(50, 'Instituto Nacional de Higiene Rafael Rangel', 'INHRR'),
(56, 'Instituto Nacional de la Vivienda', 'INAVI'),
(68, 'Instituto Nacional de Nutrición', 'INN'),
(64, 'Instituto Nacional de Parques', 'INPARQUES'),
(11, 'Instituto Nacional de Transporte Terrestre', 'INTT'),
(190, 'Instituto Táchirense de Vivienda y Hábitat', 'INAVI_TACHIRA'),
(51, 'Instituto Venezolano de Investigaciones Científicas', 'IVIC'),
(19, 'Instituto Venezolano de los Seguros Sociales', 'IVSS'),
(67, 'Mercados de Alimentos C.A.', 'MERCAL'),
(39, 'Ministerio del Poder Popular de Desarrollo Minero Ecológico', 'MINMINERIA'),
(38, 'Ministerio del Poder Popular de Industrias y Producción Nacional', 'MPPIPN'),
(26, 'Ministerio del Poder Popular de Petróleo', 'MINPETROLEO'),
(8, 'Ministerio del Poder Popular de Relaciones Interiores, Justicia y Paz', 'MPPRIJP'),
(37, 'Ministerio del Poder Popular para el Comercio Nacional', 'MINCOMERCIO'),
(43, 'Ministerio del Poder Popular para el Deporte', 'MINDEPORTE'),
(49, 'Ministerio del Poder Popular para el Despacho de la Presidencia y Seguimiento de la Gestión de Gobierno', 'DPP'),
(31, 'Ministerio del Poder Popular para el Ecosocialismo', 'MINEC'),
(29, 'Ministerio del Poder Popular para el Proceso Social del Trabajo', 'MPPPST'),
(45, 'Ministerio del Poder Popular para el Servicio Penitenciario', 'MPPSP'),
(40, 'Ministerio del Poder Popular para el Turismo', 'MINTUR'),
(34, 'Ministerio del Poder Popular para la Agricultura Productiva y Tierras', 'MPPAPT'),
(35, 'Ministerio del Poder Popular para la Agricultura Urbana', 'MINAU'),
(47, 'Ministerio del Poder Popular para la Alimentación', 'MINAL'),
(32, 'Ministerio del Poder Popular para la Atención de las Aguas', 'MINAGUAS'),
(48, 'Ministerio del Poder Popular para la Comunicación e Información', 'MIPPCI'),
(41, 'Ministerio del Poder Popular para la Cultura', 'MINCULTURA'),
(28, 'Ministerio del Poder Popular para la Defensa', 'MPPD'),
(6, 'Ministerio del Poder Popular para la Educación', 'MPPE'),
(7, 'Ministerio del Poder Popular para la Educación Universitaria', 'MPPEU'),
(42, 'Ministerio del Poder Popular para la Juventud', 'MINJUVENTUD'),
(44, 'Ministerio del Poder Popular para la Mujer y la Igualdad de Género', 'MINMUJER'),
(36, 'Ministerio del Poder Popular para la Pesca y Acuicultura', 'MINPESCA'),
(27, 'Ministerio del Poder Popular para la Planificación', 'MPPP'),
(5, 'Ministerio del Poder Popular para la Salud', 'MPPS'),
(33, 'Ministerio del Poder Popular para las Comunas y los Movimientos Sociales', 'MPP_COMUNAS'),
(46, 'Ministerio del Poder Popular para los Pueblos Indígenas', 'MINPI'),
(30, 'Ministerio del Poder Popular para Relaciones Exteriores', 'MPPRE'),
(2, 'Ministerio Público', 'MP'),
(86, 'Oficina de Planificación del Sector Universitario', 'OPSU'),
(71, 'Oficina Nacional de Crédito Público', 'ONCP'),
(70, 'Oficina Nacional de Presupuesto', 'ONAPRE'),
(72, 'Oficina Nacional de Tesorería', 'ONT'),
(18, 'Petróleos de Venezuela, S.A.', 'PDVSA'),
(66, 'Productora y Distribuidora Venezolana de Alimentos', 'PDVAL'),
(83, 'Radio Nacional de Venezuela', 'RNV'),
(9, 'Servicio Administrativo de Identificación, Migración y Extranjería', 'SAIME'),
(10, 'Servicio Autónomo de Registros y Notarías', 'SAREN'),
(13, 'Servicio Nacional Integrado de Administración Aduanera y Tributaria', 'SENIAT'),
(74, 'Superintendencia de la Actividad Aseguradora', 'SUDEASEG'),
(73, 'Superintendencia de las Instituciones del Sector Bancario', 'SUDEBAN'),
(75, 'Superintendencia Nacional de Valores', 'SUNAVAL'),
(81, 'Telecomunicaciones Movilnet, C.A.', 'MOVILNET'),
(21, 'Tribunal Supremo de Justicia', 'TSJ');

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
(6, 1, 1.00, 2.00),
(7, 2, 2.00, 4.00),
(8, 3, 3.00, 6.00),
(9, 4, 4.00, 8.00),
(10, 5, 5.00, 10.00),
(11, 6, 6.20, 12.00),
(12, 7, 7.40, 15.00),
(13, 8, 8.60, 17.00),
(14, 9, 9.80, 20.00),
(15, 10, 11.00, 22.00),
(16, 11, 12.40, 25.00),
(17, 12, 13.80, 38.00),
(18, 13, 15.20, 30.00),
(19, 14, 16.60, 33.00),
(20, 15, 18.00, 36.00),
(21, 16, 19.60, 39.00),
(22, 17, 21.20, 42.00),
(23, 18, 22.80, 46.00),
(24, 19, 24.40, 49.00),
(25, 20, 26.00, 52.00),
(26, 21, 27.80, 56.00),
(27, 22, 29.60, 59.00),
(28, 23, 30.00, 60.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `configuracion_vacaciones`
--

CREATE TABLE `configuracion_vacaciones` (
  `id_configuracion` int(11) NOT NULL,
  `rango_minimo` int(11) DEFAULT NULL,
  `rango_maximo` int(11) DEFAULT NULL,
  `dias_disfrute` int(11) NOT NULL,
  `pago` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `configuracion_vacaciones`
--

INSERT INTO `configuracion_vacaciones` (`id_configuracion`, `rango_minimo`, `rango_maximo`, `dias_disfrute`, `pago`) VALUES
(8, 0, 5, 21, '220'),
(9, 5, 10, 24, '220'),
(10, 10, 15, 27, '220'),
(11, 15, 100, 31, '220');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `configuracion_vacaciones_obreros`
--

CREATE TABLE `configuracion_vacaciones_obreros` (
  `id_configuracion` int(11) NOT NULL,
  `anio` int(11) DEFAULT NULL,
  `dias_disfrute` int(11) NOT NULL,
  `pago` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `configuracion_vacaciones_obreros`
--

INSERT INTO `configuracion_vacaciones_obreros` (`id_configuracion`, `anio`, `dias_disfrute`, `pago`) VALUES
(1, 1, 15, '15'),
(2, 2, 16, '16'),
(3, 3, 17, '17'),
(4, 4, 18, '18'),
(5, 5, 19, '19'),
(6, 6, 20, '20'),
(7, 7, 21, '21'),
(8, 8, 22, '22'),
(9, 9, 23, '23'),
(10, 10, 24, '24'),
(11, 11, 25, '25'),
(12, 12, 26, '26'),
(13, 13, 27, '27'),
(14, 14, 28, '28'),
(15, 15, 29, '29'),
(16, 16, 30, '30');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `datos_laborales`
--

CREATE TABLE `datos_laborales` (
  `empleado_id` int(11) NOT NULL,
  `cargo_cet_id` int(11) DEFAULT NULL,
  `cargo_onapre_id` int(11) DEFAULT NULL,
  `nivel_salarial_id` int(11) DEFAULT NULL,
  `nivel_salarial_antiguo_id` int(11) DEFAULT NULL,
  `condicion_laboral_id` int(11) DEFAULT NULL,
  `prima_profesional_id` int(11) DEFAULT NULL,
  `direccion_id` int(11) DEFAULT NULL,
  `division_id` int(11) DEFAULT NULL,
  `unidad_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `datos_laborales`
--

INSERT INTO `datos_laborales` (`empleado_id`, `cargo_cet_id`, `cargo_onapre_id`, `nivel_salarial_id`, `nivel_salarial_antiguo_id`, `condicion_laboral_id`, `prima_profesional_id`, `direccion_id`, `division_id`, `unidad_id`) VALUES
(45, 48, 26, 103, 110, 1, 4, 3, 4, 18),
(46, 80, 23, 158, 165, 1, 4, 11, NULL, NULL),
(49, 40, 21, 99, 106, 1, 4, 17, NULL, NULL),
(50, 69, 34, 131, 138, 1, 3, 1, NULL, NULL),
(51, 48, 26, 137, 144, 1, 4, 3, 4, 5),
(54, 76, 46, 163, 170, 1, NULL, 10, NULL, 17),
(55, 76, 46, 163, 109, 1, NULL, 10, NULL, 17),
(56, 80, 23, 158, 165, 1, 4, NULL, NULL, NULL),
(57, 73, 40, 137, 109, 1, 4, NULL, NULL, NULL),
(58, 85, 40, 137, 144, NULL, NULL, NULL, NULL, NULL),
(59, 44, 24, 101, 108, NULL, 4, NULL, NULL, NULL),
(61, 60, 26, 102, 109, 1, NULL, 2, 8, NULL),
(65, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(66, 76, 46, 163, 170, 1, NULL, 14, NULL, 17),
(67, 41, 22, 100, 107, 1, 1, 10, NULL, NULL),
(68, 51, 26, 102, 109, 1, 4, 2, 9, NULL);

--
-- Disparadores `datos_laborales`
--
DELIMITER $$
CREATE TRIGGER `after_insert_datos_laborales_bitacora` AFTER INSERT ON `datos_laborales` FOR EACH ROW BEGIN
  DECLARE v_salario DECIMAL(10,2);
  DECLARE v_cargo_nombre VARCHAR(150);

  -- Obtener el salario base desde niveles_salariales
  SELECT COALESCE(ns.salario_base, 0)
    INTO v_salario
    FROM niveles_salariales ns
   WHERE ns.nivel_salarial_id = NEW.nivel_salarial_id;

  -- Obtener el nombre del cargo CET
  SELECT COALESCE(cet.nombre, 'No especificado')
    INTO v_cargo_nombre
    FROM cargos_cet cet
   WHERE cet.cargo_cet_id = NEW.cargo_cet_id;

  -- Insertar registro en la bitácora salarial
  INSERT INTO historial_salarios (empleado_id, fecha, monto_neto, observaciones)
  VALUES (
    NEW.empleado_id,
    CURDATE(),
    v_salario,
    CONCAT('Salario inicial asignado por ingreso a la institución. Cargo: ', v_cargo_nombre, '.')
  );
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_insert_datos_laborales_cargo` AFTER INSERT ON `datos_laborales` FOR EACH ROW BEGIN
    DECLARE dept_name VARCHAR(150);
    
    SET dept_name = (
        SELECT COALESCE(
            (SELECT nombre FROM unidades WHERE unidad_id = NEW.unidad_id),
            (SELECT nombre FROM divisiones WHERE division_id = NEW.division_id),
            (SELECT nombre FROM direcciones WHERE direccion_id = NEW.direccion_id)
        )
    );

    INSERT INTO relacion_cargos (
        empleado_id,
        cargo_cet_id,
        fecha_inicio_actual,
        fecha_inicio_anterior,
        descripcion,
        nombre_departamento
    ) VALUES (
        NEW.empleado_id,
        NEW.cargo_cet_id,
        CURDATE(),
        NULL,
        'Asignación de cargo',
        dept_name
    );
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_update_datos_laborales_bitacora` AFTER UPDATE ON `datos_laborales` FOR EACH ROW BEGIN
  DECLARE v_salario_nuevo DECIMAL(10,2);
  DECLARE v_cargo_anterior VARCHAR(150);
  DECLARE v_cargo_nuevo VARCHAR(150);
  DECLARE v_observacion TEXT;

  -- ──────────────────────────────────────────────────────────────────────────
  -- Evaluación de activación:
  -- Solo proceder si el nivel salarial (salario) cambió realmente.
  -- COALESCE maneja posibles valores NULL en los IDs.
  -- ──────────────────────────────────────────────────────────────────────────
  IF COALESCE(OLD.nivel_salarial_id, 0) <> COALESCE(NEW.nivel_salarial_id, 0) THEN

    -- Obtener el nuevo salario base
    SELECT COALESCE(ns.salario_base, 0)
      INTO v_salario_nuevo
      FROM niveles_salariales ns
     WHERE ns.nivel_salarial_id = NEW.nivel_salarial_id;

    -- ────────────────────────────────────────────────────────────────────────
    -- Evaluación del motivo:
    -- ¿Cambió también el cargo?
    -- ────────────────────────────────────────────────────────────────────────
    IF COALESCE(OLD.cargo_cet_id, 0) <> COALESCE(NEW.cargo_cet_id, 0) THEN
      -- Escenario A: Cambio de cargo
      SELECT COALESCE(cet.nombre, 'No especificado')
        INTO v_cargo_anterior
        FROM cargos_cet cet
       WHERE cet.cargo_cet_id = OLD.cargo_cet_id;

      SELECT COALESCE(cet.nombre, 'No especificado')
        INTO v_cargo_nuevo
        FROM cargos_cet cet
       WHERE cet.cargo_cet_id = NEW.cargo_cet_id;

      SET v_observacion = CONCAT(
        'Ajuste salarial por Cambio de Cargo. ',
        'Cargo anterior: ', v_cargo_anterior,
        '. Cargo nuevo: ', v_cargo_nuevo, '.'
      );
    ELSE
      -- Escenario B: Ajuste regular sin cambio de cargo
      SET v_observacion = 'Ajuste salarial regular (Sin cambio de cargo).';
    END IF;

    -- Insertar registro en la bitácora (una nueva fila, inmutable)
    INSERT INTO historial_salarios (empleado_id, fecha, monto_neto, observaciones)
    VALUES (
      NEW.empleado_id,
      CURDATE(),
      v_salario_nuevo,
      v_observacion
    );
  END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_update_datos_laborales_cargo` AFTER UPDATE ON `datos_laborales` FOR EACH ROW BEGIN
    DECLARE dept_name VARCHAR(150);
    DECLARE last_start_date DATE;

    IF NEW.cargo_cet_id <> OLD.cargo_cet_id THEN
        SET dept_name = (
            SELECT COALESCE(
                (SELECT nombre FROM unidades WHERE unidad_id = NEW.unidad_id),
                (SELECT nombre FROM divisiones WHERE division_id = NEW.division_id),
                (SELECT nombre FROM direcciones WHERE direccion_id = NEW.direccion_id)
            )
        );
        
        SET last_start_date = (
            SELECT fecha_inicio_actual 
            FROM relacion_cargos 
            WHERE empleado_id = NEW.empleado_id 
            ORDER BY relacion_cargo_id DESC 
            LIMIT 1
        );

        INSERT INTO relacion_cargos (
            empleado_id,
            cargo_cet_id,
            fecha_inicio_actual,
            fecha_inicio_anterior,
            descripcion,
            nombre_departamento
        ) VALUES (
            NEW.empleado_id,
            NEW.cargo_cet_id,
            CURDATE(),
            last_start_date,
            'Cambio de cargo',
            dept_name
        );
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_update_datos_laborales_retroactivo` AFTER UPDATE ON `datos_laborales` FOR EACH ROW BEGIN
          DECLARE v_fecha_inicio DATE;
          DECLARE v_fecha_corte DATE;
          DECLARE v_dias_diff INT;
          DECLARE v_year INT;
          DECLARE v_month INT;
          DECLARE v_last_day INT;
          DECLARE v_day_corte INT;

          -- Solo crear retroactivo si cambia el cargo ONAPRE o el nivel salarial
          IF NOT (OLD.nivel_salarial_id <=> NEW.nivel_salarial_id) OR NOT (OLD.cargo_onapre_id <=> NEW.cargo_onapre_id) THEN
              SET v_fecha_inicio = CURDATE();
              SET v_year = YEAR(v_fecha_inicio);
              SET v_month = MONTH(v_fecha_inicio);
              SET v_last_day = DAY(LAST_DAY(v_fecha_inicio));

              IF v_last_day < 30 THEN
                  SET v_day_corte = v_last_day;
              ELSE
                  SET v_day_corte = 30;
              END IF;

              SET v_fecha_corte = STR_TO_DATE(CONCAT(v_year, '-', v_month, '-', v_day_corte), '%Y-%m-%d');
              SET v_dias_diff = DATEDIFF(v_fecha_corte, v_fecha_inicio);

              IF v_dias_diff < 0 THEN
                  SET v_dias_diff = 0;
              END IF;

              -- Insertar el registro de retroactivo
              INSERT INTO retroactivos (
                  empleado_id,
                  fecha_inicio,
                  fecha_corte,
                  cargo_cet_id,
                  cargo_onapre_id,
                  nivel_salarial_id,
                  cargo_onapre_anterior_id,
                  nivel_salarial_anterior_id,
                  direccion_id,
                  division_id,
                  unidad_id,
                  dias_diferencia,
                  delta_sueldo,
                  delta_antiguedad,
                  delta_profesionalizacion,
                  delta_jerarquia,
                  monto_retroactivo,
                  estado,
                  observacion
              ) VALUES (
                  NEW.empleado_id,
                  v_fecha_inicio,
                  v_fecha_corte,
                  NEW.cargo_cet_id,
                  NEW.cargo_onapre_id,
                  NEW.nivel_salarial_id,
                  OLD.cargo_onapre_id,
                  OLD.nivel_salarial_id,
                  NEW.direccion_id,
                  NEW.division_id,
                  NEW.unidad_id,
                  v_dias_diff,
                  0.00,
                  0.00,
                  0.00,
                  0.00,
                  0.00,
                  'PENDIENTE',
                  'Creado automáticamente por cambio de cargo/nivel'
              );
          END IF;
      END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `before_insert_datos_laborales_nivel` BEFORE INSERT ON `datos_laborales` FOR EACH ROW BEGIN
          DECLARE v_salario DECIMAL(10,2);
          DECLARE v_default_nivel INT;
          DECLARE v_salario_minimo DECIMAL(10,2);

          IF NEW.nivel_salarial_id IS NULL THEN
              SELECT nivel_salarial_id INTO v_default_nivel
              FROM niveles_salariales
              WHERE nombre = 'I' AND cargo_onapre_id = 40
              LIMIT 1;

              IF v_default_nivel IS NOT NULL THEN
                  SET NEW.nivel_salarial_id = v_default_nivel;
              END IF;
          END IF;

          IF NEW.nivel_salarial_id IS NOT NULL THEN
              SELECT salario_base INTO v_salario
              FROM niveles_salariales
              WHERE nivel_salarial_id = NEW.nivel_salarial_id
              LIMIT 1;

              SELECT MIN(salario_base) INTO v_salario_minimo
              FROM niveles_salariales;

              IF v_salario IS NOT NULL AND v_salario_minimo IS NOT NULL AND v_salario < v_salario_minimo THEN
                  SIGNAL SQLSTATE '45000'
                  SET MESSAGE_TEXT = '[ALERTA SALARIO] El salario del nivel asignado es inferior al mínimo de la escala. Registro rechazado.';
              END IF;

              SET NEW.nivel_salarial_antiguo_id = (
                  SELECT nsa.nivel_salarial_antiguo_id
                  FROM niveles_salariales_antiguos nsa
                  INNER JOIN niveles_salariales ns
                      ON ns.nombre = nsa.nombre
                      AND ns.cargo_onapre_id = nsa.cargo_onapre_id
                  WHERE ns.nivel_salarial_id = NEW.nivel_salarial_id
                  LIMIT 1
              );
          END IF;
      END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `before_update_datos_laborales_nivel` BEFORE UPDATE ON `datos_laborales` FOR EACH ROW BEGIN
          DECLARE v_salario DECIMAL(10,2);
          DECLARE v_default_nivel INT;
          DECLARE v_salario_minimo DECIMAL(10,2);

          IF NEW.nivel_salarial_id IS NULL THEN
              SELECT nivel_salarial_id INTO v_default_nivel
              FROM niveles_salariales
              WHERE nombre = 'I' AND cargo_onapre_id = 40
              LIMIT 1;

              IF v_default_nivel IS NOT NULL THEN
                  SET NEW.nivel_salarial_id = v_default_nivel;
              END IF;
          END IF;

          IF NEW.nivel_salarial_id IS NOT NULL
             AND (OLD.nivel_salarial_id IS NULL OR NEW.nivel_salarial_id <> OLD.nivel_salarial_id) THEN

              SELECT salario_base INTO v_salario
              FROM niveles_salariales
              WHERE nivel_salarial_id = NEW.nivel_salarial_id
              LIMIT 1;

              SELECT MIN(salario_base) INTO v_salario_minimo
              FROM niveles_salariales;

              IF v_salario IS NOT NULL AND v_salario_minimo IS NOT NULL AND v_salario < v_salario_minimo THEN
                  SIGNAL SQLSTATE '45000'
                  SET MESSAGE_TEXT = '[ALERTA SALARIO] El salario del nivel asignado es inferior al mínimo de la escala. Registro rechazado.';
              END IF;

              SET NEW.nivel_salarial_antiguo_id = (
                  SELECT nsa.nivel_salarial_antiguo_id
                  FROM niveles_salariales_antiguos nsa
                  INNER JOIN niveles_salariales ns
                      ON ns.nombre = nsa.nombre
                      AND ns.cargo_onapre_id = nsa.cargo_onapre_id
                  WHERE ns.nivel_salarial_id = NEW.nivel_salarial_id
                  LIMIT 1
              );
          ELSEIF NEW.nivel_salarial_id IS NULL THEN
              SET NEW.nivel_salarial_antiguo_id = NULL;
          END IF;
      END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `deducciones`
--

CREATE TABLE `deducciones` (
  `deduccion_id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `porcentaje` decimal(5,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `deducciones`
--

INSERT INTO `deducciones` (`deduccion_id`, `nombre`, `porcentaje`) VALUES
(1, 'IVSS', 4.00),
(2, 'FAOV', 1.00),
(3, 'R.P.E Empleado', 0.50),
(4, 'R.P.E Patronal', 2.00),
(5, 'F.E.J.P empleado', 3.00),
(6, 'Caja Ahorro', 10.00),
(7, 'FAOV Patronal', 2.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `dias_festivos`
--

CREATE TABLE `dias_festivos` (
  `id_festivo` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  `recurrente` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `dias_festivos`
--

INSERT INTO `dias_festivos` (`id_festivo`, `fecha`, `descripcion`, `recurrente`) VALUES
(1, '2026-01-01', 'Año nuevo', 1),
(2, '2026-01-20', 'Día del Patrono de la ciudad San Sebástian', 1),
(3, '2026-02-16', 'Carnavales', 1),
(4, '2026-02-17', 'Carnavales', 1),
(5, '2026-04-01', 'Semana Santa', 1),
(6, '2026-04-02', 'Semana Santa', 1),
(7, '2026-04-03', 'Semana Santa', 1),
(8, '2026-05-01', 'Día del trabajador ', 1),
(9, '2026-06-24', 'Día de la Batalla de Carabobo', 1),
(10, '2026-07-24', 'Natalicio De Simón Bolívar', 1),
(11, '2026-08-06', 'Día del Santo Cristo de la Grita', 1),
(12, '2026-09-04', 'Día del funcionario público', 1),
(13, '2026-10-12', 'Día de la Resitencia Indígena', 1),
(14, '2026-12-17', 'Conmemoración de la muerte del Libertador', 1),
(15, '2026-12-24', 'Navidad', 1),
(16, '2026-12-25', 'Navidad', 1),
(17, '2026-12-31', 'Fin de año', 1),
(18, '2026-11-11', 'eeeerr', 1);

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
(1, 'Despacho del Contralor'),
(2, 'Dirección de Recursos Humanos'),
(3, 'Dirección General'),
(5, 'Dirección de la Secretaria del Despacho del Contralor'),
(6, 'Dirección de Control de la Administración Descentralizada'),
(7, 'Dirección de Investigaciones'),
(8, 'Dirección de Control de la Administración Central y Poder Legislativo'),
(9, 'Dirección de Determinación de Responsabilidades'),
(10, 'Dirección de Servicios Generales, Seguridad y Transporte '),
(11, 'Dirección de Planificación, Organización y Métodos'),
(12, 'Dirección de Administración'),
(13, 'Dirección de Consultoría Jurídica '),
(14, 'Dirección de Servicios Generales, Seguridad y Transporte'),
(15, 'Oficina de Atención AL Público Y Participación Ciudadana '),
(16, 'Unidad de Auditoria Interna'),
(17, 'Contralor del Estado');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `divisiones`
--

CREATE TABLE `divisiones` (
  `division_id` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `direccion_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `divisiones`
--

INSERT INTO `divisiones` (`division_id`, `nombre`, `direccion_id`) VALUES
(2, 'División de Reclutamiento', 2),
(4, 'División General de Sistema, Servicio Técnico y Digitalización', 3),
(7, 'División General de Control de Gestión y Organización', 11),
(8, 'División General de Recursos Humanos', 2),
(9, 'División de Remuneraciones', 2),
(10, 'División de Talento Humano', 2),
(11, 'División de Seguridad y Salud Laboral', 2),
(12, 'División General de Administración y Control de Presupuesto', 12),
(13, 'División General de Compras, Bienes e Inventarios', 12),
(14, 'División General de Control de la Administración Central y Poder Administrativo', 8),
(15, 'División General del Sector Infraestructura', 6),
(16, 'División General del Sector Económico y Social', 6),
(17, 'División General de Investigaciones', 7),
(18, 'División de Determinación de Responsabilidades', 9),
(19, 'Sin División (Auditoría Interna)', 16),
(20, 'Sin División (Atención al Publico)', 15);

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
  `lugar_nacimiento` varchar(100) DEFAULT NULL,
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
  `contacto_emergencia_1` varchar(150) DEFAULT NULL,
  `telefono_emergencia_1` varchar(20) DEFAULT NULL,
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
(45, 'V14502107', 'Luis Mariano', 'Mantione Contreras', 'V16778235', '1998-08-09', 'por ahi', 'M', 'Casado', 'A+', 'kl.hk,jvh', 'bauiop\';olikugyfc bn', 'cpasic', '04161373897', '098765', 'salamanca101@gmail.com', 'salamanca102@gmail.com', '2022-10-17', NULL, NULL, 'Luis Bolaños', '0412345986', 'Luis Bolaños', '00000001', 1, 9, '', '12345678901234567890'),
(46, 'V15947515', 'Jenifer Carolina', 'Restrepo Arellano', 'V15947515-1', '1999-09-09', 'por ahi', 'F', 'Viudo', 'A+', 'kl.hk,jvh', 'ajedrez', 'Municipio Libertador, Calle 2, Casa n3', '04161373897', '0412345986', 'lewis@gmail.com', 'lewis@gmail.com', '2021-09-01', NULL, NULL, 'Luis Bolaños', '0412345986', 'Luis Bolaños', '00000001', 2, 8, '', '09999999999999999999'),
(49, 'V18845038', 'Luis Alejandro', 'Aguilar Montilva', 'V18845038-1', '1999-08-09', 'pojijpi', 'M', 'Soltero', 'A+', 'j bj', 'bauiop\';olikugyfc bn', 'Municipio Libertador, Calle 2, Casa n3', '04161373897', '0412345986', 'lewis@gmail.com', 'lewis@gmail.com', '2023-02-01', NULL, NULL, 'Luis Bolaños', '0412345986', 'Luis Bolaños', '0412345986', 2, 4, '', '12345678901234567890'),
(50, 'V16408021', 'Nilsy Lisbeth', 'Arias Niño', 'V16408021-1', '1999-08-08', 'fefeew', 'F', 'Soltero', 'A+', 'j bj', 'bauolsa', 'Municipio Libertador, Calle 2, Casa n3', '04161373897', '0412345986', 'lewis@gmail.com', 'lewis@gmail.com', '2022-07-01', NULL, NULL, 'Luis Bolaños', '0412345986', 'Luis Bolaños', '0412345986', 11, 7, '', '09999999999999999999'),
(51, 'V30111366', 'Jose Alberto', 'Omaña Sanchez', 'V30111366-1', '2004-02-02', 'seboruco city', 'M', 'Soltero', 'A+', 'baila', 'baila', 'Municipio Libertador, Calle 2, Casa n3', '04161373897', '0412345986', 'lewis@gmail.com', 'lewis@gmail.com', '2025-07-02', NULL, NULL, 'Luis Bolaños', '0412345986', 'Luis Bolaños', '00000000', 1, 8, '', '12345678901234567890'),
(54, 'V10175817', 'Elizabeth', 'Lizarazo', 'V10175817-1', '1999-09-09', 'uhSOINXS', 'F', 'Soltero', 'B-', 'kl.hk,jvh', 'bauiop\';olikugyfc bn', 'Municipio Libertador, Calle 2, Casa n3', '04161373897', '098765', 'lewis@gmail.com', 'angelavillamizar900@gmail.com', '2004-03-23', NULL, NULL, 'Luis Bolaños', '0412345986', 'Luis Bolaños', '0412345986', NULL, 8, '', ''),
(55, 'V9217928', 'Ediz', 'Marquez de Jimenez', 'V9217928-9', '1944-09-08', 'etrl´_.,mhn', 'F', 'Casado', 'A-', 'kl.hk,jvh', 'bauiop\';olikugyfc bn', 'Municipio Libertador, Calle 2, Casa n3', '04161373897', '0412345986', 'lewis@gmail.com', 'salamanca1@gmail.com', '2012-05-16', NULL, NULL, 'Luis Bolaños', '0412345986', 'Luis Bolaños', '00000000', NULL, 1, '', '09999999999999999999'),
(56, 'V9336657', 'Blanca Gladys', 'Ramirez Mendoza', 'V9336657-9', '1999-09-09', '', 'F', 'Soltero', 'O+', '', '', 'Municipio Libertador, Calle 2, Casa n3', '04161373897', '0412345986', 'SONIARGUELLO10Y@GMAIL.COM', 'SONIARGUELLO10Y@GMAIL.COM', '2021-10-03', '', NULL, 'Luis Bolaños', '0412345986', 'Luis Bolaños', '00000001', 2, 3, '', '09999999999999999999'),
(57, 'V5683136', 'Gloria Zulay', 'Velasco de Jaimes', 'V5683136-1', '1952-02-09', '', 'F', 'Casado', 'O+', '', '', 'Municipio Libertador, Calle 2, Casa n3', '0412345986', '0412345986', 'angelavillamizar900@gmail.com', 'SONIARGUELLO10Y@GMAIL.COM', '1983-05-02', '', NULL, 'Luis Bolaños', '0412345986', 'Luis Bolaños', '0412345982', NULL, 3, '', '12345678901234567890'),
(58, 'V1584405', 'Roger Alberto', 'Castellanos', 'V1584405-1', '1967-09-09', '', 'M', 'Soltero', 'AB-', '', '', 'cpasic', '04161373897', '0412345986', 'SONIARGUELLO11Y@GMAIL.COM', 'SONIARGUELLO10Y@GMAIL.COM', '2007-05-15', '', NULL, 'Luis Bolaños', '0412345986', 'Luis Bolaños', '0412345986', NULL, 4, '', '12345678901234567890'),
(59, 'V9225056', 'Carolina', 'Parcesepe Martinez', 'V9225056', '1976-09-09', '', 'F', 'Soltero', 'O+', '', '', 'cpasic', '04161373897', '0412345986', 'salamanca@gmail.com', 'salamanca1@gmail.com', '2007-11-10', '', NULL, 'Luis Bolaños', '0412345986', 'Luis Bolaños', '0412345986', 6, 4, '', '09999999999999999999'),
(61, 'V5665819', 'Doly Ysolina', 'Quiroz', 'N/A', '1979-09-09', 'No especificado', 'F', 'Soltero', NULL, NULL, NULL, 'axdgcfhnñm.,mnhgx', NULL, '', '', NULL, '0000-00-00', NULL, NULL, NULL, NULL, NULL, NULL, 1, 7, '', NULL),
(65, 'V31053492', 'Marlene ', 'Pedraza de Armas', NULL, '1978-08-09', 'No especificado', 'F', 'Soltero', NULL, NULL, NULL, 'iwdjwqijcfioqefiojfe', NULL, '', '', NULL, '0000-00-00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 7, '', NULL),
(66, 'V9226358', 'Rosa Elena', 'Useche de Osorio', 'V9226358-1', '1999-09-09', 'fgvbencoieqvo', 'F', 'Casado', 'O+', 'j bj', 'bauolsa', 'Municipio Libertador, Calle 2, Casa n3', '04161373897', '09876521111', 'lewis@gmail.com', 'angelavillamizar900@gmail.com', '2003-02-16', NULL, NULL, 'Luis Bolaños', '0412345986', 'Luis Bolaños', '0412345986', NULL, 8, '', ''),
(67, 'V90609124627', 'Empleado', 'Prueba Notificacion', 'V90609124627-1', '1994-01-15', NULL, 'M', 'Soltero', NULL, NULL, NULL, 'Direccion de prueba para notificaciones', NULL, '04140000000', 'prueba.0609124627@example.com', NULL, '2022-03-09', NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '', '00000000000000000000'),
(68, '29908320', 'ANGELA MARINA ', 'VILLAMIZAR', '29908320-1', '2003-02-08', 'wqdqwedwqd', 'F', 'Soltero', 'A+', 'adefef', 'bauolsa', 'WDWDDWQDWDQDW', '04161373897', '0412345986', 'angelavillamizar101@gmail.com', 'angelavillamizar101@gmail.com', '2024-06-18', NULL, NULL, NULL, NULL, NULL, NULL, 1, 1, '', '2134567890\'¿');

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
  `division_id` int(11) DEFAULT NULL,
  `unidad_id` int(11) DEFAULT NULL,
  `observacion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `encargos_temporales`
--

INSERT INTO `encargos_temporales` (`encargo_id`, `empleado_id`, `fecha_inicio`, `fecha_fin`, `estatus_encargo`, `cargo_cet_id`, `cargo_onapre_id`, `nivel_salarial_id`, `nivel_salarial_antiguo_id`, `direccion_id`, `division_id`, `unidad_id`, `observacion`) VALUES
(14, 50, '2026-05-14', NULL, 1, 41, 22, 100, NULL, 7, 17, NULL, NULL),
(15, 46, '2026-05-22', '2026-05-26', 0, 44, 24, 101, NULL, 3, 4, 5, 'kjh');

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
(7, 'Sobreviviente'),
(8, 'De vacaciones'),
(9, 'Reintegro por necesidades de servicio');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `fechas_vacaciones`
--

CREATE TABLE `fechas_vacaciones` (
  `id_vacaciones` int(11) DEFAULT NULL,
  `id_fecha` int(11) NOT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `dias_habiles` int(11) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `id_status_vacaciones` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `fechas_vacaciones`
--

INSERT INTO `fechas_vacaciones` (`id_vacaciones`, `id_fecha`, `fecha_inicio`, `fecha_fin`, `dias_habiles`, `observaciones`, `id_status_vacaciones`) VALUES
(36, 48, '2026-06-18', '2026-07-06', 12, 'ffvgrvt', 2),
(36, 49, '2026-06-18', '2026-07-06', 11, 'fefqffqwwf', 4),
(36, 50, '2026-06-18', '2026-07-06', 12, 'ef', 2),
(36, 51, '2026-06-18', '2026-07-06', 11, 'HVFUYFUY', 4);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `firmantes_recibo`
--

CREATE TABLE `firmantes_recibo` (
  `id` int(10) UNSIGNED NOT NULL,
  `cargo_clave` varchar(60) NOT NULL COMMENT 'Clave interna fija, ej: analista_personal',
  `cargo_nombre` varchar(120) NOT NULL COMMENT 'Etiqueta que aparece en el recibo',
  `nombre` varchar(200) NOT NULL DEFAULT '' COMMENT 'Nombre del ocupante actual',
  `orden` tinyint(3) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'Posición en la fila de firmas',
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `firmantes_recibo`
--

INSERT INTO `firmantes_recibo` (`id`, `cargo_clave`, `cargo_nombre`, `nombre`, `orden`, `activo`, `updated_at`) VALUES
(1, 'analista_personal', 'Analista de Personal', '', 1, 1, '2026-06-18 11:40:16'),
(2, 'jefe_remuneraciones', 'Jefe de Remuneraciones', '', 2, 1, '2026-06-18 11:40:16'),
(3, 'jefe_division', 'Jefe de División', '', 3, 1, '2026-06-18 11:40:16'),
(4, 'director_rrhh', 'Directora de Recursos Humanos', '', 4, 1, '2026-06-18 11:40:16');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historial_pagos`
--

CREATE TABLE `historial_pagos` (
  `id_historial` int(11) NOT NULL,
  `empleado_id` int(11) NOT NULL,
  `tipo_personal` varchar(30) NOT NULL DEFAULT 'Funcionario' COMMENT 'Funcionario|Obrero Fijo|Jubilado|Pensionado|Sobreviviente',
  `quincena_no` tinyint(1) NOT NULL COMMENT '1 = Primera quincena, 2 = Segunda quincena',
  `mes` tinyint(2) NOT NULL COMMENT '1-12',
  `anio` smallint(6) NOT NULL,
  `total_asignaciones` decimal(14,2) NOT NULL DEFAULT 0.00,
  `total_deducciones` decimal(14,2) NOT NULL DEFAULT 0.00,
  `salario_neto` decimal(14,2) NOT NULL DEFAULT 0.00,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `historial_pagos`
--

INSERT INTO `historial_pagos` (`id_historial`, `empleado_id`, `tipo_personal`, `quincena_no`, `mes`, `anio`, `total_asignaciones`, `total_deducciones`, `salario_neto`, `fecha_registro`) VALUES
(104, 61, 'Sobreviviente', 1, 7, 2026, 65.00, 0.00, 65.00, '2026-06-14 22:12:02'),
(105, 65, 'Sobreviviente', 1, 7, 2026, 65.00, 0.00, 65.00, '2026-06-14 22:12:02'),
(106, 50, 'Sobreviviente', 1, 7, 2026, 65.00, 0.00, 65.00, '2026-06-14 22:12:02'),
(107, 61, 'Sobreviviente', 2, 7, 2026, 65.00, 0.00, 65.00, '2026-06-14 22:12:09'),
(108, 65, 'Sobreviviente', 2, 7, 2026, 65.00, 0.00, 65.00, '2026-06-14 22:12:09'),
(109, 50, 'Sobreviviente', 2, 7, 2026, 65.00, 0.00, 65.00, '2026-06-14 22:12:09'),
(110, 49, 'Funcionario', 1, 7, 2026, 333.56, 43.73, 289.83, '2026-06-14 22:20:56'),
(111, 46, 'Funcionario', 1, 7, 2026, 301.34, 40.25, 261.09, '2026-06-14 22:20:56'),
(112, 67, 'Funcionario', 1, 7, 2026, 311.74, 40.79, 270.95, '2026-06-14 22:20:56'),
(113, 45, 'Funcionario', 1, 7, 2026, 207.66, 27.06, 180.60, '2026-06-14 22:20:56'),
(114, 51, 'Funcionario', 1, 7, 2026, 125.97, 14.96, 111.01, '2026-06-14 22:20:56'),
(115, 49, 'Funcionario', 2, 7, 2026, 333.56, 43.73, 289.83, '2026-06-14 22:20:59'),
(116, 46, 'Funcionario', 2, 7, 2026, 301.34, 40.25, 261.09, '2026-06-14 22:20:59'),
(117, 67, 'Funcionario', 2, 7, 2026, 311.74, 40.79, 270.95, '2026-06-14 22:20:59'),
(118, 45, 'Funcionario', 2, 7, 2026, 207.66, 27.06, 180.60, '2026-06-14 22:20:59'),
(119, 51, 'Funcionario', 2, 7, 2026, 125.97, 14.96, 111.01, '2026-06-14 22:20:59'),
(120, 54, 'Obrero Fijo', 1, 7, 2026, 151.06, 18.97, 132.09, '2026-06-14 22:21:21'),
(121, 55, 'Obrero Fijo', 1, 7, 2026, 139.38, 18.05, 121.33, '2026-06-14 22:21:21'),
(122, 66, 'Obrero Fijo', 1, 7, 2026, 151.42, 18.99, 132.43, '2026-06-14 22:21:21'),
(123, 54, 'Obrero Fijo', 2, 7, 2026, 151.06, 18.97, 132.09, '2026-06-14 22:21:25'),
(124, 55, 'Obrero Fijo', 2, 7, 2026, 139.38, 18.05, 121.33, '2026-06-14 22:21:25'),
(125, 66, 'Obrero Fijo', 2, 7, 2026, 151.42, 18.99, 132.43, '2026-06-14 22:21:25'),
(126, 56, 'Jubilado', 1, 7, 2026, 218.55, 14.10, 204.45, '2026-06-14 22:21:30'),
(127, 57, 'Jubilado', 1, 7, 2026, 80.60, 5.20, 75.40, '2026-06-14 22:21:30'),
(128, 56, 'Jubilado', 2, 7, 2026, 218.55, 14.10, 204.45, '2026-06-14 22:21:38'),
(129, 57, 'Jubilado', 2, 7, 2026, 80.60, 5.20, 75.40, '2026-06-14 22:21:38'),
(151, 58, 'Pensionado', 1, 7, 2026, 65.00, 6.50, 58.50, '2026-06-16 14:19:46'),
(152, 59, 'Pensionado', 1, 7, 2026, 65.00, 6.50, 58.50, '2026-06-16 14:19:46'),
(153, 58, 'Pensionado', 2, 7, 2026, 65.00, 6.50, 58.50, '2026-06-16 14:19:52'),
(154, 59, 'Pensionado', 2, 7, 2026, 65.00, 6.50, 58.50, '2026-06-16 14:19:52');

--
-- Disparadores `historial_pagos`
--
DELIMITER $$
CREATE TRIGGER `before_insert_historial_pagos` BEFORE INSERT ON `historial_pagos` FOR EACH ROW BEGIN
  DECLARE msg VARCHAR(255);
  IF NEW.quincena_no NOT IN (1, 2) THEN
    SET msg = CONCAT('Valor inválido para quincena_no: ', NEW.quincena_no, '. Debe ser 1 o 2.');
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
  END IF;
  IF NEW.mes < 1 OR NEW.mes > 12 THEN
    SET msg = CONCAT('Valor inválido para mes: ', NEW.mes, '. Debe estar entre 1 y 12.');
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
  END IF;
  IF NEW.anio < 2000 OR NEW.anio > 2100 THEN
    SET msg = CONCAT('Valor inválido para anio: ', NEW.anio, '. Debe estar entre 2000 y 2100.');
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
  END IF;
  IF NEW.salario_neto < 0 THEN
    SET msg = CONCAT('El salario neto no puede ser negativo: ', NEW.salario_neto);
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
  END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `before_insert_historial_salarios` BEFORE INSERT ON `historial_pagos` FOR EACH ROW BEGIN
  DECLARE msg VARCHAR(255);
  IF NEW.quincena_no NOT IN (1, 2) THEN
    SET msg = CONCAT('Valor inválido para quincena_no: ', NEW.quincena_no, '. Debe ser 1 o 2.');
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
  END IF;
  IF NEW.mes < 1 OR NEW.mes > 12 THEN
    SET msg = CONCAT('Valor inválido para mes: ', NEW.mes, '. Debe estar entre 1 y 12.');
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
  END IF;
  IF NEW.anio < 2000 OR NEW.anio > 2100 THEN
    SET msg = CONCAT('Valor inválido para anio: ', NEW.anio, '. Debe estar entre 2000 y 2100.');
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
  END IF;
  IF NEW.salario_neto < 0 THEN
    SET msg = CONCAT('El salario neto no puede ser negativo: ', NEW.salario_neto);
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
  END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `before_update_historial_salarios` BEFORE UPDATE ON `historial_pagos` FOR EACH ROW BEGIN
  DECLARE msg VARCHAR(255);
  IF NEW.empleado_id != OLD.empleado_id OR
     NEW.quincena_no != OLD.quincena_no OR
     NEW.mes != OLD.mes OR
     NEW.anio != OLD.anio THEN
    SET msg = 'No está permitido modificar empleado_id, quincena_no, mes o anio de un registro existente.';
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
  END IF;
  IF NEW.salario_neto < 0 THEN
    SET msg = CONCAT('El salario neto no puede ser negativo: ', NEW.salario_neto);
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historial_salarios`
--

CREATE TABLE `historial_salarios` (
  `id_historial` int(11) NOT NULL,
  `empleado_id` int(11) DEFAULT NULL,
  `fecha` date NOT NULL,
  `monto_neto` decimal(10,2) DEFAULT NULL,
  `observaciones` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `historial_salarios`
--

INSERT INTO `historial_salarios` (`id_historial`, `empleado_id`, `fecha`, `monto_neto`, `observaciones`) VALUES
(1, 46, '2026-06-13', 376.00, 'Ajuste salarial por Cambio de Cargo. Cargo anterior: Jefe de Division General. Cargo nuevo: Director de Línea.'),
(2, 68, '2026-06-18', 246.00, 'Salario inicial asignado por ingreso a la institución. Cargo: Analista de Personal.');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `jubilados`
--

CREATE TABLE `jubilados` (
  `jubilado_id` int(11) NOT NULL,
  `empleado_id` int(11) NOT NULL,
  `porcentaje_jubilacion` decimal(5,2) NOT NULL,
  `porcentaje_antiguedad` decimal(5,2) DEFAULT 0.00,
  `fecha_efectiva` date NOT NULL,
  `observacion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `jubilados`
--

INSERT INTO `jubilados` (`jubilado_id`, `empleado_id`, `porcentaje_jubilacion`, `porcentaje_antiguedad`, `fecha_efectiva`, `observacion`) VALUES
(9, 56, 75.00, 0.00, '2019-01-01', NULL),
(10, 57, 80.00, 0.00, '2026-05-13', NULL);

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
(99, 'Contralor del Estado', 409.00, 21),
(100, 'Director General', 376.00, 22),
(101, 'Jefe de División', 348.00, 24),
(102, 'I', 246.00, 26),
(103, 'II', 248.00, 26),
(104, 'III', 250.00, 26),
(105, 'IV', 252.00, 26),
(106, 'V', 254.00, 26),
(107, 'VI', 256.00, 26),
(108, 'VII', 257.00, 26),
(109, 'I', 276.00, 27),
(110, 'II', 277.00, 27),
(111, 'III', 279.00, 27),
(112, 'IV', 281.00, 27),
(113, 'V', 283.00, 27),
(114, 'VI', 285.00, 27),
(115, 'VII', 287.00, 27),
(116, 'I', 305.00, 28),
(117, 'II', 307.00, 28),
(118, 'III', 308.00, 28),
(119, 'IV', 310.00, 28),
(120, 'V', 312.00, 28),
(121, 'VI', 314.00, 28),
(122, 'VII', 316.00, 28),
(123, 'I', 192.00, 33),
(124, 'II', 194.00, 33),
(125, 'III', 196.00, 33),
(126, 'IV', 197.00, 33),
(127, 'V', 199.00, 33),
(128, 'VI', 201.00, 33),
(129, 'VII', 203.00, 33),
(130, 'I', 217.00, 34),
(131, 'II', 219.00, 34),
(132, 'III', 221.00, 34),
(133, 'IV', 223.00, 34),
(134, 'V', 225.00, 34),
(135, 'VI', 226.00, 34),
(136, 'VII', 228.00, 34),
(137, 'I', 130.00, 40),
(138, 'II', 132.00, 40),
(139, 'III', 134.00, 40),
(140, 'IV', 135.00, 40),
(141, 'V', 137.00, 40),
(142, 'VI', 139.00, 40),
(143, 'VII', 141.00, 40),
(144, 'I', 148.00, 41),
(145, 'II', 150.00, 41),
(146, 'III', 152.00, 41),
(147, 'IV', 154.00, 41),
(148, 'V', 155.00, 41),
(149, 'VI', 157.00, 41),
(150, 'VII', 159.00, 41),
(151, 'I', 166.00, 42),
(152, 'II', 168.00, 42),
(153, 'III', 170.00, 42),
(154, 'IV', 172.00, 42),
(155, 'V', 174.00, 42),
(156, 'VI', 176.00, 42),
(157, 'VII', 177.00, 42),
(158, 'Director de Linea', 376.00, 23),
(159, 'Jefe de División General', 363.00, 25),
(160, 'I', 130.00, 43),
(161, 'I', 140.00, 44),
(162, 'I', 152.00, 45),
(163, 'I', 161.00, 46),
(164, 'I', 142.00, 58),
(165, 'I', 149.00, 59),
(166, 'I', 132.00, 57),
(167, 'I', 159.00, 60);

--
-- Disparadores `niveles_salariales`
--
DELIMITER $$
CREATE TRIGGER `after_insert_nivel` AFTER INSERT ON `niveles_salariales` FOR EACH ROW BEGIN
        IF NOT EXISTS (SELECT 1 FROM niveles_salariales_antiguos WHERE nombre = NEW.nombre AND cargo_onapre_id = NEW.cargo_onapre_id) THEN
          INSERT INTO niveles_salariales_antiguos (nombre, cargo_onapre_id, salario_antiguo)
          VALUES (NEW.nombre, NEW.cargo_onapre_id, 0);
        END IF;
      END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_update_nivel` AFTER UPDATE ON `niveles_salariales` FOR EACH ROW BEGIN
   IF @disable_sync_triggers IS NULL OR @disable_sync_triggers = 0 THEN

      IF OLD.nombre <> NEW.nombre 
         OR OLD.cargo_onapre_id <> NEW.cargo_onapre_id
         OR OLD.salario_base <> NEW.salario_base THEN

         SET @disable_sync_triggers = 1;

         UPDATE niveles_salariales_antiguos
         SET
             nombre = NEW.nombre,
             cargo_onapre_id = NEW.cargo_onapre_id
         WHERE nombre = OLD.nombre
         AND cargo_onapre_id = OLD.cargo_onapre_id;

         SET @disable_sync_triggers = 0;

      END IF;

   END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `before_insert_niveles_salariales_minimo` BEFORE INSERT ON `niveles_salariales` FOR EACH ROW BEGIN
              IF NEW.salario_base < 130.00 THEN
                  SET NEW.salario_base = 130.00;
              END IF;
          END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `before_update_niveles_salariales_minimo` BEFORE UPDATE ON `niveles_salariales` FOR EACH ROW BEGIN
              IF NEW.salario_base < 130.00 THEN
                  SET NEW.salario_base = 130.00;
              END IF;
          END
$$
DELIMITER ;

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

--
-- Volcado de datos para la tabla `niveles_salariales_antiguos`
--

INSERT INTO `niveles_salariales_antiguos` (`nivel_salarial_antiguo_id`, `nombre`, `salario_antiguo`, `cargo_onapre_id`) VALUES
(106, 'Contralor del Estado', 28.48, 21),
(107, 'Director General', 27.08, 22),
(108, 'Jefe de División', 23.80, 24),
(109, 'I', 15.96, 26),
(110, 'II', 16.10, 26),
(111, 'III', 16.24, 26),
(112, 'IV', 16.38, 26),
(113, 'V', 16.52, 26),
(114, 'VI', 16.80, 26),
(115, 'VII', 16.80, 26),
(116, 'I', 18.20, 27),
(117, 'II', 18.34, 27),
(118, 'III', 18.34, 27),
(119, 'IV', 18.62, 27),
(120, 'V', 18.76, 27),
(121, 'VI', 18.90, 27),
(122, 'VII', 19.04, 27),
(123, 'I', 20.40, 28),
(124, 'II', 20.58, 28),
(125, 'III', 20.70, 28),
(126, 'IV', 20.86, 28),
(127, 'V', 21.00, 28),
(128, 'VI', 21.14, 28),
(129, 'VII', 21.28, 28),
(130, 'I', 11.76, 33),
(131, 'II', 11.90, 33),
(132, 'III', 12.18, 33),
(133, 'IV', 12.18, 33),
(134, 'V', 12.32, 33),
(135, 'VI', 12.46, 33),
(136, 'VII', 12.60, 33),
(137, 'I', 13.72, 34),
(138, 'II', 13.86, 34),
(139, 'III', 7.42, 34),
(140, 'IV', 14.14, 34),
(141, 'V', 14.28, 34),
(142, 'VI', 14.42, 34),
(143, 'VII', 14.56, 34),
(144, 'I', 7.00, 40),
(145, 'II', 7.14, 40),
(146, 'III', 7.28, 40),
(147, 'IV', 7.42, 40),
(148, 'V', 7.56, 40),
(149, 'VI', 7.70, 40),
(150, 'VII', 7.84, 40),
(151, 'I', 8.40, 41),
(152, 'II', 8.54, 41),
(153, 'III', 8.54, 41),
(154, 'IV', 8.82, 41),
(155, 'V', 8.96, 41),
(156, 'VI', 9.10, 41),
(157, 'VII', 9.24, 41),
(158, 'I', 9.80, 42),
(159, 'II', 9.94, 42),
(160, 'III', 10.08, 42),
(161, 'IV', 10.22, 42),
(162, 'V', 10.36, 42),
(163, 'VI', 10.50, 42),
(164, 'VII', 10.64, 42),
(165, 'Director de Linea', 25.90, 23),
(166, 'Jefe de División General', 24.92, 25),
(167, 'I', 7.00, 43),
(168, 'I', 7.74, 44),
(169, 'I', 8.67, 45),
(170, 'I', 9.24, 46),
(171, 'I', 7.92, 58),
(172, 'I', 8.84, 59),
(173, 'I', 7.18, 57),
(174, 'I', 9.23, 60);

--
-- Disparadores `niveles_salariales_antiguos`
--
DELIMITER $$
CREATE TRIGGER `after_insert_nivel_antiguo` AFTER INSERT ON `niveles_salariales_antiguos` FOR EACH ROW BEGIN
        IF NOT EXISTS (SELECT 1 FROM niveles_salariales WHERE nombre = NEW.nombre AND cargo_onapre_id = NEW.cargo_onapre_id) THEN
          INSERT INTO niveles_salariales (nombre, cargo_onapre_id, salario_base)
          VALUES (NEW.nombre, NEW.cargo_onapre_id, 0);
        END IF;
      END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_update_nivel_antiguo` AFTER UPDATE ON `niveles_salariales_antiguos` FOR EACH ROW BEGIN
   IF @disable_sync_triggers IS NULL OR @disable_sync_triggers = 0 THEN

      IF OLD.nombre <> NEW.nombre 
         OR OLD.cargo_onapre_id <> NEW.cargo_onapre_id
         OR OLD.salario_antiguo <> NEW.salario_antiguo THEN

         SET @disable_sync_triggers = 1;

         UPDATE niveles_salariales
         SET
             nombre = NEW.nombre,
             cargo_onapre_id = NEW.cargo_onapre_id
         WHERE nombre = OLD.nombre
         AND cargo_onapre_id = OLD.cargo_onapre_id;

         SET @disable_sync_triggers = 0;

      END IF;

   END IF;
END
$$
DELIMITER ;

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
  `parentesco` varchar(20) DEFAULT NULL,
  `ci` varchar(8) DEFAULT NULL,
  `direccion` text DEFAULT NULL,
  `celular` int(12) DEFAULT NULL,
  `cuenta_bancaria` varchar(20) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `cedula` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `nucleo_familiar`
--

INSERT INTO `nucleo_familiar` (`familiar_id`, `nombres`, `apellidos`, `fecha_nacimiento`, `estatus`, `parentesco`, `ci`, `direccion`, `celular`, `cuenta_bancaria`, `telefono`, `cedula`) VALUES
(9, 'Andres ', 'Higuera', '2007-09-09', 0, 'hijo', NULL, NULL, NULL, '', NULL, NULL),
(10, 'Luis Antonio', 'Higuera', '2009-09-09', 1, 'hijo', NULL, NULL, NULL, '', NULL, NULL),
(11, 'Angel', 'Villamil', '1990-08-09', 1, 'hijo', NULL, 'cpasic', NULL, '00000000000000000000', '04161373897', '9087666'),
(12, 'Andres Eloy', 'Arias', '2010-08-09', 1, 'hijo', NULL, NULL, NULL, '', NULL, NULL),
(13, 'Marco Aurelio', 'Mora Baez', '1999-09-09', 1, 'hijo', NULL, 'Municipio Libertador, Calle 2, Casa n3', NULL, '00000000000000000000', '0412345986', '19800178'),
(14, 'Jose Willian', 'Armas Zambrano', '1999-02-09', 1, 'hijo', NULL, 'Municipio Libertador, Calle 2, Casa n3', NULL, '12345678901234567899', '0412345986', '120987654'),
(15, 'Luis', 'Avendaño', '2019-08-09', 1, 'hijo', NULL, NULL, NULL, '', NULL, NULL),
(17, 'Lewis', 'Perez Roa', '2003-06-30', 1, 'conyuge', NULL, 'Municipio Libertador, Calle 2, Casa n3', NULL, '12345678901234567899', '04161373897', '19807345'),
(18, 'Alberto Jesus', 'Bolaños', '2003-09-01', 0, 'hijo', NULL, NULL, NULL, '', NULL, NULL),
(19, 'Alber', 'Bolaños', '2012-09-01', 1, 'hijo', NULL, NULL, NULL, '', NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pensionado`
--

CREATE TABLE `pensionado` (
  `id_pensionado` int(11) NOT NULL,
  `fecha_ingreso` date DEFAULT NULL,
  `observacion` text DEFAULT NULL,
  `empleado_id` int(11) DEFAULT NULL,
  `motivo_pension` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pensionado`
--

INSERT INTO `pensionado` (`id_pensionado`, `fecha_ingreso`, `observacion`, `empleado_id`, `motivo_pension`) VALUES
(5, '2007-05-15', NULL, 58, 'se cayo'),
(6, '2005-01-01', NULL, 59, 'Exceso de chamba'),
(7, '2026-06-18', '', 49, NULL);

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
-- Estructura de tabla para la tabla `porcentajes_jerarquias`
--

CREATE TABLE `porcentajes_jerarquias` (
  `jerarquia_id` int(11) NOT NULL,
  `cargo` varchar(150) NOT NULL,
  `porcentaje` decimal(5,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `porcentajes_jerarquias`
--

INSERT INTO `porcentajes_jerarquias` (`jerarquia_id`, `cargo`, `porcentaje`) VALUES
(1, 'Contralor del Estado', 95.00),
(2, 'Director(a) General', 93.00),
(3, 'Director de Línea', 90.00),
(4, 'Jefe de División General', 85.00),
(5, 'Jefe de División', 80.00),
(6, 'Coordinador', 80.00),
(7, 'Supervisor', 80.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `primas_generales`
--

CREATE TABLE `primas_generales` (
  `prima_id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `asignacion` decimal(5,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `primas_generales`
--

INSERT INTO `primas_generales` (`prima_id`, `nombre`, `asignacion`) VALUES
(1, 'Prima hogares', 40.00),
(3, 'Prima Transporte', 48.00),
(5, 'Prima hogares', 40.00),
(6, 'Complemento de alimentación', 5.00),
(7, 'Prima por hijos', 12.50),
(9, 'Prima de mejoramiento económico', 0.00);

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
(1, 'Especialización', 30.00, 40.00),
(2, 'Maestría', 35.00, 40.00),
(3, 'T.S.U', 20.00, 20.00),
(4, 'Profesional', 25.00, 30.00),
(5, 'Doctorado', 40.00, 60.00);

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
(2, 'Licenciado en Administración'),
(3, 'Licenciado en Contaduria'),
(4, 'Licenciado en Economía'),
(5, 'Licenciado en Recursos Humanos'),
(6, 'Licenciado en Finanzas'),
(7, 'Licenciado en Comercio Internacional'),
(8, 'Licenciado en Administración de Empresas'),
(9, 'Ingeniero Industrial'),
(10, 'Ingeniero Comercial'),
(11, 'Técnico Superior en Administración'),
(12, 'Técnico Superior en Contabilidad'),
(13, 'Técnico Superior en Recursos Humanos'),
(14, 'Administrador Público'),
(15, 'Licenciado en Gestión Empresarial'),
(16, 'Licenciado en Mercadeo'),
(17, 'Licenciado en Banca y Finanzas'),
(18, 'Licenciado en Gerencia'),
(19, 'Analista Administrativo'),
(20, 'Asistente Administrativo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `registros_antiguedades`
--

CREATE TABLE `registros_antiguedades` (
  `antiguedad_id` int(11) NOT NULL,
  `empleado_id` int(11) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `id_institucion` int(11) DEFAULT NULL,
  `institucion_alternativa` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `registros_antiguedades`
--

INSERT INTO `registros_antiguedades` (`antiguedad_id`, `empleado_id`, `fecha_inicio`, `fecha_fin`, `id_institucion`, `institucion_alternativa`) VALUES
(8, 51, '2024-07-01', '2025-07-01', NULL, NULL),
(9, 45, '2012-08-01', '2014-12-30', NULL, NULL),
(10, 66, '2001-09-03', '2001-10-02', NULL, NULL),
(11, 66, '2001-10-03', '2001-11-02', NULL, NULL),
(12, 66, '2001-11-05', '2001-12-04', NULL, NULL),
(13, 66, '2001-12-05', '2001-12-31', NULL, NULL),
(14, 66, '2002-01-07', '2002-02-28', NULL, NULL),
(15, 66, '2002-03-01', '2002-03-31', NULL, NULL),
(16, 66, '2002-04-01', '2002-12-31', NULL, NULL),
(22, 46, '2020-08-09', '2021-09-09', 24, NULL),
(23, 46, '2019-08-09', '2019-09-09', 132, NULL),
(29, 49, '1999-09-09', '2008-03-02', 53, NULL);

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

--
-- Volcado de datos para la tabla `relacion_cargos`
--

INSERT INTO `relacion_cargos` (`relacion_cargo_id`, `empleado_id`, `cargo_cet_id`, `fecha_inicio_actual`, `fecha_inicio_anterior`, `descripcion`, `nombre_departamento`) VALUES
(3, 45, 48, '2026-05-08', NULL, 'Asignación de cargo', 'Unidad de Soporte Técnico'),
(4, 46, 69, '2026-05-08', NULL, 'Asignación de cargo', 'Dirección de Planificación, Organización y Métodos'),
(6, 49, 40, '2026-05-12', NULL, 'Asignación de cargo', 'Despacho del Contralor'),
(7, 50, 69, '2026-05-12', NULL, 'Asignación de cargo', 'Despacho del Contralor'),
(8, 51, 73, '2026-05-12', NULL, 'Asignación de cargo', 'Unidad de Archivo'),
(9, 54, 76, '2026-05-12', NULL, 'Asignación de cargo', 'Unidad de Mantenimiento y Limpieza'),
(10, 55, 76, '2026-05-12', NULL, 'Asignación de cargo', 'Unidad de Mantenimiento y Limpieza'),
(11, 56, 80, '2026-05-12', NULL, 'Asignación de cargo', NULL),
(12, 57, 73, '2026-05-13', NULL, 'Asignación de cargo', NULL),
(13, 58, 85, '2026-05-13', NULL, 'Asignación de cargo', NULL),
(14, 59, 44, '2026-05-13', NULL, 'Asignación de cargo', NULL),
(15, 61, 60, '2026-05-13', NULL, 'Asignación de cargo', 'División General de Recursos Humanos'),
(16, 65, NULL, '2026-05-13', NULL, 'Asignación de cargo', NULL),
(17, 66, 76, '2026-05-13', NULL, 'Asignación de cargo', 'Unidad de Mantenimiento y Limpieza'),
(18, 46, 41, '2026-05-22', '2026-05-08', 'Cambio de cargo', 'Dirección de Planificación, Organización y Métodos'),
(19, 46, 43, '2026-05-25', '2026-05-22', 'Cambio de cargo', 'Dirección de Planificación, Organización y Métodos'),
(20, 51, 48, '2026-05-26', '2026-05-12', 'Cambio de cargo', 'Unidad de Archivo'),
(21, 67, 41, '2026-06-09', NULL, 'Asignación de cargo', 'Dirección de Servicios Generales, Seguridad y Transporte '),
(22, 46, 80, '2026-06-13', '2026-05-25', 'Cambio de cargo', 'Dirección de Planificación, Organización y Métodos'),
(23, 68, 51, '2026-06-18', NULL, 'Asignación de cargo', 'División de Remuneraciones');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `retroactivos`
--

CREATE TABLE `retroactivos` (
  `retroactivo_id` int(11) NOT NULL,
  `empleado_id` int(11) DEFAULT NULL,
  `cargo_cet_id` int(11) DEFAULT NULL,
  `cargo_onapre_anterior_id` int(11) DEFAULT NULL,
  `nivel_salarial_anterior_id` int(11) DEFAULT NULL,
  `cargo_onapre_id` int(11) DEFAULT NULL,
  `nivel_salarial_id` int(11) DEFAULT NULL,
  `nivel_salarial_antiguo_id` int(11) DEFAULT NULL,
  `direccion_id` int(11) DEFAULT NULL,
  `division_id` int(11) DEFAULT NULL,
  `unidad_id` int(11) DEFAULT NULL,
  `dias_diferencia` int(11) NOT NULL DEFAULT 0,
  `delta_sueldo` decimal(14,2) NOT NULL DEFAULT 0.00,
  `delta_antiguedad` decimal(14,2) NOT NULL DEFAULT 0.00,
  `delta_profesionalizacion` decimal(14,2) NOT NULL DEFAULT 0.00,
  `delta_jerarquia` decimal(14,2) NOT NULL DEFAULT 0.00,
  `monto_retroactivo` decimal(14,2) NOT NULL DEFAULT 0.00,
  `estado` enum('PENDIENTE','PAGADO') NOT NULL DEFAULT 'PENDIENTE',
  `periodo_pago_mes` int(11) DEFAULT NULL,
  `periodo_pago_anio` int(11) DEFAULT NULL,
  `periodo_pago_quincena` varchar(20) DEFAULT NULL,
  `fecha_pago` datetime DEFAULT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_corte` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `estatus` varchar(20) DEFAULT NULL,
  `observacion` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `retroactivos`
--

INSERT INTO `retroactivos` (`retroactivo_id`, `empleado_id`, `cargo_cet_id`, `cargo_onapre_anterior_id`, `nivel_salarial_anterior_id`, `cargo_onapre_id`, `nivel_salarial_id`, `nivel_salarial_antiguo_id`, `direccion_id`, `division_id`, `unidad_id`, `dias_diferencia`, `delta_sueldo`, `delta_antiguedad`, `delta_profesionalizacion`, `delta_jerarquia`, `monto_retroactivo`, `estado`, `periodo_pago_mes`, `periodo_pago_anio`, `periodo_pago_quincena`, `fecha_pago`, `fecha_inicio`, `fecha_corte`, `fecha_fin`, `estatus`, `observacion`, `created_at`, `updated_at`) VALUES
(7, 46, 80, NULL, NULL, 23, 158, NULL, 11, NULL, NULL, 5, 6.50, 0.32, 1.63, 1.06, 3.17, 'PAGADO', 6, 2026, '2', '2026-05-26 09:08:44', '2026-05-26', '2026-05-30', NULL, NULL, 'kjhnddddddddddd\n', '2026-05-26 13:08:24', '2026-05-26 13:08:44'),
(8, 51, 48, 40, 137, 26, 137, NULL, 3, 4, 5, 4, 0.00, 0.00, 0.00, 0.00, 0.00, 'PENDIENTE', NULL, NULL, NULL, NULL, '2026-05-26', '2026-05-30', NULL, NULL, 'Creado automáticamente por cambio de cargo/nivel', '2026-05-26 13:29:25', '2026-05-26 13:29:25'),
(9, 46, 80, 25, 159, 23, 158, NULL, 11, NULL, NULL, 17, 0.00, 0.00, 0.00, 0.00, 0.00, 'PENDIENTE', NULL, NULL, NULL, NULL, '2026-06-13', '2026-06-30', NULL, NULL, 'Creado automáticamente por cambio de cargo/nivel', '2026-06-13 22:34:27', '2026-06-13 22:34:27');

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
(5, 'Administrador'),
(6, 'Director General'),
(7, 'Director de Linea');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sobreviviente`
--

CREATE TABLE `sobreviviente` (
  `id_sobreviviente` int(11) NOT NULL,
  `empleado_id` int(11) DEFAULT NULL,
  `familiar_id` int(11) DEFAULT NULL,
  `fecha_ingreso` date DEFAULT NULL,
  `status` tinyint(4) DEFAULT 0,
  `observacion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `sobreviviente`
--

INSERT INTO `sobreviviente` (`id_sobreviviente`, `empleado_id`, `familiar_id`, `fecha_ingreso`, `status`, `observacion`) VALUES
(13, 50, 12, NULL, 0, NULL),
(14, 61, 13, '2009-08-18', 1, NULL),
(15, 65, 14, '2025-08-15', 1, NULL),
(16, 49, 15, NULL, 0, NULL),
(18, 50, 17, '2026-05-19', 1, 'Bajo resolucion 334\n'),
(19, 46, 18, NULL, 0, NULL),
(20, 46, 19, NULL, 0, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `status_vacaciones`
--

CREATE TABLE `status_vacaciones` (
  `id_status_vacaciones` int(11) NOT NULL,
  `descripcion` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `status_vacaciones`
--

INSERT INTO `status_vacaciones` (`id_status_vacaciones`, `descripcion`) VALUES
(1, 'Programado'),
(2, 'De Disfrute'),
(3, 'Finalizado'),
(4, 'Reintegro'),
(5, 'En espera');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sueldos_pensionados`
--

CREATE TABLE `sueldos_pensionados` (
  `sueldo_pensionado_id` int(11) NOT NULL,
  `salario_base` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `sueldos_pensionados`
--

INSERT INTO `sueldos_pensionados` (`sueldo_pensionado_id`, `salario_base`) VALUES
(1, 130.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sueldo_sobreviente`
--

CREATE TABLE `sueldo_sobreviente` (
  `id_sueldo` int(11) NOT NULL,
  `sueldo_base` decimal(10,2) DEFAULT NULL,
  `sueldo_base_anterior` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `sueldo_sobreviente`
--

INSERT INTO `sueldo_sobreviente` (`id_sueldo`, `sueldo_base`, `sueldo_base_anterior`) VALUES
(1, 130.00, 7.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `unidades`
--

CREATE TABLE `unidades` (
  `unidad_id` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `direccion_id` int(11) DEFAULT NULL,
  `division_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `unidades`
--

INSERT INTO `unidades` (`unidad_id`, `nombre`, `direccion_id`, `division_id`) VALUES
(2, 'Unidad de Nómina', NULL, 2),
(3, 'Unidad de Imagen Corporativa y Eventos Especiales', 5, NULL),
(5, 'Unidad de Archivo', 3, 4),
(6, 'Unidad de Planificación', 11, 7),
(7, 'Unidad de Organización', 11, 7),
(8, 'Unidad de Servicios Administrativos', 12, 12),
(9, 'Unidad de Control Presupuestario', 12, 12),
(10, 'Unidad de Compras', 12, 13),
(11, 'Unidad de Bienes, Inventarios y Almacén', 12, 13),
(12, 'Unidad de Participación Ciudadana y Capacitación', 15, NULL),
(13, 'Unidad de Atención al Publico', 15, 20),
(14, 'Unidad de Servicios Generales', 10, NULL),
(15, 'Unidad de Seguridad', 10, NULL),
(16, 'Unidad de Transporte', 10, NULL),
(17, 'Unidad de Mantenimiento y Limpieza', 14, NULL),
(18, 'Unidad de Soporte Técnico', 3, 4),
(19, 'Sección de Control Posterior', 16, 19);

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
(1, 'amvar', '$2b$12$SnnQFedf42t8Wzcer.c7qORVul2OuZDmN2kVdxjtM17Es1T0EzD8m', 'Angela', 'Villamizar', 5, 1, '29907321'),
(2, 'vis_1', '$2b$12$zljSb9vyTBCj7FC4F.L6iumxpRzFE26MV631rZ8RvkNAW6ci8hmSW', 'Maria', 'Lopez', 1, 2, '29907321'),
(3, 'vis?2', '$2b$12$WsxKSIqMrLwqLEhdKc9gTO6eN5B/PkN9BtguhqtDZKM66CuJab6Vy', 'Maria', 'Lopez', 1, 1, '299073213');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `vacaciones`
--

CREATE TABLE `vacaciones` (
  `id_empleado` int(11) DEFAULT NULL,
  `id_vacaciones` int(11) NOT NULL,
  `id_status_vacaciones` int(11) DEFAULT NULL,
  `dias_acumulados` int(11) DEFAULT NULL,
  `fecha_tope` date DEFAULT NULL,
  `pagado` tinyint(1) NOT NULL DEFAULT 0,
  `antiguedad_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `vacaciones`
--

INSERT INTO `vacaciones` (`id_empleado`, `id_vacaciones`, `id_status_vacaciones`, `dias_acumulados`, `fecha_tope`, `pagado`, `antiguedad_id`) VALUES
(67, 36, 4, 0, '2026-07-09', 0, NULL);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `caja_ahorro`
--
ALTER TABLE `caja_ahorro`
  ADD PRIMARY KEY (`id_caja`),
  ADD UNIQUE KEY `uk_caja_empleado_periodo` (`empleado_id`,`quincena_no`,`mes`,`anio`);

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
-- Indices de la tabla `catalogo_instituciones`
--
ALTER TABLE `catalogo_instituciones`
  ADD PRIMARY KEY (`id_institucion`),
  ADD KEY `idx_busqueda` (`nombre`,`siglas`);

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
-- Indices de la tabla `configuracion_vacaciones`
--
ALTER TABLE `configuracion_vacaciones`
  ADD PRIMARY KEY (`id_configuracion`);

--
-- Indices de la tabla `configuracion_vacaciones_obreros`
--
ALTER TABLE `configuracion_vacaciones_obreros`
  ADD PRIMARY KEY (`id_configuracion`);

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
-- Indices de la tabla `dias_festivos`
--
ALTER TABLE `dias_festivos`
  ADD PRIMARY KEY (`id_festivo`);

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
-- Indices de la tabla `fechas_vacaciones`
--
ALTER TABLE `fechas_vacaciones`
  ADD PRIMARY KEY (`id_fecha`),
  ADD KEY `fk_fechas_vacaciones_status` (`id_status_vacaciones`);

--
-- Indices de la tabla `firmantes_recibo`
--
ALTER TABLE `firmantes_recibo`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cargo_clave` (`cargo_clave`);

--
-- Indices de la tabla `historial_pagos`
--
ALTER TABLE `historial_pagos`
  ADD PRIMARY KEY (`id_historial`),
  ADD UNIQUE KEY `uk_empleado_periodo` (`empleado_id`,`quincena_no`,`mes`,`anio`);

--
-- Indices de la tabla `historial_salarios`
--
ALTER TABLE `historial_salarios`
  ADD PRIMARY KEY (`id_historial`),
  ADD KEY `empleado_id` (`empleado_id`);

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
-- Indices de la tabla `pensionado`
--
ALTER TABLE `pensionado`
  ADD PRIMARY KEY (`id_pensionado`),
  ADD KEY `empleado_id` (`empleado_id`);

--
-- Indices de la tabla `permisos_remunerados`
--
ALTER TABLE `permisos_remunerados`
  ADD PRIMARY KEY (`permiso_id`),
  ADD KEY `fk_permiso_empleado` (`empleado_id`);

--
-- Indices de la tabla `porcentajes_jerarquias`
--
ALTER TABLE `porcentajes_jerarquias`
  ADD PRIMARY KEY (`jerarquia_id`),
  ADD UNIQUE KEY `cargo` (`cargo`);

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
  ADD KEY `fk_antiguedad_empleado` (`empleado_id`),
  ADD KEY `id_institucion_fk` (`id_institucion`);

--
-- Indices de la tabla `relacion_cargos`
--
ALTER TABLE `relacion_cargos`
  ADD PRIMARY KEY (`relacion_cargo_id`),
  ADD KEY `fk_empleado_id` (`empleado_id`),
  ADD KEY `fk_cargo_cet_id` (`cargo_cet_id`);

--
-- Indices de la tabla `retroactivos`
--
ALTER TABLE `retroactivos`
  ADD PRIMARY KEY (`retroactivo_id`),
  ADD KEY `fk_retro_empleado` (`empleado_id`),
  ADD KEY `fk_retro_cargo_cet` (`cargo_cet_id`),
  ADD KEY `fk_retro_cargo_onapre` (`cargo_onapre_id`),
  ADD KEY `fk_retro_nivel` (`nivel_salarial_id`),
  ADD KEY `fk_retro_nivel_antiguo` (`nivel_salarial_antiguo_id`),
  ADD KEY `fk_retro_direccion` (`direccion_id`),
  ADD KEY `fk_retro_division` (`division_id`),
  ADD KEY `fk_retro_unidad` (`unidad_id`);

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
-- Indices de la tabla `status_vacaciones`
--
ALTER TABLE `status_vacaciones`
  ADD PRIMARY KEY (`id_status_vacaciones`);

--
-- Indices de la tabla `sueldos_pensionados`
--
ALTER TABLE `sueldos_pensionados`
  ADD PRIMARY KEY (`sueldo_pensionado_id`);

--
-- Indices de la tabla `sueldo_sobreviente`
--
ALTER TABLE `sueldo_sobreviente`
  ADD PRIMARY KEY (`id_sueldo`);

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
-- Indices de la tabla `vacaciones`
--
ALTER TABLE `vacaciones`
  ADD PRIMARY KEY (`id_vacaciones`),
  ADD KEY `antiguedad_id` (`antiguedad_id`),
  ADD KEY `fk_vacaciones_status` (`id_status_vacaciones`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `caja_ahorro`
--
ALTER TABLE `caja_ahorro`
  MODIFY `id_caja` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=88;

--
-- AUTO_INCREMENT de la tabla `cargos_cet`
--
ALTER TABLE `cargos_cet`
  MODIFY `cargo_cet_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=95;

--
-- AUTO_INCREMENT de la tabla `cargos_onapre`
--
ALTER TABLE `cargos_onapre`
  MODIFY `cargo_onapre_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT de la tabla `catalogo_instituciones`
--
ALTER TABLE `catalogo_instituciones`
  MODIFY `id_institucion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=195;

--
-- AUTO_INCREMENT de la tabla `condiciones_laborales`
--
ALTER TABLE `condiciones_laborales`
  MODIFY `condicion_laboral_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `configuracion_antiguedad`
--
ALTER TABLE `configuracion_antiguedad`
  MODIFY `antiguedad_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT de la tabla `configuracion_vacaciones`
--
ALTER TABLE `configuracion_vacaciones`
  MODIFY `id_configuracion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `configuracion_vacaciones_obreros`
--
ALTER TABLE `configuracion_vacaciones_obreros`
  MODIFY `id_configuracion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `deducciones`
--
ALTER TABLE `deducciones`
  MODIFY `deduccion_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `dias_festivos`
--
ALTER TABLE `dias_festivos`
  MODIFY `id_festivo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT de la tabla `direcciones`
--
ALTER TABLE `direcciones`
  MODIFY `direccion_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Identificador único de la Dirección', AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT de la tabla `divisiones`
--
ALTER TABLE `divisiones`
  MODIFY `division_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de la tabla `empleados`
--
ALTER TABLE `empleados`
  MODIFY `empleado_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=69;

--
-- AUTO_INCREMENT de la tabla `encargos_temporales`
--
ALTER TABLE `encargos_temporales`
  MODIFY `encargo_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `estatus_funcionarios`
--
ALTER TABLE `estatus_funcionarios`
  MODIFY `estatus_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `fechas_vacaciones`
--
ALTER TABLE `fechas_vacaciones`
  MODIFY `id_fecha` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT de la tabla `firmantes_recibo`
--
ALTER TABLE `firmantes_recibo`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `historial_pagos`
--
ALTER TABLE `historial_pagos`
  MODIFY `id_historial` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=155;

--
-- AUTO_INCREMENT de la tabla `historial_salarios`
--
ALTER TABLE `historial_salarios`
  MODIFY `id_historial` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `jubilados`
--
ALTER TABLE `jubilados`
  MODIFY `jubilado_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `modulos_acceso`
--
ALTER TABLE `modulos_acceso`
  MODIFY `modulo_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `niveles_salariales`
--
ALTER TABLE `niveles_salariales`
  MODIFY `nivel_salarial_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=168;

--
-- AUTO_INCREMENT de la tabla `niveles_salariales_antiguos`
--
ALTER TABLE `niveles_salariales_antiguos`
  MODIFY `nivel_salarial_antiguo_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=175;

--
-- AUTO_INCREMENT de la tabla `nucleo_familiar`
--
ALTER TABLE `nucleo_familiar`
  MODIFY `familiar_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de la tabla `pensionado`
--
ALTER TABLE `pensionado`
  MODIFY `id_pensionado` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `permisos_remunerados`
--
ALTER TABLE `permisos_remunerados`
  MODIFY `permiso_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `porcentajes_jerarquias`
--
ALTER TABLE `porcentajes_jerarquias`
  MODIFY `jerarquia_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `primas_generales`
--
ALTER TABLE `primas_generales`
  MODIFY `prima_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `primas_profesionalizacion`
--
ALTER TABLE `primas_profesionalizacion`
  MODIFY `prima_profesional_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `profesiones`
--
ALTER TABLE `profesiones`
  MODIFY `profesion_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de la tabla `registros_antiguedades`
--
ALTER TABLE `registros_antiguedades`
  MODIFY `antiguedad_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT de la tabla `relacion_cargos`
--
ALTER TABLE `relacion_cargos`
  MODIFY `relacion_cargo_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT de la tabla `retroactivos`
--
ALTER TABLE `retroactivos`
  MODIFY `retroactivo_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `roles_sistema`
--
ALTER TABLE `roles_sistema`
  MODIFY `rol_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `sobreviviente`
--
ALTER TABLE `sobreviviente`
  MODIFY `id_sobreviviente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de la tabla `status_vacaciones`
--
ALTER TABLE `status_vacaciones`
  MODIFY `id_status_vacaciones` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `sueldos_pensionados`
--
ALTER TABLE `sueldos_pensionados`
  MODIFY `sueldo_pensionado_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `sueldo_sobreviente`
--
ALTER TABLE `sueldo_sobreviente`
  MODIFY `id_sueldo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `unidades`
--
ALTER TABLE `unidades`
  MODIFY `unidad_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `usuario_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `vacaciones`
--
ALTER TABLE `vacaciones`
  MODIFY `id_vacaciones` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `caja_ahorro`
--
ALTER TABLE `caja_ahorro`
  ADD CONSTRAINT `fk_caja_empleado` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`empleado_id`) ON DELETE CASCADE;

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
-- Filtros para la tabla `fechas_vacaciones`
--
ALTER TABLE `fechas_vacaciones`
  ADD CONSTRAINT `fk_fechas_vacaciones_status` FOREIGN KEY (`id_status_vacaciones`) REFERENCES `status_vacaciones` (`id_status_vacaciones`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `historial_pagos`
--
ALTER TABLE `historial_pagos`
  ADD CONSTRAINT `fk_historial_empleado` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`empleado_id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `historial_salarios`
--
ALTER TABLE `historial_salarios`
  ADD CONSTRAINT `historial_salarios_ibfk_1` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`empleado_id`);

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
-- Filtros para la tabla `pensionado`
--
ALTER TABLE `pensionado`
  ADD CONSTRAINT `pensionado_ibfk_1` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`empleado_id`);

--
-- Filtros para la tabla `permisos_remunerados`
--
ALTER TABLE `permisos_remunerados`
  ADD CONSTRAINT `fk_permiso_empleado` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`empleado_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `registros_antiguedades`
--
ALTER TABLE `registros_antiguedades`
  ADD CONSTRAINT `fk_antiguedad_empleado` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`empleado_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `id_institucion_fk` FOREIGN KEY (`id_institucion`) REFERENCES `catalogo_instituciones` (`id_institucion`);

--
-- Filtros para la tabla `relacion_cargos`
--
ALTER TABLE `relacion_cargos`
  ADD CONSTRAINT `fk_cargo_cet_id` FOREIGN KEY (`cargo_cet_id`) REFERENCES `cargos_cet` (`cargo_cet_id`),
  ADD CONSTRAINT `fk_empleado_id` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`empleado_id`);

--
-- Filtros para la tabla `retroactivos`
--
ALTER TABLE `retroactivos`
  ADD CONSTRAINT `fk_retro_cargo_cet` FOREIGN KEY (`cargo_cet_id`) REFERENCES `cargos_cet` (`cargo_cet_id`),
  ADD CONSTRAINT `fk_retro_cargo_onapre` FOREIGN KEY (`cargo_onapre_id`) REFERENCES `cargos_onapre` (`cargo_onapre_id`),
  ADD CONSTRAINT `fk_retro_direccion` FOREIGN KEY (`direccion_id`) REFERENCES `direcciones` (`direccion_id`),
  ADD CONSTRAINT `fk_retro_division` FOREIGN KEY (`division_id`) REFERENCES `divisiones` (`division_id`),
  ADD CONSTRAINT `fk_retro_empleado` FOREIGN KEY (`empleado_id`) REFERENCES `empleados` (`empleado_id`),
  ADD CONSTRAINT `fk_retro_nivel` FOREIGN KEY (`nivel_salarial_id`) REFERENCES `niveles_salariales` (`nivel_salarial_id`),
  ADD CONSTRAINT `fk_retro_nivel_antiguo` FOREIGN KEY (`nivel_salarial_antiguo_id`) REFERENCES `niveles_salariales_antiguos` (`nivel_salarial_antiguo_id`),
  ADD CONSTRAINT `fk_retro_unidad` FOREIGN KEY (`unidad_id`) REFERENCES `unidades` (`unidad_id`);

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

--
-- Filtros para la tabla `vacaciones`
--
ALTER TABLE `vacaciones`
  ADD CONSTRAINT `fk_vacaciones_status` FOREIGN KEY (`id_status_vacaciones`) REFERENCES `status_vacaciones` (`id_status_vacaciones`) ON UPDATE CASCADE,
  ADD CONSTRAINT `vacaciones_ibfk_1` FOREIGN KEY (`antiguedad_id`) REFERENCES `configuracion_antiguedad` (`antiguedad_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
