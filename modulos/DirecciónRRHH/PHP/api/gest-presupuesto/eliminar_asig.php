<?php
    require_once '../../../conexion/conexion.php';
    require_once '../validar-jwt-js.php';

    header('Content-Type: application/json');

    try {
        $data = json_decode(file_get_contents('php://input'), true);
        $usuarioResponsable = $decoded->data->cedula; // Cédula del JWT
        
        if (!$data || !isset($data['pri_ide'])) {
            throw new Exception('Datos no recibidos o incompletos');
        }

        $pri_ide = $data['pri_ide'];

        // Verificar si la asignación existe
        $checkQuery = $pdo->prepare("SELECT COUNT(*) FROM tespri WHERE pri_ide = :pri_ide");
        $checkQuery->bindParam(':pri_ide', $pri_ide);
        $checkQuery->execute();
        
        if ($checkQuery->fetchColumn() == 0) {
            throw new Exception('La asignación no existe');
        }

        // Establecer usuario responsable
        $pdo->exec("SET @usuario_php = " . $pdo->quote($usuarioResponsable));

        // Iniciar transacción
        $pdo->beginTransaction();

        try {
            // Preparar la consulta de eliminación
            $query = $pdo->prepare("DELETE FROM tespri WHERE pri_ide = :pri_ide");
            $query->bindParam(':pri_ide', $pri_ide);
            
            if (!$query->execute()) {
                throw new Exception('Error al ejecutar la eliminación');
            }

            $pdo->commit();

            echo json_encode([
                'success' => true,
                'message' => 'Asignación eliminada correctamente',
                'pri_ide' => $pri_ide
            ]);
            
        } catch (Exception $e) {
            $pdo->rollBack();
            throw $e;
        }
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error en la base de datos: ' . $e->getMessage()
        ]);
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
?>