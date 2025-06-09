<?php
    require_once '../../../../vendor/autoload.php';

    use Firebase\JWT\JWT;
    use Firebase\JWT\Key;

    header('Content-Type: application/json');

    $secretKey = 'C0ntr@l0r!aD3lEst4d0T@ch!r@';
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