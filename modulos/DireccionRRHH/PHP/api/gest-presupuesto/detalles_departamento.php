<?php
    header('Content-Type: application/json');
    require_once '../../../conexion/conexion.php';

    // Validar parámetro
    $dep_ide = isset($_GET['dep_ide']) ? (int)$_GET['dep_ide'] : 0;

    if ($dep_ide <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID de departamento inválido']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("SELECT dep_ide, dep_nom, dep_des FROM tesdep WHERE dep_ide = ?");
        $stmt->execute([$dep_ide]);
        $departamento = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($departamento) {
            echo json_encode([
                'success' => true,
                'department' => $departamento
            ]);
        } else {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Departamento no encontrado'
            ]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al obtener detalles del departamento: ' . $e->getMessage()
        ]);
    }
?>