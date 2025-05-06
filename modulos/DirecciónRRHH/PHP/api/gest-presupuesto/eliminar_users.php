<?php
    require_once '../../../conexion/conexion.php';

    header('Content-Type: application/json');

    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data || !isset($data['user_id'])) {
            throw new Exception('Datos no recibidos o incompletos');
        }

        $userId = $data['user_id'];

        // Verificar si el usuario existe
        $checkQuery = $pdo->prepare("SELECT COUNT(*) FROM tesusu WHERE usu_ide = :user_id");
        $checkQuery->bindParam(':user_id', $userId);
        $checkQuery->execute();
        
        if ($checkQuery->fetchColumn() == 0) {
            throw new Exception('El usuario no existe');
        }

        // Iniciar transacción
        $pdo->beginTransaction();

        try {
            // Eliminar usuario
            $query = $pdo->prepare("DELETE FROM tesusu WHERE usu_ide = :user_id");
            $query->bindParam(':user_id', $userId);
            
            if (!$query->execute()) {
                throw new Exception('Error al ejecutar la eliminación');
            }

            $pdo->commit();

            echo json_encode([
                'success' => true,
                'message' => 'Usuario eliminado correctamente'
            ]);
            
        } catch (Exception $e) {
            $pdo->rollBack();
            throw $e;
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