<?php
    require_once '../../../conexion/conexion.php';

    header('Content-Type: application/json');

    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data || !isset($data['position_id'])) {
            throw new Exception('Datos no recibidos o incompletos');
        }

        $positionId = $data['position_id'];

        // Verificar si el cargo existe
        $checkQuery = $pdo->prepare("SELECT COUNT(*) FROM tescet WHERE cet_ide = :position_id");
        $checkQuery->bindParam(':position_id', $positionId, PDO::PARAM_INT);
        $checkQuery->execute();
        
        if ($checkQuery->fetchColumn() == 0) {
            throw new Exception('El cargo no existe');
        }

        // Preparar la consulta de eliminación
        $query = $pdo->prepare("DELETE FROM tescet WHERE cet_ide = :position_id");
        $query->bindParam(':position_id', $positionId, PDO::PARAM_INT);
        
        if ($query->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Cargo eliminado correctamente'
            ]);
        } else {
            throw new Exception('Error al ejecutar la eliminación');
        }
        
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error en la base de datos: ' . $e->getMessage()
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
?>