<?php
    header('Content-Type: application/json');
    require_once '../../../conexion/conexion.php';

    try {
        $query = "SELECT nom_ced, CONCAT(nom_nom, ' ', nom_ape) as nom_nom FROM tmanom ORDER BY nom_nom, nom_ape";
        $stmt = $pdo->query($query);
        $empleados = $stmt->fetchAll();

        echo json_encode([
            'success' => true,
            'empleados' => $empleados
        ]);

    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error al cargar empleados: ' . $e->getMessage()
        ]);
    }
?>