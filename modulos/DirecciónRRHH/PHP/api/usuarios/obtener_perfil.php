<?php
    require_once '../validar-jwt-js.php';

    if (!isset($decoded) || !isset($decoded->data->id)) {
        header('HTTP/1.1 401 Unauthorized');
        exit;
    }

    require_once '../../../conexion/conexion.php';

    try {
        $id = $decoded->data->id;
        $query = "SELECT * FROM tesusu WHERE usu_ide = ?";
        $stmt = $pdo->prepare($query);
        $stmt->execute([$id]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$usuario) {
            header('HTTP/1.1 404 Not Found');
            echo json_encode(['error' => 'Usuario no encontrado']);
            exit;
        }

        header('Content-Type: application/json');
        echo json_encode($usuario);
    } catch (PDOException $e) {
        header('HTTP/1.1 500 Internal Server Error');
        echo json_encode(['error' => $e->getMessage()]);
    }