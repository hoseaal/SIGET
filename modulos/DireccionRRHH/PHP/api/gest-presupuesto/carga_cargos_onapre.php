<?php
    header('Content-Type: application/json');
    require_once '../../../conexion/conexion.php';

    try {
        $query = "SELECT ona_ide, ona_car FROM tesona ORDER BY ona_car";
        $stmt = $pdo->query($query);
        $cargos = $stmt->fetchAll();

        echo json_encode([
            'success' => true,
            'cargos' => $cargos
        ]);

    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error al cargar cargos ONAPRE: ' . $e->getMessage()
        ]);
    }
?>