<?php
    require_once '../../../conexion/conexion.php';
    require_once '../validar-jwt-js.php';

    header('Content-Type: application/json');

    if (http_response_code() !== 200) {
        exit; 
    }

    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data || !isset($data['user_id']) || !isset($data['user_type']) || !isset($data['access_type'])) {
            throw new Exception('Datos no recibidos o incompletos');
        }

        $userId = $data['user_id'];
        $userType = $data['user_type'];
        $accessType = $data['access_type'];
        $usuarioResponsable = $decoded->data->cedula;
        
        // Nueva contraseña (opcional)
        $newPassword = isset($data['password']) ? $data['password'] : null;

        // 1. Establecer el usuario responsable en MySQL
        $pdo->exec("SET @usuario_php = " . $pdo->quote($usuarioResponsable));

        // Verificar si el usuario existe
        $checkQuery = $pdo->prepare("SELECT COUNT(*) FROM tesusu WHERE usu_ide = :user_id");
        $checkQuery->bindParam(':user_id', $userId);
        $checkQuery->execute();
        
        if ($checkQuery->fetchColumn() == 0) {
            throw new Exception('El usuario no existe');
        }

        // Validar la nueva contraseña si se proporcionó
        if ($newPassword !== null) {
            if (strlen($newPassword) < 8) {
                throw new Exception('La contraseña debe tener al menos 8 caracteres');
            }
            $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 12]);
        }

        // Iniciar transacción
        $pdo->beginTransaction();

        try {
            // Construir la consulta de actualización
            if ($newPassword !== null) {
                // Actualizar tipo de usuario, tipo de acceso y contraseña
                $query = $pdo->prepare("UPDATE tesusu SET usu_tip = :user_type, usu_mod = :access_type, usu_con = :password WHERE usu_ide = :user_id");
                $query->bindParam(':password', $hashedPassword);
            } else {
                // Actualizar tipo de usuario y tipo de acceso
                $query = $pdo->prepare("UPDATE tesusu SET usu_tip = :user_type, usu_mod = :access_type WHERE usu_ide = :user_id");
            }
            
            $query->bindParam(':user_type', $userType);
            $query->bindParam(':access_type', $accessType);
            $query->bindParam(':user_id', $userId);
            
            if (!$query->execute()) {
                throw new Exception('Error al actualizar el usuario');
            }

            $pdo->commit();

            echo json_encode([
                'success' => true,
                'message' => 'Usuario actualizado correctamente' . ($newPassword !== null ? ' (incluyendo contraseña)' : '')
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