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
  `cae_cae` varchar(50) NOT NULL COMMENT 'descripcion de categoría especifica',
  `sca_ide` varchar(10) NOT NULL COMMENT 'Referencia a subcategoría en tessca'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tescet`
--

CREATE TABLE `tescet` (
  `cet_ide` int(11) NOT NULL COMMENT 'Identificador único de cargo CET',
  `cet_car` varchar(50) NOT NULL COMMENT 'Nombre del cargo CET',
  `cet_des` text DEFAULT NULL COMMENT 'Descripción del cargo CET'
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
  `ona_car` varchar(50) NOT NULL COMMENT 'Nombre del cargo ONAPRE',
  `ona_des` text DEFAULT NULL COMMENT 'Descripción del cargo ONAPRE'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Estructura de tabla para la tabla `tesnlv`
--

CREATE TABLE `tesnvl` (
  `nvl_ide` int(11) NOT NULL COMMENT 'Identificador único del rango',
  `nvl_ran` varchar(2) NOT NULL COMMENT 'Tipo de nivel salarial',
  `nvl_des` text DEFAULT NULL COMMENT 'Descripción del cargo ONAPRE',
  `nvl_sal` decimal(10,2) NOT NULL COMMENT 'Salario Correspondiente',
  `ona_ide` int(11) DEFAULT NULL COMMENT 'Referencia a cargo ONAPRE en tesona'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `sca_sca` varchar(50) NOT NULL COMMENT 'descripcion de sub-categoria',
  `cat_ide` varchar(10) NOT NULL COMMENT 'Referencia a categoría en tmacat'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tesusu`
--

CREATE TABLE `tesusu` (
  `usu_ide` INT NOT NULL COMMENT 'Identificador unico del usuario',
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
  `bim_ndo` date NOT NULL COMMENT 'Numero de documento (factura) del bien',
  `bim_val` decimal(10,0) NOT NULL COMMENT 'Valor monetario de adquisicion del bien ',
  `bim_moneda` varchar(10) NOT NULL COMMENT 'Moneda en la que esta el valor del bien (Bolivares)',
  `bim_color` varchar(30) NOT NULL COMMENT 'Color del bien',
  `bim_cod` varchar(20) NOT NULL COMMENT 'Codigo de SUDEBIN del bien mueble',
  `bim_obs` text NOT NULL COMMENT 'Observacion del bien',
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
  `nom_nhi` int(11) NOT NULL COMMENT 'Número de hijos',
  `cet_ide` int(11) DEFAULT NULL COMMENT 'Referencia a cargo CET en tescet',
  `ona_ide` int(11) DEFAULT NULL COMMENT 'Referencia a cargo ONAPRE en tesona',
  `dep_ide` int(11) DEFAULT NULL COMMENT 'Referencia a departamento en tesdep'
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
  ADD UNIQUE KEY `ona_ide` (`ona_ide`),
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

CREATE TABLE `tmacoi` (
  `coi_ide` int(11) NOT NULL COMMENT 'Identificador de concepto de incorporación',
  `coi_coi` varchar(50) NOT NULL COMMENT 'Descripción de concepto de incorporación'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

ALTER TABLE `tmacoi`
  ADD PRIMARY KEY (`coi_ide`);

ALTER TABLE `tmab_m` ADD COLUMN `coi_ide` int(11) COMMENT 'Referencia a concepto de incorporación en tmacoi', ADD CONSTRAINT `fk_tmabm_tmacoi` FOREIGN KEY (`coi_ide`) REFERENCES `tmacoi` (`coi_ide`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/* VOLCADO DE LA BASE DE DATOS */

-- TABLA TESCET

INSERT INTO `tescet` (`cet_car`, `cet_des`) VALUES
('ABOGADO PI', NULL),
('ABOGADO PII', NULL),
('ANALISTA PI', NULL),
('ANALISTA PII', NULL),
('ASISTENTE ADMINISTRATIVO TSU I', NULL),
('ASISTENTE ADMINISTRATIVO TSU II', NULL),
('ASISTENTE DE TÉCNICO TSU II', NULL),
('AUDITOR PI', NULL),
('AUDITOR PII', NULL),
('AUDITOR PIII', NULL),
('AUXILIAR ADMINISTRATIVO BI', NULL),
('AUXILIAR BI', NULL),
('AUXILIAR BII', NULL),
('AUXILIAR BIII', NULL),
('CONSULTOR JURÍDICO', NULL),
('CONTADOR PI', NULL),
('DIRECTOR(A)(E) / ABOGADO PII - IV', NULL),
('DIRECTOR(A)(E) / JEFE DE DIVISIÓN GENERAL', NULL),
('DIRECTOR(A)(E) / JEFE DE DIVISIÓN', NULL),
('DIRECTOR(A)', NULL),
('DIRECTOR(A) DE LINEA', NULL),
('DIRECTOR(A) GENERAL', NULL),
('ENFERMERA', NULL),
('JEFE DE DIVISIÓN', NULL),
('JEFE DE DIVISIÓN(E) / ABOGADA PII - III', NULL),
('JEFE DE DIVISIÓN GENERAL', NULL),
('JEFE DE OFICINA', NULL),
('MÉDICO', NULL),
('NOTIFICADOR BIII', NULL),
('ODONTÓLOGO', NULL),
('PLANIFICADOR PI', NULL),
('PROMOTOR SOCIAL TI', NULL),
('SUPERVISOR', NULL),
('CONTRALOR(A) DEL ESTADO', NULL);

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
  ('Seguro del Empleado', 0.04),
  ('Seguro Patronal', 0.09),
  ('R.P.E Empleado', 0.005),
  ('R.P.E Patronal', 0.02),
  ('F.A.O.V Empleado', 0.01),
  ('F.A.O.V Patronal', 2.00),
  ('F.E.J.P Empleado y Patronal', 0.03),
  ('Caja Empleado y Patronal', 0.10);

-- FUTUROS VOLCADOS EN LA BASE DE DATOS