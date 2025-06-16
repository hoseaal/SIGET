<?php
    require_once '../../../conexion/conexion.php';
    require_once '../validar-jwt-js.php';
    header('Content-Type: application/json');

    try {
        $data = json_decode(file_get_contents('php://input'), true);
        $usuarioResponsable = $decoded->data->cedula; // Cédula del JWT
        
        if (!$data || !isset($data['pri_ide']) || !isset($data['pri_raz']) || !isset($data['pri_por'])) {
            throw new Exception('Datos incompletos');
        }

        // Validar datos
        if (empty($data['pri_raz']) || !is_numeric($data['pri_por'])) {
            throw new Exception('Datos inválidos');
        }

        // Establecer usuario responsable
        $pdo->exec("SET @usuario_php = " . $pdo->quote($usuarioResponsable));

        // Iniciar transacción
        $pdo->beginTransaction();

        try {
            $query = $pdo->prepare("
                UPDATE tespri SET
                    pri_raz = :pri_raz,
                    pri_por = :pri_por
                WHERE pri_ide = :pri_ide
            ");
            
            $query->execute([
                ':pri_raz' => $data['pri_raz'],
                ':pri_por' => $data['pri_por'],
                ':pri_ide' => $data['pri_ide']
            ]);

            $pdo->commit();

            echo json_encode([
                'success' => true,
                'message' => 'Asignación actualizada correctamente',
                'pri_ide' => $data['pri_ide']
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