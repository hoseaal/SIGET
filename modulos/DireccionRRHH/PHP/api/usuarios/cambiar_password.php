<?php
    require_once '../validar-jwt-js.php';

    if (!isset($decoded) || !isset($decoded->data->cedula)) {
        header('HTTP/1.1 401 Unauthorized');
        exit;
    }

    require_once '../../../conexion/conexion.php';

    header('Content-Type: application/json');

    // Obtener datos del POST
    $data = json_decode(file_get_contents('php://input'), true);
    $nuevaPassword = $data['nuevaPassword'] ?? '';

    if (empty($nuevaPassword)) {
        echo json_encode(['success' => false, 'message' => 'La nueva contraseña es requerida']);
        exit;
    }

    try {
        // Obtener cédula del usuario del token
        $cedula = $decoded->data->cedula;
        
        // Hashear la nueva contraseña con el mismo algoritmo que en registro
        $hashedPassword = password_hash($nuevaPassword, PASSWORD_BCRYPT, ['cost' => 12]);
        
        // Actualizar la contraseña en la base de datos
        $stmt = $pdo->prepare("UPDATE tesusu SET usu_con = ? WHERE nom_ced = ?");
        $stmt->execute([$hashedPassword, $cedula]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'Contraseña actualizada correctamente']);
        } else {
            echo json_encode(['success' => false, 'message' => 'No se pudo actualizar la contraseña']);
        }
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error al actualizar la contraseña: ' . $e->getMessage()
        ]);
    }