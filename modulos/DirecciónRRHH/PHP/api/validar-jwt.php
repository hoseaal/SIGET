<?php
    require_once '../../../vendor/autoload.php';

    use Firebase\JWT\JWT;
    use Firebase\JWT\Key;

    $secretKey = 'C0ntr@l0r!aD3lEst4d0T@ch!r@';

    // Leer el token desde la cookie
    $token = $_COOKIE['token'] ?? null;

    if (!$token) {
        // Solo redirigir si no estamos ya en la página de login
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
            if ($tipo == 4) {
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