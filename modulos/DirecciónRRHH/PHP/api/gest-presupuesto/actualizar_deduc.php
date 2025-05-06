<?php
    require_once '../../../conexion/conexion.php';

    header('Content-Type: application/json');

    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data) {
            throw new Exception('No se recibieron datos');
        }

        // Validar datos recibidos
        if (!isset($data['ded_id']) || !isset($data['ded_raz']) || !isset($data['ded_por'])) {
            throw new Exception('Datos incompletos');
        }

        $dedId = (int)$data['ded_id'];
        $dedRaz = trim($data['ded_raz']);
        $dedPor = (float)$data['ded_por'];

        if (empty($dedRaz) || $dedPor < 0) {
            throw new Exception('Datos inválidos');
        }

        // Iniciar transacción
        $pdo->beginTransaction();

        try {
            // Verificar si la deducción existe
            $checkQuery = $pdo->prepare("SELECT COUNT(*) FROM tesded WHERE ded_ide = :ded_id");
            $checkQuery->bindParam(':ded_id', $dedId, PDO::PARAM_INT);
            $checkQuery->execute();
            
            if ($checkQuery->fetchColumn() == 0) {
                throw new Exception('La deducción no existe');
            }

            // Actualizar la deducción
            $query = $pdo->prepare("
                UPDATE tesded SET
                    ded_raz = :ded_raz,
                    ded_por = :ded_por
                WHERE ded_ide = :ded_id
            ");
            
            $query->bindParam(':ded_raz', $dedRaz);
            $query->bindParam(':ded_por', $dedPor);
            $query->bindParam(':ded_id', $dedId, PDO::PARAM_INT);
            
            if (!$query->execute()) {
                throw new Exception('Error al actualizar la deducción');
            }

            $pdo->commit();

            echo json_encode([
                'success' => true,
                'message' => 'Deducción actualizada correctamente'
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