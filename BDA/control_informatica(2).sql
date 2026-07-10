-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: control_informatica
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `actividades_sm`
--

CREATE DATABASE IF NOT EXISTS `control_informatica`;
USE `control_informatica`;

DROP TABLE IF EXISTS `actividades_sm`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `actividades_sm` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nro_act` int DEFAULT NULL,
  `fecha` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `direc_id` int NOT NULL,
  `equipo_id` int DEFAULT NULL,
  `tipo_act` int DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_general_ci,
  `usuario_id` int DEFAULT NULL,
  `clasificacion_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_act_dep` (`direc_id`),
  KEY `fk_act_eq` (`equipo_id`),
  KEY `fk_act_tipo` (`tipo_act`),
  KEY `fk_act_user` (`usuario_id`),
  KEY `fk_act_clasificacion` (`clasificacion_id`),
  CONSTRAINT `fk_act_clasificacion` FOREIGN KEY (`clasificacion_id`) REFERENCES `tipo_clasificacion_sm` (`id`),
  CONSTRAINT `fk_act_dep` FOREIGN KEY (`direc_id`) REFERENCES `departamentos` (`id`),
  CONSTRAINT `fk_act_eq` FOREIGN KEY (`equipo_id`) REFERENCES `equipos` (`id`),
  CONSTRAINT `fk_act_tipo` FOREIGN KEY (`tipo_act`) REFERENCES `tipo_act` (`id`),
  CONSTRAINT `fk_act_user` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`usuario_id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `actividades_sm`
--

