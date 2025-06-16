<?php
    header('Content-Type: application/json');
    require_once '../../../conexion/conexion.php';

    // Leer el input JSON
    $input = json_decode(file_get_contents('php://input'), true);

    // Validar datos
    if (!isset($input['dep_ide'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID de departamento no proporcionado']);
        exit;
    }

    $dep_ide = (int)$input['dep_ide'];

    if ($dep_ide <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID de departamento inválido']);
        exit;
    }

    try {
        // Verificar si existe el departamento
        $stmt = $pdo->prepare("SELECT dep_nom FROM tesdep WHERE dep_ide = ?");
        $stmt->execute([$dep_ide]);
        $departamento = $stmt->fetch();

        if (!$departamento) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Departamento no encontrado']);
            exit;
        }

        // Verificar si hay trabajadores en este departamento
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM tmanom WHERE dep_ide = ?");
        $stmt->execute([$dep_ide]);
        $trabajadoresCount = $stmt->fetchColumn();

        if ($trabajadoresCount > 0) {
            http_response_code(409); // Código 409 Conflict
            echo json_encode([
                'success' => false,
                'message' => 'No puede eliminar el departamento "' . $departamento['dep_nom'] . 
                            '", cambie de área a los ' . $trabajadoresCount . 
                            ' trabajador(es) que lo conforman'
            ]);
            exit;
        }

        // Eliminar departamento (solo si no tiene trabajadores)
        $stmt = $pdo->prepare("DELETE FROM tesdep WHERE dep_ide = ?");
        $success = $stmt->execute([$dep_ide]);

        if ($success && $stmt->rowCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Departamento "' . $departamento['dep_nom'] . '" eliminado correctamente'
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Error al eliminar el departamento'
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