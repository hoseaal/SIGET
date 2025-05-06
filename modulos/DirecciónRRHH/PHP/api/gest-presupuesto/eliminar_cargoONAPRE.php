<?php
    header('Content-Type: application/json');
    require_once '../../../conexion/conexion.php';

    try {
        // Obtener datos del cuerpo de la solicitud
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validar datos
        if (!isset($data['position_id']) || empty($data['position_id'])) {
            throw new Exception('ID del cargo es requerido');
        }
        
        $positionId = (int)$data['position_id'];
        
        // Verificar si el cargo existe
        $stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM tesona WHERE ona_ide = :positionId");
        $stmtCheck->bindParam(':positionId', $positionId);
        $stmtCheck->execute();
        
        if ($stmtCheck->fetchColumn() == 0) {
            throw new Exception('El cargo ONAPRE no existe');
        }
        
        // Eliminar el cargo
        $stmt = $pdo->prepare("DELETE FROM tesona WHERE ona_ide = :positionId");
        $stmt->bindParam(':positionId', $positionId);
        $stmt->execute();
        
        $response = [
            'success' => true,
            'message' => 'Cargo ONAPRE eliminado correctamente'
        ];
        
    } catch (Exception $e) {
        $response = [
            'success' => false,
            'message' => 'Error al eliminar el cargo ONAPRE: ' . $e->getMessage()
        ];
    }

    echo json_encode($response);
?>