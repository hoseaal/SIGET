<?php
    require_once '../../../../../vendor/autoload.php';

    use Firebase\JWT\JWT;
    use Firebase\JWT\Key;

    $secretKey = 'C0ntr@l0r!aD3lEst4d0T@ch!r@';

    // Leer el token desde la cookie
    $token = $_COOKIE['token'] ?? null;

    if (!$token) {
        http_response_code(401);
        header('Content-Type: application/json');
        die(json_encode(['success' => false, 'message' => 'Token no proporcionado.']));
    }

    try {
        $decoded = JWT::decode($token, new Key($secretKey, 'HS256'));
        $GLOBALS['decoded'] = $decoded;
        
        // Restablecer código de respuesta exitoso
        http_response_code(200);
        
    } catch (Exception $e) {
        http_response_code(401);
        header('Content-Type: application/json');
        die(json_encode(['success' => false, 'message' => 'Token inválido: ' . $e->getMessage()]));
    }
?>