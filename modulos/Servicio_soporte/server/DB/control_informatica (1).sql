SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;


CREATE TABLE `actividades_sm` (
  `id` int(11) NOT NULL,
  `nro_act` int(11) DEFAULT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp(),
  `direc_id` int(11) NOT NULL,
  `descrip_id` int(11) DEFAULT NULL,
  `equipo_id` int(11) DEFAULT NULL,
  `tipo_act` int(11) DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `usuario_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `componentes` (
  `id` int(11) NOT NULL,
  `equipo_id` int(11) NOT NULL,
  `tipo_id` int(11) NOT NULL,
  `marca_id` int(11) DEFAULT NULL,
  `modelo_id` int(11) DEFAULT NULL,
  `serial` varchar(100) DEFAULT NULL,
  `capacidad` int(11) DEFAULT NULL,
  `nro_bien` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `componentes` (`id`, `equipo_id`, `tipo_id`, `marca_id`, `modelo_id`, `serial`, `capacidad`, `nro_bien`) VALUES
(5, 22, 1, 2, NULL, 'SN-123', 8, NULL),
(6, 22, 2, 2, NULL, 'SN-456', 240, 'B-99'),
(7, 41, 1, 2, NULL, 'SN-123', 8, NULL),
(8, 41, 2, 2, NULL, 'SN-456', 240, 'B-99');

CREATE TABLE `departamentos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `piso_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `departamentos` (`id`, `nombre`, `piso_id`) VALUES
(1, 'DIRECCION GENERAL', 2),
(3, 'DIRECCION      GENERAL', 2),
(4, 'DIRECCION DE RECURSOS HUMANOS', 2);

CREATE TABLE `descripciones` (
  `id` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `descripciones` (`id`, `nombre`) VALUES
(1, '213213'),
(2, '13214');

CREATE TABLE `equipos` (
  `id` int(11) NOT NULL,
  `nro_bien` varchar(50) NOT NULL,
  `direc_id` int(11) NOT NULL,
  `tipo_equipo` int(11) NOT NULL,
  `pp_pared` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `equipos` (`id`, `nro_bien`, `direc_id`, `tipo_equipo`, `pp_pared`) VALUES
(22, 'C-1', 1, 1, 2),
(41, 'C-123', 1, 1, 8),
(47, 'C-12323', 1, 2, 7);

CREATE TABLE `equipos_computo` (
  `equipo_id` int(11) NOT NULL,
  `nombre_equipo` varchar(100) DEFAULT NULL,
  `sistema_operativo` varchar(100) DEFAULT NULL,
  `version_office` varchar(100) DEFAULT NULL,
  `elaborado_por` varchar(100) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `equipos_computo` (`equipo_id`, `nombre_equipo`, `sistema_operativo`, `version_office`, `elaborado_por`, `observaciones`, `fecha_registro`) VALUES
(22, 'AUDITORIA-PC01', 'Windows 10 Pro', '2021', 'Yoangel Godoy', 'Equipo nuevo de paquete', '2026-04-13 13:58:45'),
(41, 'AUDITORIA-PC01', 'Windows 10 Pro', '2021', 'Yoangel Godoy', 'Equipo nuevo de paquete', '2026-04-13 14:10:26');

CREATE TABLE `estandar` (
  `id` int(11) NOT NULL,
  `plano` varchar(255) DEFAULT NULL,
  `piso_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `estandar_detall` (
  `id` int(11) NOT NULL,
  `nro_puesto` int(11) DEFAULT NULL,
  `equipo_id` int(11) DEFAULT NULL,
  `cargo` varchar(100) DEFAULT NULL,
  `puerto` int(11) DEFAULT NULL,
  `estandar_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `impresoras` (
  `equipo_id` int(11) NOT NULL,
  `marca` int(11) DEFAULT NULL,
  `toner_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `impresoras` (`equipo_id`, `marca`, `toner_id`) VALUES
(47, 1, 1);

CREATE TABLE `marca` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `marca` (`id`, `nombre`) VALUES
(1, '124'),
(2, 'Asus');

CREATE TABLE `modelo` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `marca_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `modelo` (`id`, `nombre`, `marca_id`) VALUES
(5, '112433', 1),
(6, '124', 1),
(8, '124', 1),
(9, '124', 1),
(10, '124', 1),
(11, '124', 1),
(12, '124', 1),
(13, '124', 1),
(14, '124', 1);

CREATE TABLE `modulos_acceso` (
  `modulo_id` int(11) NOT NULL,
  `nombre_modulo` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `modulos_acceso` (`modulo_id`, `nombre_modulo`) VALUES
(1, 'Inventario'),
(2, 'Soporte Técnico'),
(3, 'Reportes');

CREATE TABLE `panel_pared` (
  `id` int(11) NOT NULL,
  `piso` int(11) NOT NULL,
  `is_patch_panel1` tinyint(1) NOT NULL COMMENT 'true:patch_panel1/false:patch_panel2',
  `pp_soporte_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `panel_pared` (`id`, `piso`, `is_patch_panel1`, `pp_soporte_id`) VALUES
(3, 2, 1, 17),
(4, 3, 1, 18);

CREATE TABLE `panel_soport` (
  `id` int(11) NOT NULL,
  `nro_bien` varchar(50) NOT NULL,
  `descripcion` varchar(50) DEFAULT NULL COMMENT 'directo, escala'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `panel_soport` (`id`, `nro_bien`, `descripcion`) VALUES
(1, '123', 'Escala'),
(2, '321', '123');

CREATE TABLE `piso` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL COMMENT 'ej: piso1-alaoeste/piso1-alaeste'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `piso` (`id`, `nombre`) VALUES
(2, 'Piso 1 Ala Este'),
(3, 'Piso 1 Ala oeste');

CREATE TABLE `puertos` (
  `id` int(11) NOT NULL,
  `nro_puerto` int(11) NOT NULL,
  `panel_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `puertos` (`id`, `nro_puerto`, `panel_id`) VALUES
(2, 1, 3),
(7, 2, 3),
(8, 1, 4);

CREATE TABLE `puertos_panel_s` (
  `id` int(11) NOT NULL,
  `nro_puerto` int(11) NOT NULL,
  `p_router` int(11) NOT NULL,
  `panel_soport_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `puertos_panel_s` (`id`, `nro_puerto`, `p_router`, `panel_soport_id`) VALUES
(17, 7, 1, 1),
(18, 1, 4, 1),
(21, 3, 2, 1),
(22, 10, 5, 1),
(23, 2, 6, 1);

CREATE TABLE `roles_sistema` (
  `rol_id` int(11) NOT NULL,
  `nombre_rol` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `roles_sistema` (`rol_id`, `nombre_rol`) VALUES
(1, 'Administrador'),
(2, 'Técnico'),
(3, 'Consulta');

CREATE TABLE `status` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `tipo_act` (
  `id` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `tipo_act` (`id`, `nombre`) VALUES
(1, 'mantenimiento');

CREATE TABLE `tipo_componente` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `tipo_componente` (`id`, `nombre`) VALUES
(1, 'Ram DDR4'),
(2, 'Fuente de Poder'),
(3, 'Disco Duro');

CREATE TABLE `tipo_equipo` (
  `id` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `tipo_equipo` (`id`, `nombre`) VALUES
(1, 'Computador'),
(2, 'Impresora'),
(3, 'Escaner');

CREATE TABLE `tipo_toner` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `descripcion` varchar(150) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `tipo_toner` (`id`, `nombre`, `descripcion`) VALUES
(1, 'toner hp', 'para impresora 1');

CREATE TABLE `transferencia` (
  `id` int(11) NOT NULL,
  `nro` int(11) NOT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp(),
  `origen_id` int(11) NOT NULL,
  `destino_id` int(11) NOT NULL,
  `equipo_id` int(11) NOT NULL,
  `asunto` text NOT NULL,
  `status` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `usuarios` (
  `usuario_id` int(11) NOT NULL,
  `username` varchar(20) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `nombres` varchar(50) NOT NULL,
  `apellidos` varchar(50) NOT NULL,
  `rol_id` int(11) NOT NULL,
  `modulo_id` int(11) NOT NULL,
  `cedula_referencia` varchar(15) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `usuarios` (`usuario_id`, `username`, `password_hash`, `nombres`, `apellidos`, `rol_id`, `modulo_id`, `cedula_referencia`) VALUES
(1, 'admin_sistema', '$2b$12$5sBzfUJnFhtbWDR01EAli.icPdCuhyw4eSJwBipCvV1ACRYm358Mm', 'Carlos', 'Pérez', 1, 1, 'V-20123456');


ALTER TABLE `actividades_sm`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_act_dep` (`direc_id`),
  ADD KEY `fk_act_desc` (`descrip_id`),
  ADD KEY `fk_act_eq` (`equipo_id`),
  ADD KEY `fk_act_tipo` (`tipo_act`),
  ADD KEY `fk_act_stat` (`status`),
  ADD KEY `fk_act_user` (`usuario_id`);

ALTER TABLE `componentes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_comp_equipo` (`equipo_id`),
  ADD KEY `fk_comp_tipo` (`tipo_id`),
  ADD KEY `fk_comp_marca` (`marca_id`),
  ADD KEY `fk_comp_modelo` (`modelo_id`);

ALTER TABLE `departamentos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_dep_piso` (`piso_id`);

ALTER TABLE `descripciones`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `equipos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nro_bien` (`nro_bien`),
  ADD KEY `fk_eq_dep` (`direc_id`),
  ADD KEY `fk_eq_tipo` (`tipo_equipo`),
  ADD KEY `fk_eq_puerto` (`pp_pared`);

ALTER TABLE `equipos_computo`
  ADD PRIMARY KEY (`equipo_id`);

ALTER TABLE `estandar`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_est_piso` (`piso_id`);

ALTER TABLE `estandar_detall`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_det_eq` (`equipo_id`),
  ADD KEY `fk_det_est` (`estandar_id`);

ALTER TABLE `impresoras`
  ADD PRIMARY KEY (`equipo_id`),
  ADD KEY `fk_imp_marca` (`marca`),
  ADD KEY `fk_imp_toner` (`toner_id`);

ALTER TABLE `marca`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

ALTER TABLE `modelo`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_mod_marca` (`marca_id`);

ALTER TABLE `modulos_acceso`
  ADD PRIMARY KEY (`modulo_id`);

ALTER TABLE `panel_pared`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_ppared_piso` (`piso`),
  ADD KEY `fk_ppared_soporte` (`pp_soporte_id`);

ALTER TABLE `panel_soport`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nro_bien` (`nro_bien`);

ALTER TABLE `piso`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `puertos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_puertos_panel` (`panel_id`);

ALTER TABLE `puertos_panel_s`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_pps_soporte` (`panel_soport_id`);

ALTER TABLE `roles_sistema`
  ADD PRIMARY KEY (`rol_id`);

ALTER TABLE `status`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

ALTER TABLE `tipo_act`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `tipo_componente`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `tipo_equipo`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `tipo_toner`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `transferencia`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_trans_orig` (`origen_id`),
  ADD KEY `fk_trans_dest` (`destino_id`),
  ADD KEY `fk_trans_eq` (`equipo_id`),
  ADD KEY `fk_trans_stat` (`status`);

ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`usuario_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `cedula_referencia` (`cedula_referencia`),
  ADD KEY `fk_user_rol` (`rol_id`),
  ADD KEY `fk_user_mod` (`modulo_id`);


ALTER TABLE `actividades_sm`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `componentes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

ALTER TABLE `departamentos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

ALTER TABLE `descripciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

ALTER TABLE `equipos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

ALTER TABLE `estandar`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `estandar_detall`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `marca`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

ALTER TABLE `modelo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

ALTER TABLE `modulos_acceso`
  MODIFY `modulo_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

ALTER TABLE `panel_pared`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

ALTER TABLE `panel_soport`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

ALTER TABLE `piso`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

ALTER TABLE `puertos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

ALTER TABLE `puertos_panel_s`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

ALTER TABLE `roles_sistema`
  MODIFY `rol_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

ALTER TABLE `status`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `tipo_act`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

ALTER TABLE `tipo_componente`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

ALTER TABLE `tipo_equipo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

ALTER TABLE `tipo_toner`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

ALTER TABLE `transferencia`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `usuarios`
  MODIFY `usuario_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;


ALTER TABLE `actividades_sm`
  ADD CONSTRAINT `fk_act_dep` FOREIGN KEY (`direc_id`) REFERENCES `departamentos` (`id`),
  ADD CONSTRAINT `fk_act_desc` FOREIGN KEY (`descrip_id`) REFERENCES `descripciones` (`id`),
  ADD CONSTRAINT `fk_act_eq` FOREIGN KEY (`equipo_id`) REFERENCES `equipos` (`id`),
  ADD CONSTRAINT `fk_act_stat` FOREIGN KEY (`status`) REFERENCES `status` (`id`),
  ADD CONSTRAINT `fk_act_tipo` FOREIGN KEY (`tipo_act`) REFERENCES `tipo_act` (`id`),
  ADD CONSTRAINT `fk_act_user` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`usuario_id`);

ALTER TABLE `componentes`
  ADD CONSTRAINT `fk_comp_equipo` FOREIGN KEY (`equipo_id`) REFERENCES `equipos` (`id`),
  ADD CONSTRAINT `fk_comp_marca` FOREIGN KEY (`marca_id`) REFERENCES `marca` (`id`),
  ADD CONSTRAINT `fk_comp_modelo` FOREIGN KEY (`modelo_id`) REFERENCES `modelo` (`id`),
  ADD CONSTRAINT `fk_comp_tipo` FOREIGN KEY (`tipo_id`) REFERENCES `tipo_componente` (`id`);

ALTER TABLE `departamentos`
  ADD CONSTRAINT `fk_dep_piso` FOREIGN KEY (`piso_id`) REFERENCES `piso` (`id`);

ALTER TABLE `equipos`
  ADD CONSTRAINT `fk_eq_dep` FOREIGN KEY (`direc_id`) REFERENCES `departamentos` (`id`),
  ADD CONSTRAINT `fk_eq_puerto` FOREIGN KEY (`pp_pared`) REFERENCES `puertos` (`id`),
  ADD CONSTRAINT `fk_eq_tipo` FOREIGN KEY (`tipo_equipo`) REFERENCES `tipo_equipo` (`id`);

ALTER TABLE `equipos_computo`
  ADD CONSTRAINT `fk_pc_equipo` FOREIGN KEY (`equipo_id`) REFERENCES `equipos` (`id`);

ALTER TABLE `estandar`
  ADD CONSTRAINT `fk_est_piso` FOREIGN KEY (`piso_id`) REFERENCES `piso` (`id`);

ALTER TABLE `estandar_detall`
  ADD CONSTRAINT `fk_det_eq` FOREIGN KEY (`equipo_id`) REFERENCES `equipos` (`id`),
  ADD CONSTRAINT `fk_det_est` FOREIGN KEY (`estandar_id`) REFERENCES `estandar` (`id`);

ALTER TABLE `impresoras`
  ADD CONSTRAINT `fk_imp_equipo` FOREIGN KEY (`equipo_id`) REFERENCES `equipos` (`id`),
  ADD CONSTRAINT `fk_imp_marca` FOREIGN KEY (`marca`) REFERENCES `marca` (`id`),
  ADD CONSTRAINT `fk_imp_toner` FOREIGN KEY (`toner_id`) REFERENCES `tipo_toner` (`id`);

ALTER TABLE `modelo`
  ADD CONSTRAINT `fk_mod_marca` FOREIGN KEY (`marca_id`) REFERENCES `marca` (`id`);

ALTER TABLE `panel_pared`
  ADD CONSTRAINT `fk_ppared_piso` FOREIGN KEY (`piso`) REFERENCES `piso` (`id`),
  ADD CONSTRAINT `fk_ppared_soporte` FOREIGN KEY (`pp_soporte_id`) REFERENCES `puertos_panel_s` (`id`);

ALTER TABLE `puertos`
  ADD CONSTRAINT `fk_puertos_panel` FOREIGN KEY (`panel_id`) REFERENCES `panel_pared` (`id`);

ALTER TABLE `puertos_panel_s`
  ADD CONSTRAINT `fk_pps_soporte` FOREIGN KEY (`panel_soport_id`) REFERENCES `panel_soport` (`id`);

ALTER TABLE `transferencia`
  ADD CONSTRAINT `fk_trans_dest` FOREIGN KEY (`destino_id`) REFERENCES `departamentos` (`id`),
  ADD CONSTRAINT `fk_trans_eq` FOREIGN KEY (`equipo_id`) REFERENCES `equipos` (`id`),
  ADD CONSTRAINT `fk_trans_orig` FOREIGN KEY (`origen_id`) REFERENCES `departamentos` (`id`),
  ADD CONSTRAINT `fk_trans_stat` FOREIGN KEY (`status`) REFERENCES `status` (`id`);

ALTER TABLE `usuarios`
  ADD CONSTRAINT `fk_user_mod` FOREIGN KEY (`modulo_id`) REFERENCES `modulos_acceso` (`modulo_id`),
  ADD CONSTRAINT `fk_user_rol` FOREIGN KEY (`rol_id`) REFERENCES `roles_sistema` (`rol_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
