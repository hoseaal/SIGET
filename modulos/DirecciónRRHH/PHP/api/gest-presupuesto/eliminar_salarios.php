<?php
    require_once '../../../conexion/conexion.php';

    header('Content-Type: application/json');

    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data || !isset($data['nvl_ide'])) {
            throw new Exception('Datos no recibidos o incompletos');
        }

        $nvl_ide = $data['nvl_ide'];

        // Verificar si el registro existe
        $checkQuery = $pdo->prepare("SELECT COUNT(*) FROM tesnvl WHERE nvl_ide = :nvl_ide");
        $checkQuery->bindParam(':nvl_ide', $nvl_ide, PDO::PARAM_INT);
        $checkQuery->execute();
        
        if ($checkQuery->fetchColumn() == 0) {
            throw new Exception('El nivel salarial no existe');
        }

        // Iniciar transacción
        $pdo->beginTransaction();

        try {
            // Preparar la consulta de eliminación
            $query = $pdo->prepare("DELETE FROM tesnvl WHERE nvl_ide = :nvl_ide");
            $query->bindParam(':nvl_ide', $nvl_ide, PDO::PARAM_INT);
            
            if (!$query->execute()) {
                throw new Exception('Error al ejecutar la eliminación');
            }

            $pdo->commit();

            echo json_encode([
                'success' => true,
                'message' => 'Nivel salarial eliminado correctamente',
                'nvl_ide' => $nvl_ide
            ]);
            
        } catch (Exception $e) {
            $pdo->rollBack();
            throw $e;
        }
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error en la base de datos: ' . $e->getMessage(),
            'error_code' => $e->getCode()
        ]);
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
?>