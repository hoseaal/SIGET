<?php
    require_once '../../../conexion/conexion.php';

    header('Content-Type: application/json');

    try {
        // Consulta para obtener todos los cargos ONAPRE
        $query = $pdo->query("SELECT ona_ide, ona_car FROM tesona ORDER BY ona_car");
        $cargos = $query->fetchAll(PDO::FETCH_ASSOC);

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