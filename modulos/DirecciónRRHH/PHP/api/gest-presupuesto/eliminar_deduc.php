<?php
    require_once '../../../conexion/conexion.php';
    require_once '../validar-jwt-js.php';

    header('Content-Type: application/json');

    try {
        $data = json_decode(file_get_contents('php://input'), true);
        $usuarioResponsable = $decoded->data->cedula; // Usuario del JWT
        
        if (!$data || !isset($data['ded_id'])) {
            throw new Exception('Datos no recibidos o incompletos');
        }

        $dedId = (int)$data['ded_id'];

        // Verificar si la deducción existe
        $checkQuery = $pdo->prepare("SELECT COUNT(*) FROM tesded WHERE ded_ide = :ded_id");
        $checkQuery->bindParam(':ded_id', $dedId, PDO::PARAM_INT);
        $checkQuery->execute();
        
        if ($checkQuery->fetchColumn() == 0) {
            throw new Exception('La deducción no existe');
        }

        // Iniciar transacción
        $pdo->beginTransaction();

        try {

            // Establecer usuario responsable en MySQL
            $pdo->exec("SET @usuario_php = " . $pdo->quote($usuarioResponsable));
            
            // Preparar la consulta de eliminación
            $query = $pdo->prepare("DELETE FROM tesded WHERE ded_ide = :ded_id");
            $query->bindParam(':ded_id', $dedId, PDO::PARAM_INT);
            
            if (!$query->execute()) {
                throw new Exception('Error al ejecutar la eliminación');
            }

            $pdo->commit();

            echo json_encode([
                'success' => true,
                'message' => 'Deducción eliminada correctamente'
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