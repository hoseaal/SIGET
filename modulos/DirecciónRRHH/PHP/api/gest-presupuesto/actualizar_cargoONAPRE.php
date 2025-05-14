<?php
    header('Content-Type: application/json');
    require_once '../../../conexion/conexion.php';

    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['position_id']) || !isset($input['new_name'])) {
        echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
        exit;
    }

    $positionId = $input['position_id'];
    $newName = trim($input['new_name']);

    if (empty($newName)) {
        echo json_encode(['success' => false, 'message' => 'El nombre no puede estar vacío']);
        exit;
    }

    try {
        // Verificar si el cargo existe
        $stmt = $pdo->prepare("SELECT ona_ide FROM tesona WHERE ona_ide = ?");
        $stmt->execute([$positionId]);
        
        if ($stmt->rowCount() === 0) {
            echo json_encode(['success' => false, 'message' => 'El cargo no existe']);
            exit;
        }
        
        // Actualizar el cargo
        $stmt = $pdo->prepare("UPDATE tesona SET ona_car = ? WHERE ona_ide = ?");
        $stmt->execute([$newName, $positionId]);
        
        echo json_encode(['success' => true, 'message' => 'Cargo actualizado correctamente']);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Error en la base de datos: ' . $e->getMessage()]);
    }
?>