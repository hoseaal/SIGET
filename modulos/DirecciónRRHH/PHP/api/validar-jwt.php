<?php
    require_once '../../../vendor/autoload.php';

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
        
        // Si estamos en la página de login y el token es válido, redirigir
        if (basename($_SERVER['PHP_SELF']) == 'auth-login-basic.php') {
            $tipo = $decoded->data->tipo;
            if ($tipo == 5) {
                header('Location: index.php');
            } else {
                header('Location: index_usur.php');
            }
            exit;
        }

    } catch (Exception $e) {
        // Solo redirigir si no estamos ya en la página de login
        if (basename($_SERVER['PHP_SELF']) != 'auth-login-basic.php') {
            header('Location: auth-login-basic.php');
            exit;
        }
    }