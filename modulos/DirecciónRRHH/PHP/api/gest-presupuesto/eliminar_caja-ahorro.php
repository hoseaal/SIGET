<?php
    header('Content-Type: application/json');
    require_once '../../../conexion/conexion.php';

    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['cep_ide'])) {
            throw new Exception('ID de trabajador no proporcionado');
        }

        $cep_ide = $data['cep_ide'];

        // Verificar si existe el registro
        $checkQuery = "SELECT COUNT(*) FROM tescep WHERE cep_ide = :cep_ide";
        $checkStmt = $pdo->prepare($checkQuery);
        $checkStmt->bindParam(':cep_ide', $cep_ide, PDO::PARAM_INT);
        $checkStmt->execute();

        if ($checkStmt->fetchColumn() == 0) {
            throw new Exception('El registro no existe');
        }

        // Eliminar el registro
        $deleteQuery = "DELETE FROM tescep WHERE cep_ide = :cep_ide";
        $deleteStmt = $pdo->prepare($deleteQuery);
        $deleteStmt->bindParam(':cep_ide', $cep_ide, PDO::PARAM_INT);
        $deleteStmt->execute();

        echo json_encode([
            'success' => true,
            'message' => 'Trabajador eliminado de la caja de ahorro correctamente'
        ]);

    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error al eliminar: ' . $e->getMessage()
        ]);
    }
?>