LOCK TABLES `actividades_sm` WRITE;
/*!40000 ALTER TABLE `actividades_sm` DISABLE KEYS */;
INSERT INTO `actividades_sm` VALUES (21,0,'2026-05-08 18:58:07',5,NULL,15,'21312',1,4),(22,0,'2026-05-08 15:23:50',5,52,15,'ADINASID ASDNAPSDJASOPD ASDJOPASDJOPASD ASJDOPASDJOPASD',1,6),(23,0,'2026-04-28 04:00:00',3,49,12,'ASEDASDASD',1,3),(24,0,'2026-05-13 18:18:33',5,52,13,'DASD',1,3),(25,0,'2026-05-13 18:51:05',5,47,14,'ASDAS',1,3),(26,0,'2026-05-13 18:51:12',1,47,14,'ASDASDASD',1,3),(27,0,'2026-05-19 04:00:00',1,47,14,'SDASDASDASD',1,4),(28,0,'2026-05-22 04:00:00',1,48,8,'21312',1,3),(29,0,'2026-03-24 04:00:00',1,47,8,'SADSAD',1,3),(30,0,'2026-06-02 04:00:00',1,47,14,'123123',4,4),(31,0,'2026-06-02 04:00:00',1,47,14,'ASDASD',4,4),(32,0,'2026-06-09 18:39:13',3,NULL,2,'352305',4,3);
/*!40000 ALTER TABLE `actividades_sm` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `componentes`
--

DROP TABLE IF EXISTS `componentes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `componentes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `equipo_id` int NOT NULL,
  `tipo_id` int NOT NULL,
  `marca_id` int DEFAULT NULL,
  `modelo_id` int DEFAULT NULL,
  `serial` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `capacidad` int DEFAULT NULL,
  `nro_bien` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_comp_equipo` (`equipo_id`),
  KEY `fk_comp_tipo` (`tipo_id`),
  KEY `fk_comp_marca` (`marca_id`),
  KEY `fk_comp_modelo` (`modelo_id`),
  CONSTRAINT `fk_comp_equipo` FOREIGN KEY (`equipo_id`) REFERENCES `equipos` (`id`),
  CONSTRAINT `fk_comp_marca` FOREIGN KEY (`marca_id`) REFERENCES `marca` (`id`),
  CONSTRAINT `fk_comp_modelo` FOREIGN KEY (`modelo_id`) REFERENCES `modelo` (`id`),
  CONSTRAINT `fk_comp_tipo` FOREIGN KEY (`tipo_id`) REFERENCES `tipo_componente` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `componentes`
--

LOCK TABLES `componentes` WRITE;
/*!40000 ALTER TABLE `componentes` DISABLE KEYS */;
INSERT INTO `componentes` VALUES (43,48,1,1,6,'123',2131,'23'),(44,48,2,2,NULL,'213',123,'123'),(45,48,3,2,NULL,'145',1515,'515'),(46,48,1,1,6,'21321',321312,'312');
/*!40000 ALTER TABLE `componentes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `croquis`
--

DROP TABLE IF EXISTS `croquis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `croquis` (
  `id` int NOT NULL AUTO_INCREMENT,
  `piso_id` int NOT NULL,
  `imagen_url` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `piso_id` (`piso_id`),
  CONSTRAINT `croquis_ibfk_1` FOREIGN KEY (`piso_id`) REFERENCES `piso` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `croquis`
--

LOCK TABLES `croquis` WRITE;
/*!40000 ALTER TABLE `croquis` DISABLE KEYS */;
INSERT INTO `croquis` VALUES (7,2,'/uploads/1781448281124-223239197.webp','2026-06-14 14:44:53'),(8,3,'/uploads/1781454529042-459991927.webp','2026-06-14 16:29:01');
/*!40000 ALTER TABLE `croquis` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departamentos`
--

DROP TABLE IF EXISTS `departamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departamentos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `piso_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_dep_piso` (`piso_id`),
  CONSTRAINT `fk_dep_piso` FOREIGN KEY (`piso_id`) REFERENCES `piso` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departamentos`
--

LOCK TABLES `departamentos` WRITE;
/*!40000 ALTER TABLE `departamentos` DISABLE KEYS */;
INSERT INTO `departamentos` VALUES (1,'Direccion General',2),(2,'Direccion de Investigaciones',3),(3,'Direccion de Servicios Generales, Seguridad y Transporte',2),(4,'Oficina de Atencion al Publico y Participacion Ciudadana',2),(5,'Consultoria Juridica',3),(6,'Direccion de Control de la Administracion Centralizada y Poder Legislativo',3),(7,'Direccion de Recursos Humanos',2),(8,'Direccion de Control de la Administracion Descentralizada',2),(9,'Direccion de Administración',3),(10,'Direccion de Planificacion, Organizacion y Metodos',3),(11,'Direccion de Determinacion de Responsabilidades',2),(12,'Direccion de Secretaria del Despacho',3),(13,'Direccion de Auditoria Interna',3),(14,'División de Servicio Técnico',3);
/*!40000 ALTER TABLE `departamentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `descripciones`
--

DROP TABLE IF EXISTS `descripciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `descripciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `descripciones`
--

LOCK TABLES `descripciones` WRITE;
/*!40000 ALTER TABLE `descripciones` DISABLE KEYS */;
INSERT INTO `descripciones` VALUES (3,'1');
/*!40000 ALTER TABLE `descripciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `equipos`
--

DROP TABLE IF EXISTS `equipos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `equipos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nro_bien` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `direc_id` int NOT NULL,
  `tipo_equipo` int NOT NULL,
  `pp_pared` int DEFAULT NULL,
  `ip` varchar(15) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `modelo_id` int DEFAULT NULL,
  `marca_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nro_bien` (`nro_bien`),
  KEY `fk_eq_dep` (`direc_id`),
  KEY `fk_eq_tipo` (`tipo_equipo`),
  KEY `fk_eq_puerto` (`pp_pared`),
  KEY `modelo_id` (`modelo_id`),
  KEY `marca_id` (`marca_id`),
  CONSTRAINT `equipos_ibfk_1` FOREIGN KEY (`modelo_id`) REFERENCES `modelo` (`id`),
  CONSTRAINT `equipos_ibfk_2` FOREIGN KEY (`marca_id`) REFERENCES `marca` (`id`),
  CONSTRAINT `fk_eq_dep` FOREIGN KEY (`direc_id`) REFERENCES `departamentos` (`id`),
  CONSTRAINT `fk_eq_puerto` FOREIGN KEY (`pp_pared`) REFERENCES `puertos` (`id`),
  CONSTRAINT `fk_eq_tipo` FOREIGN KEY (`tipo_equipo`) REFERENCES `tipo_equipo` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `equipos`
--

LOCK TABLES `equipos` WRITE;
/*!40000 ALTER TABLE `equipos` DISABLE KEYS */;
INSERT INTO `equipos` VALUES (47,'C-12323',1,2,7,'13213123',6,1),(48,'12321',1,1,2,'123123213',5,1),(49,'123',3,2,8,NULL,NULL,1),(50,'213',3,2,11,'123213',NULL,2),(52,'12333',5,1,12,'123.213.213',NULL,2),(53,'124124',1,3,13,'192.168.0.11',5,1);
/*!40000 ALTER TABLE `equipos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `equipos_computo`
--

DROP TABLE IF EXISTS `equipos_computo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `equipos_computo` (
  `equipo_id` int NOT NULL,
  `nombre_equipo` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `sistema_operativo` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `version_office` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `elaborado_por` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_general_ci,
  `fecha_registro` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`equipo_id`),
  CONSTRAINT `fk_pc_equipo` FOREIGN KEY (`equipo_id`) REFERENCES `equipos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `equipos_computo`
--

LOCK TABLES `equipos_computo` WRITE;
/*!40000 ALTER TABLE `equipos_computo` DISABLE KEYS */;
INSERT INTO `equipos_computo` VALUES (48,'auditoria','windows11','2021','yoangel godoy','12321343124','2026-04-17 15:47:39');
/*!40000 ALTER TABLE `equipos_computo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estandar`
--

DROP TABLE IF EXISTS `estandar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estandar` (
  `id` int NOT NULL AUTO_INCREMENT,
  `plano` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `piso_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_est_piso` (`piso_id`),
  CONSTRAINT `fk_est_piso` FOREIGN KEY (`piso_id`) REFERENCES `piso` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estandar`
--

LOCK TABLES `estandar` WRITE;
/*!40000 ALTER TABLE `estandar` DISABLE KEYS */;
/*!40000 ALTER TABLE `estandar` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estandar_detall`
--

DROP TABLE IF EXISTS `estandar_detall`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estandar_detall` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nro_puesto` int DEFAULT NULL,
  `equipo_id` int DEFAULT NULL,
  `cargo` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `puerto` int DEFAULT NULL,
  `estandar_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_det_eq` (`equipo_id`),
  KEY `fk_det_est` (`estandar_id`),
  CONSTRAINT `fk_det_eq` FOREIGN KEY (`equipo_id`) REFERENCES `equipos` (`id`),
  CONSTRAINT `fk_det_est` FOREIGN KEY (`estandar_id`) REFERENCES `estandar` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estandar_detall`
--

LOCK TABLES `estandar_detall` WRITE;
/*!40000 ALTER TABLE `estandar_detall` DISABLE KEYS */;
/*!40000 ALTER TABLE `estandar_detall` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `impresoras`
--

DROP TABLE IF EXISTS `impresoras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `impresoras` (
  `equipo_id` int NOT NULL,
  `toner_id` int DEFAULT NULL,
  `asig_toner` int DEFAULT '0',
  PRIMARY KEY (`equipo_id`),
  KEY `fk_imp_toner` (`toner_id`),
  CONSTRAINT `fk_imp_equipo` FOREIGN KEY (`equipo_id`) REFERENCES `equipos` (`id`),
  CONSTRAINT `fk_imp_toner` FOREIGN KEY (`toner_id`) REFERENCES `tipo_toner` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `impresoras`
--

LOCK TABLES `impresoras` WRITE;
/*!40000 ALTER TABLE `impresoras` DISABLE KEYS */;
INSERT INTO `impresoras` VALUES (47,2,1),(49,1,0);
/*!40000 ALTER TABLE `impresoras` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mantenimiento`
--

DROP TABLE IF EXISTS `mantenimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mantenimiento` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nro_caso` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `fecha_solicitud` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `usuario_id` int NOT NULL,
  `direc_id` int NOT NULL,
  `tipo_falla` int DEFAULT NULL,
  `equipo_id` int DEFAULT NULL,
  `asunto` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_general_ci NOT NULL,
  `prioridad` enum('Baja','Media','Alta') COLLATE utf8mb4_general_ci DEFAULT 'Media',
  `status` int NOT NULL DEFAULT '2',
  `codigo_entrega` varchar(6) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `usuario_tecnico_id` int DEFAULT NULL,
  `diagnostico` text COLLATE utf8mb4_general_ci,
  `solucion` text COLLATE utf8mb4_general_ci,
  `fecha_fin` datetime DEFAULT NULL,
  `clasificacion_id` int DEFAULT NULL,
  `depto_destino_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nro_caso` (`nro_caso`),
  KEY `usuario_id` (`usuario_id`),
  KEY `direc_id` (`direc_id`),
  KEY `status` (`status`),
  KEY `fk_maint_clasificacion` (`clasificacion_id`),
  KEY `fk_maint_tipo_act` (`tipo_falla`),
  CONSTRAINT `fk_maint_clasificacion` FOREIGN KEY (`clasificacion_id`) REFERENCES `tipo_clasificacion_sm` (`id`),
  CONSTRAINT `fk_maint_tipo_act` FOREIGN KEY (`tipo_falla`) REFERENCES `tipo_act` (`id`),
  CONSTRAINT `mantenimiento_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`usuario_id`),
  CONSTRAINT `mantenimiento_ibfk_2` FOREIGN KEY (`direc_id`) REFERENCES `departamentos` (`id`),
  CONSTRAINT `mantenimiento_ibfk_3` FOREIGN KEY (`status`) REFERENCES `status` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mantenimiento`
--

LOCK TABLES `mantenimiento` WRITE;
/*!40000 ALTER TABLE `mantenimiento` DISABLE KEYS */;
INSERT INTO `mantenimiento` VALUES (31,'MAN-2026-0001','2026-06-16 23:29:12',1,1,22,47,'fallo de impresion','la impresora ricoh no impreme y suena mal','Media',2,'687028',NULL,NULL,NULL,NULL,NULL,14);
/*!40000 ALTER TABLE `mantenimiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `marca`
--

DROP TABLE IF EXISTS `marca`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `marca` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `marca`
--

LOCK TABLES `marca` WRITE;
/*!40000 ALTER TABLE `marca` DISABLE KEYS */;
INSERT INTO `marca` VALUES (1,'124'),(2,'Asus');
/*!40000 ALTER TABLE `marca` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `modelo`
--

DROP TABLE IF EXISTS `modelo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `modelo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `marca_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_mod_marca` (`marca_id`),
  CONSTRAINT `fk_mod_marca` FOREIGN KEY (`marca_id`) REFERENCES `marca` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `modelo`
--

LOCK TABLES `modelo` WRITE;
/*!40000 ALTER TABLE `modelo` DISABLE KEYS */;
INSERT INTO `modelo` VALUES (5,'112433',1),(6,'124',1),(8,'124',1),(9,'124',1),(10,'124',1),(11,'124',1),(12,'124',1),(13,'124',1),(14,'124',1);
/*!40000 ALTER TABLE `modelo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `panel_pared`
--

DROP TABLE IF EXISTS `panel_pared`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `panel_pared` (
  `id` int NOT NULL AUTO_INCREMENT,
  `piso` int NOT NULL,
  `is_patch_panel1` tinyint(1) NOT NULL COMMENT 'true:patch_panel1/false:patch_panel2',
  `pp_soporte_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_ppared_piso` (`piso`),
  KEY `fk_ppared_soporte` (`pp_soporte_id`),
  CONSTRAINT `fk_ppared_piso` FOREIGN KEY (`piso`) REFERENCES `piso` (`id`),
  CONSTRAINT `fk_ppared_soporte` FOREIGN KEY (`pp_soporte_id`) REFERENCES `puertos_panel_s` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `panel_pared`
--

LOCK TABLES `panel_pared` WRITE;
/*!40000 ALTER TABLE `panel_pared` DISABLE KEYS */;
INSERT INTO `panel_pared` VALUES (3,2,0,18),(4,2,0,25);
/*!40000 ALTER TABLE `panel_pared` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `panel_soport`
--

DROP TABLE IF EXISTS `panel_soport`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `panel_soport` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nro_bien` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'directo, escala',
  PRIMARY KEY (`id`),
  UNIQUE KEY `nro_bien` (`nro_bien`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `panel_soport`
--

LOCK TABLES `panel_soport` WRITE;
/*!40000 ALTER TABLE `panel_soport` DISABLE KEYS */;
INSERT INTO `panel_soport` VALUES (1,'patch-1','patch-1'),(2,'patch-2','patch-2');
/*!40000 ALTER TABLE `panel_soport` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `piso`
--

DROP TABLE IF EXISTS `piso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `piso` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_general_ci NOT NULL COMMENT 'ej: piso1-alaoeste/piso1-alaeste',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `piso`
--

LOCK TABLES `piso` WRITE;
/*!40000 ALTER TABLE `piso` DISABLE KEYS */;
INSERT INTO `piso` VALUES (2,'Piso 1 Ala Este'),(3,'Piso 1 Ala oeste');
/*!40000 ALTER TABLE `piso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `puertos`
--

DROP TABLE IF EXISTS `puertos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `puertos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nro_puerto` int NOT NULL,
  `panel_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_puertos_panel` (`panel_id`),
  CONSTRAINT `fk_puertos_panel` FOREIGN KEY (`panel_id`) REFERENCES `panel_pared` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `puertos`
--

LOCK TABLES `puertos` WRITE;
/*!40000 ALTER TABLE `puertos` DISABLE KEYS */;
INSERT INTO `puertos` VALUES (2,1,3),(7,2,3),(8,1,4),(11,21,4),(12,3,3),(13,42,3);
/*!40000 ALTER TABLE `puertos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `puertos_panel_s`
--

DROP TABLE IF EXISTS `puertos_panel_s`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `puertos_panel_s` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nro_puerto` int NOT NULL,
  `p_router` int NOT NULL,
  `panel_soport_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_pps_soporte` (`panel_soport_id`),
  CONSTRAINT `fk_pps_soporte` FOREIGN KEY (`panel_soport_id`) REFERENCES `panel_soport` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `puertos_panel_s`
--

LOCK TABLES `puertos_panel_s` WRITE;
/*!40000 ALTER TABLE `puertos_panel_s` DISABLE KEYS */;
INSERT INTO `puertos_panel_s` VALUES (17,7,1,1),(18,1,4,1),(21,3,2,1),(22,10,5,1),(23,2,6,1),(24,12,12,2),(25,1,21321,2);
/*!40000 ALTER TABLE `puertos_panel_s` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `puntos_red_posicion`
--

DROP TABLE IF EXISTS `puntos_red_posicion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `puntos_red_posicion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `croquis_id` int NOT NULL,
  `puerto_id` int NOT NULL,
  `x_pct` decimal(5,2) NOT NULL,
  `y_pct` decimal(5,2) NOT NULL,
  `creado_en` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `puerto_id` (`puerto_id`),
  KEY `croquis_id` (`croquis_id`),
  CONSTRAINT `puntos_red_posicion_ibfk_1` FOREIGN KEY (`croquis_id`) REFERENCES `croquis` (`id`) ON DELETE CASCADE,
  CONSTRAINT `puntos_red_posicion_ibfk_2` FOREIGN KEY (`puerto_id`) REFERENCES `puertos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `puntos_red_posicion`
--

LOCK TABLES `puntos_red_posicion` WRITE;
/*!40000 ALTER TABLE `puntos_red_posicion` DISABLE KEYS */;
INSERT INTO `puntos_red_posicion` VALUES (6,7,2,7.15,27.77,'2026-06-14 14:44:59'),(7,7,12,24.74,27.38,'2026-06-14 14:50:40'),(8,7,13,33.78,63.93,'2026-06-14 15:40:52'),(9,7,7,31.34,33.67,'2026-06-14 16:16:49'),(10,8,8,73.15,57.16,'2026-06-14 16:29:37'),(11,8,11,85.35,27.35,'2026-06-14 16:36:13');
/*!40000 ALTER TABLE `puntos_red_posicion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles_sistema`
--

DROP TABLE IF EXISTS `roles_sistema`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles_sistema` (
  `rol_id` int NOT NULL AUTO_INCREMENT,
  `nombre_rol` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`rol_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles_sistema`
--

LOCK TABLES `roles_sistema` WRITE;
/*!40000 ALTER TABLE `roles_sistema` DISABLE KEYS */;
INSERT INTO `roles_sistema` VALUES (1,'Administrador'),(2,'Técnico'),(3,'Consulta');
/*!40000 ALTER TABLE `roles_sistema` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `status`
--

DROP TABLE IF EXISTS `status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `status` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `status`
--

LOCK TABLES `status` WRITE;
/*!40000 ALTER TABLE `status` DISABLE KEYS */;
INSERT INTO `status` VALUES (1,'Activo'),(8,'Anulado'),(5,'En Reparación'),(4,'En Revisión'),(7,'Entregado'),(6,'Listo para Entrega'),(2,'Pendiente'),(3,'Recibido');
/*!40000 ALTER TABLE `status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipo_act`
--

DROP TABLE IF EXISTS `tipo_act`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipo_act` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `depto_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipo_act`
--

LOCK TABLES `tipo_act` WRITE;
/*!40000 ALTER TABLE `tipo_act` DISABLE KEYS */;
INSERT INTO `tipo_act` VALUES (1,'Instalación de Impresora en RED',14),(2,'Monitoreo de Conexión CANTV',14),(3,'Mantenimiento Preventivo',14),(4,'Mantenimiento Correctivo',14),(5,'Recuperacion de Equipo PC.',14),(6,'Formateo de PC, Respaldo Usuario.',14),(7,'Revision Linea Telefonica',14),(8,'Actividades de Inventario',14),(9,'Mudanza de Equipo o Impresora',14),(10,'Informe Asigancion de Toner',14),(11,'Instalación de Punto de Red, Router, Switch',14),(12,'Instalación de Aplicación.',14),(13,'Revision de Equipo, partes o piezas',14),(14,'Instalacion de Toner',14),(15,'Desarrollo de Manual.',14),(16,'Adiestramiento Personal Contraloria.',14),(17,'Informe Tecnico.',14),(18,'Reunion con Director de Area',14),(19,'Captura de Huellas',14),(20,'Actividades de Bases de Datos',14),(21,'Reporte biometrico',14),(22,'OTRO',NULL),(23,'Solicitud de pintura de espacio fisico',3),(24,'Reparación por falla electrica',3),(25,'Cambio o Revisión de bombillo o iluminación',3),(26,'Revisión o inclusión de huella biométrico',3),(27,'Revisión de Lavamanos',3),(28,'Revisión de Poceta o Bidet',3),(29,'Traslado de mobiliario',3),(30,'Solicitud de Limpieza de Área',3),(31,'Traslado por Desincorporación Almacén',3),(32,'Solicitud de Traslado',3),(33,'Solicitud de constancias de trabajo',7),(34,'Permisos justificados',7),(35,'Permisos no justificados',7),(36,'Vacaciones',7),(37,'Objetivos de Desempeño Individual (ODI)',7),(38,'Revisión Medica',7),(39,'Solicitud Forma-100',7),(40,'Solicitud Relación de Cargos',7);
/*!40000 ALTER TABLE `tipo_act` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipo_clasificacion_sm`
--

DROP TABLE IF EXISTS `tipo_clasificacion_sm`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipo_clasificacion_sm` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `categoria` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipo_clasificacion_sm`
--

LOCK TABLES `tipo_clasificacion_sm` WRITE;
/*!40000 ALTER TABLE `tipo_clasificacion_sm` DISABLE KEYS */;
INSERT INTO `tipo_clasificacion_sm` VALUES (1,'Software','MANT. PREVENTIVO'),(2,'Hardware','MANT. PREVENTIVO'),(3,'Software','MANT. CORRECTIVO'),(4,'Hardware','MANT. CORRECTIVO'),(5,'Servicios / Redes','PLAT. TECNOLOGICA'),(6,'Informes','PLAT. TECNOLOGICA');
/*!40000 ALTER TABLE `tipo_clasificacion_sm` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipo_componente`
--

DROP TABLE IF EXISTS `tipo_componente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipo_componente` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipo_componente`
--

LOCK TABLES `tipo_componente` WRITE;
/*!40000 ALTER TABLE `tipo_componente` DISABLE KEYS */;
INSERT INTO `tipo_componente` VALUES (1,'Ram DDR4'),(2,'Fuente de Poder'),(3,'Disco Duro');
/*!40000 ALTER TABLE `tipo_componente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipo_equipo`
--

DROP TABLE IF EXISTS `tipo_equipo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipo_equipo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipo_equipo`
--

LOCK TABLES `tipo_equipo` WRITE;
/*!40000 ALTER TABLE `tipo_equipo` DISABLE KEYS */;
INSERT INTO `tipo_equipo` VALUES (1,'Computador'),(2,'Impresora'),(3,'Escaner');
/*!40000 ALTER TABLE `tipo_equipo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipo_toner`
--

DROP TABLE IF EXISTS `tipo_toner`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipo_toner` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `descripcion` varchar(150) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `marca_id` int DEFAULT NULL,
  `modelo_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_toner_marca` (`marca_id`),
  KEY `fk_toner_modelo` (`modelo_id`),
  CONSTRAINT `fk_toner_marca` FOREIGN KEY (`marca_id`) REFERENCES `marca` (`id`),
  CONSTRAINT `fk_toner_modelo` FOREIGN KEY (`modelo_id`) REFERENCES `modelo` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipo_toner`
--

LOCK TABLES `tipo_toner` WRITE;
/*!40000 ALTER TABLE `tipo_toner` DISABLE KEYS */;
INSERT INTO `tipo_toner` VALUES (1,'toner hp','para impresora 1',1,6),(2,'123','123',2,NULL);
/*!40000 ALTER TABLE `tipo_toner` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transferencia`
--

DROP TABLE IF EXISTS `transferencia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transferencia` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nro_caso` varchar(15) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `fecha` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `origen_id` int NOT NULL,
  `destino_id` int NOT NULL,
  `equipo_id` int NOT NULL,
  `usuario_id` int DEFAULT NULL,
  `asunto` text COLLATE utf8mb4_general_ci NOT NULL,
  `prioridad` enum('Baja','Media','Alta') COLLATE utf8mb4_general_ci DEFAULT 'Media',
  `observaciones` text COLLATE utf8mb4_general_ci,
  `diagnostico_tecnico` text COLLATE utf8mb4_general_ci,
  `solucion_tecnica` text COLLATE utf8mb4_general_ci,
  `status` int DEFAULT NULL,
  `fecha_recepcion` timestamp NULL DEFAULT NULL,
  `usuario_tecnico_id` int DEFAULT NULL,
  `fecha_entrega` timestamp NULL DEFAULT NULL,
  `codigo_entrega` varchar(6) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `clasificacion_id` int DEFAULT NULL,
  `tipo_act` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_trans_orig` (`origen_id`),
  KEY `fk_trans_dest` (`destino_id`),
  KEY `fk_trans_eq` (`equipo_id`),
  KEY `fk_trans_stat` (`status`),
  KEY `fk_transferencia_clasificacion` (`clasificacion_id`),
  KEY `fk_transferencia_tipo_act` (`tipo_act`),
  CONSTRAINT `fk_trans_dest` FOREIGN KEY (`destino_id`) REFERENCES `departamentos` (`id`),
  CONSTRAINT `fk_trans_eq` FOREIGN KEY (`equipo_id`) REFERENCES `equipos` (`id`),
  CONSTRAINT `fk_trans_orig` FOREIGN KEY (`origen_id`) REFERENCES `departamentos` (`id`),
  CONSTRAINT `fk_trans_stat` FOREIGN KEY (`status`) REFERENCES `status` (`id`),
  CONSTRAINT `fk_transferencia_clasificacion` FOREIGN KEY (`clasificacion_id`) REFERENCES `tipo_clasificacion_sm` (`id`),
  CONSTRAINT `fk_transferencia_tipo_act` FOREIGN KEY (`tipo_act`) REFERENCES `tipo_act` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transferencia`
--

LOCK TABLES `transferencia` WRITE;
/*!40000 ALTER TABLE `transferencia` DISABLE KEYS */;
INSERT INTO `transferencia` VALUES (17,'TRA-2026-0001','2026-06-11 15:19:12',1,14,48,2,'asdas','Media','asdasd',NULL,NULL,2,NULL,NULL,NULL,'947402',NULL,NULL);
/*!40000 ALTER TABLE `transferencia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `usuario_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `nombres` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `apellidos` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `rol_id` int NOT NULL,
  `direc_id` int DEFAULT NULL,
  `cedula_referencia` varchar(15) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`usuario_id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `cedula_referencia` (`cedula_referencia`),
  KEY `fk_user_rol` (`rol_id`),
  KEY `fk_user_dep` (`direc_id`),
  CONSTRAINT `fk_user_dep` FOREIGN KEY (`direc_id`) REFERENCES `departamentos` (`id`),
  CONSTRAINT `fk_user_rol` FOREIGN KEY (`rol_id`) REFERENCES `roles_sistema` (`rol_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'admin_sistema','$2b$12$5sBzfUJnFhtbWDR01EAli.icPdCuhyw4eSJwBipCvV1ACRYm358Mm','Yoangel','Godoy',1,1,'20123456'),(2,'yoang','$2b$12$WfirH6xukkDeMl2UZyVFpe/PkAvgRSaANYziNxuzXQwrF8ek27oKO','Yoangel ','Godoy',3,1,'30782050'),(4,'godoy','$2b$12$.1QruJkjmLjZBp8vUV/gQuMRszYA4soT9Ov.hYHtMWsZphEyqLri6','Alejandro','Godoy',2,14,'30782060'),(5,'juan','$2b$12$WDcE0dBcupH6nYkmEG.RUuj74yKYYc31pIa9PCp2BY75cy0ZioRX2','juan','perez',3,7,'30782090');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-06 18:18:03
