<?php
    require_once '../validar-jwt-js.php';

    if (!isset($decoded) || !isset($decoded->data->cedula)) {
        header('HTTP/1.1 401 Unauthorized');
        exit;
    }

    require_once '../../../conexion/conexion.php';

    try {
        $cedula = $decoded->data->cedula;
        
        $query = "SELECT COUNT(*) as existe FROM tmanom WHERE nom_ced = ?";
        $stmt = $pdo->prepare($query);
        $stmt->execute([$cedula]);
        $resultado = $stmt->fetch(PDO::FETCH_ASSOC);

        header('Content-Type: application/json');
        echo json_encode(['enNomina' => $resultado['existe'] > 0]);
    } catch (PDOException $e) {
        header('HTTP/1.1 500 Internal Server Error');
        echo json_encode(['error' => $e->getMessage()]);
    }