<?php
    header('Content-Type: application/json');
    require_once '../../../conexion/conexion.php';

    // Leer el input JSON
    $input = json_decode(file_get_contents('php://input'), true);

    // Validar datos
    if (!isset($input['dep_nom'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
        exit;
    }

    $dep_nom = trim($input['dep_nom']);
    $dep_des = isset($input['dep_des']) ? trim($input['dep_des']) : null;

    if (empty($dep_nom)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Nombre de departamento inválido']);
        exit;
    }

    try {
        // Verificar si ya existe un departamento con el mismo nombre
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM tesdep WHERE dep_nom = ?");
        $stmt->execute([$dep_nom]);
        
        if ($stmt->fetchColumn() > 0) {
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => 'Ya existe un departamento con ese nombre']);
            exit;
        }

        // Insertar nuevo departamento
        $stmt = $pdo->prepare("INSERT INTO tesdep (dep_nom, dep_des) VALUES (?, ?)");
        $success = $stmt->execute([$dep_nom, $dep_des]);

        if ($success) {
            $nuevoId = $pdo->lastInsertId();
            
            echo json_encode([
                'success' => true,
                'message' => 'Departamento creado correctamente',
                'dep_ide' => $nuevoId
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error al crear el departamento'
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