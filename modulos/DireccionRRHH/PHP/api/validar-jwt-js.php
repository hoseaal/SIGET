<?php
    require_once '../../../../../vendor/autoload.php';

    use Firebase\JWT\JWT;
    use Firebase\JWT\Key;

    // Cargar variables de entorno
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../../../../');
    $dotenv->load();

    $secretKey = $_ENV['JWT_SECRET_KEY'];

    $token = $_COOKIE['token'] ?? null;

    if (!$token) {
        if (basename($_SERVER['PHP_SELF']) != 'auth-login-basic.php') {
            header('Location: auth-login-basic.php');
            exit;
        }
        return;
    }

    try {
        $decoded = JWT::decode($token, new Key($secretKey, 'HS256'));
        
        // Verificación de expiración
        if (isset($decoded->exp) && $decoded->exp < time()) {
            header('Location: auth-login-basic.php');
            exit;
        }
        
        $GLOBALS['decoded'] = $decoded;
        
        http_response_code(200);
        
    } catch (Exception $e) {
        http_response_code(401);
        header('Content-Type: application/json');
        die(json_encode(['success' => false, 'message' => 'Token inválido: ' . $e->getMessage()]));
    }
?>