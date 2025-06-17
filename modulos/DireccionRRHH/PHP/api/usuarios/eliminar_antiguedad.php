<?php
header('Content-Type: application/json');
require_once '../../../conexion/conexion.php';

$input = json_decode(file_get_contents('php://input'), true);
$antId = $input['ant_ide'] ?? null;

if (!$antId) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'ID de antigüedad no proporcionado'
    ]);
    exit;
}

try {
    // Verificar primero que el registro existe
    $stmt = $pdo->prepare("SELECT * FROM tesant WHERE ant_ide = ?");
    $stmt->execute([$antId]);
    $antiguedad = $stmt->fetch();

    if (!$antiguedad) {
        http_response_code(404);
        echo json_encode([
            'status' => 'error',
            'message' => 'El registro de antigüedad no existe'
        ]);
        exit;
    }

    // Eliminar el registro
    $stmt = $pdo->prepare("DELETE FROM tesant WHERE ant_ide = ?");
    $stmt->execute([$antId]);

    echo json_encode([
        'status' => 'success',
        'message' => 'Antigüedad eliminada correctamente'
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Error al eliminar la antigüedad: ' . $e->getMessage()
    ]);
}