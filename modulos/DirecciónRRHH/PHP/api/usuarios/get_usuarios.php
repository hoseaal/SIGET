<?php
require '../../../conexion/conexion.php';

try {
    $stmt = $pdo->query("SELECT nom_ced, nom_nom, nom_ape FROM tmanom");
    $usuarios = $stmt->fetchAll();
    echo json_encode($usuarios);
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}