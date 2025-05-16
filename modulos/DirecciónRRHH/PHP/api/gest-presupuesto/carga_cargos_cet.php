<?php
    header('Content-Type: application/json');
    require_once '../../../conexion/conexion.php';

    try {
        $query = "SELECT cet_ide, cet_car FROM tescet ORDER BY cet_car";
        $stmt = $pdo->query($query);
        $cargos = $stmt->fetchAll();

        echo json_encode([
            'success' => true,
            'cargos' => $cargos
        ]);

    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error al cargar cargos CET: ' . $e->getMessage()
        ]);
    }
?>