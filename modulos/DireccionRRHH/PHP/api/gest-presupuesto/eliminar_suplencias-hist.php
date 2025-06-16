<?php
    header('Content-Type: application/json');
    require_once '../../../conexion/conexion.php';
    require_once '../validar-jwt-js.php';

    $data = json_decode(file_get_contents('php://input'), true);
    $usuarioResponsable = $decoded->data->cedula; // Cédula del usuario logueado desde JWT

    if (!isset($data['sup_ide'])) {
        echo json_encode(['success' => false, 'message' => 'ID de suplencia no proporcionado']);
        exit;
    }

    $sup_ide = $data['sup_ide'];

    try {

        // Establecer el usuario responsable en MySQL
        $pdo->exec("SET @usuario_php = " . $pdo->quote($usuarioResponsable));

        // Verificar si existe la suplencia
        $checkStmt = $pdo->prepare("SELECT sup_ide FROM tessup WHERE sup_ide = ?");
        $checkStmt->execute([$sup_ide]);
        
        if ($checkStmt->rowCount() === 0) {
            echo json_encode(['success' => false, 'message' => 'La suplencia no existe']);
            exit;
        }

        // Eliminar la suplencia
        $deleteStmt = $pdo->prepare("DELETE FROM tessup WHERE sup_ide = ?");
        $deleteStmt->execute([$sup_ide]);

        echo json_encode([
            'success' => true,
            'message' => 'Suplencia eliminada correctamente'
        ]);

    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error al eliminar la suplencia: ' . $e->getMessage()
        ]);
    }
?>