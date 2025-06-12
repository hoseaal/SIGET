<?php
    require_once '../../../../vendor/autoload.php';

    use Firebase\JWT\JWT;
    use Firebase\JWT\Key;

    header('Content-Type: application/json');

    // Cargar variables de entorno
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../../../../');
    $dotenv->load();

    $secretKey = $_ENV['JWT_SECRET_KEY'];

    $token = $_COOKIE['token'] ?? null;

    if (!$token) {
        echo json_encode(['status' => 'expired']);
        exit;
    }

    try {
        $decoded = JWT::decode($token, new Key($secretKey, 'HS256'));
        $currentTime = time();
        
        if (isset($decoded->exp) && $decoded->exp < $currentTime) {
            echo json_encode(['status' => 'expired']);
        } else {
            echo json_encode(['status' => 'valid']);
        }
    } catch (Exception $e) {
        echo json_encode(['status' => 'expired']);
    }