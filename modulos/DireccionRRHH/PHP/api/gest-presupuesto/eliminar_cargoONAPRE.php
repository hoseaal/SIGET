<?php
    header('Content-Type: application/json');
    require_once '../../../conexion/conexion.php';
    require_once '../validar-jwt-js.php';

    try {
        // Obtener datos del cuerpo de la solicitud
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validar datos
        if (!isset($data['position_id']) || empty($data['position_id'])) {
            throw new Exception('ID del cargo es requerido');
        }
        
        // Obtener usuario responsable del JWT
        $usuarioResponsable = $decoded->data->cedula;
        
        // Establecer variable de usuario en MySQL
        $pdo->exec("SET @usuario_php = " . $pdo->quote($usuarioResponsable));

        $positionId = (int)$data['position_id'];
        
        // Verificar si el cargo existe
        $stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM tesona WHERE ona_ide = :positionId");
        $stmtCheck->bindParam(':positionId', $positionId);
        $stmtCheck->execute();
        
        if ($stmtCheck->fetchColumn() == 0) {
            throw new Exception('El cargo ONAPRE no existe');
        }
        
        // Verificar si hay trabajadores con este cargo en tmanom
        $stmtCheckWorkers = $pdo->prepare("
            SELECT COUNT(*) 
            FROM tmanom 
            WHERE ona_ide = :positionId 
        ");
        $stmtCheckWorkers->bindParam(':positionId', $positionId);
        $stmtCheckWorkers->execute();
        
        $activeWorkersCount = $stmtCheckWorkers->fetchColumn();
        
        if ($activeWorkersCount > 0) {
            $response = [
                'success' => false,
                'message' => "No puede eliminar un cargo, el cual contiene trabajadores en activo; por favor, reasigne los $activeWorkersCount trabajadores(as).",
                'has_active_workers' => true
            ];
        } else {
            // Eliminar el cargo solo si no hay trabajadores activos
            $stmt = $pdo->prepare("DELETE FROM tesona WHERE ona_ide = :positionId");
            $stmt->bindParam(':positionId', $positionId);
            $stmt->execute();
            
            $response = [
                'success' => true,
                'message' => 'Cargo ONAPRE eliminado correctamente',
                'has_active_workers' => false
            ];
        }
        
    } catch (Exception $e) {
        $response = [
            'success' => false,
            'message' => 'Error al eliminar el cargo ONAPRE: ' . $e->getMessage(),
            'has_active_workers' => false
        ];
    }

    echo json_encode($response);
?>