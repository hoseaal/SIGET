<?php
    header('Content-Type: application/json');
    require_once '../../../conexion/conexion.php';

    try {
        // Obtener datos del cuerpo de la solicitud
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validar datos
        if (!isset($data['position_name']) || empty(trim($data['position_name']))) {
            throw new Exception('El nombre del cargo es requerido');
        }
        
        $positionName = trim($data['position_name']);
        
        // Verificar si el cargo ya existe
        $stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM tesona WHERE ona_car = :positionName");
        $stmtCheck->bindParam(':positionName', $positionName);
        $stmtCheck->execute();
        
        if ($stmtCheck->fetchColumn() > 0) {
            throw new Exception('El cargo ONAPRE ya existe');
        }
        
        // Insertar nuevo cargo
        $stmt = $pdo->prepare("INSERT INTO tesona (ona_car) VALUES (:positionName)");
        $stmt->bindParam(':positionName', $positionName);
        $stmt->execute();
        
        $response = [
            'success' => true,
            'message' => 'Cargo ONAPRE agregado correctamente',
            'position_id' => $pdo->lastInsertId()
        ];
        
    } catch (Exception $e) {
        $response = [
            'success' => false,
            'message' => 'Error al agregar el cargo ONAPRE: ' . $e->getMessage()
        ];
    }

    echo json_encode($response);
?>