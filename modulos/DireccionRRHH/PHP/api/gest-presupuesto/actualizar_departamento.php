<?php
    header('Content-Type: application/json');
    require_once '../../../conexion/conexion.php';

    // Leer el input JSON
    $input = json_decode(file_get_contents('php://input'), true);

    // Validar datos
    if (!isset($input['dep_ide']) || !isset($input['dep_nom'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
        exit;
    }

    $dep_ide = (int)$input['dep_ide'];
    $dep_nom = trim($input['dep_nom']);
    $dep_des = isset($input['dep_des']) ? trim($input['dep_des']) : null;

    if ($dep_ide <= 0 || empty($dep_nom)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Datos inválidos']);
        exit;
    }

    try {
        // Verificar si existe el departamento
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM tesdep WHERE dep_ide = ?");
        $stmt->execute([$dep_ide]);
        
        if ($stmt->fetchColumn() == 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Departamento no encontrado']);
            exit;
        }

        // Actualizar departamento
        $stmt = $pdo->prepare("UPDATE tesdep SET dep_nom = ?, dep_des = ? WHERE dep_ide = ?");
        $success = $stmt->execute([$dep_nom, $dep_des, $dep_ide]);

        if ($success) {
            echo json_encode([
                'success' => true,
                'message' => 'Departamento actualizado correctamente'
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error al actualizar el departamento'
            ]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error en la base de datos: ' . $e->getMessage()
        ]);
    }
?>