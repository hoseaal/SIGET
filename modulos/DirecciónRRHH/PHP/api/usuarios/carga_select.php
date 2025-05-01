<?php
require '../conexion/conexion.php';

// Consultas para llenar los selects
$cargosCet = $pdo->query("SELECT cet_ide, cet_car FROM tescet")->fetchAll();
$cargosOnapre = $pdo->query("SELECT ona_ide, ona_car FROM tesona")->fetchAll();
$departamentos = $pdo->query("SELECT dep_ide, dep_nom FROM tesdep")->fetchAll();