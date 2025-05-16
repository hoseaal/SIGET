<?php
    header('Content-Type: application/json');
    require_once '../../../conexion/conexion.php';

    try {
        $query = "SELECT dep_ide, dep_nom FROM tesdep ORDER BY dep_nom";
        $stmt = $pdo->query($query);
        $departamentos = $stmt->fetchAll();

        echo json_encode([
            'success' => true,
            'departamentos' => $departamentos
        ]);

    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error al cargar departamentos: ' . $e->getMessage()
        ]);
    }
?>