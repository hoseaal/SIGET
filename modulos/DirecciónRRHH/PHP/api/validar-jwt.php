<?php
    require_once '../../../vendor/autoload.php';

    use Firebase\JWT\JWT;
    use Firebase\JWT\Key;

    $secretKey = 'C0ntr@l0r!aD3lEst4d0T@ch!r@';

    // Leer el token desde la cookie
    $token = $_COOKIE['token'] ?? null;

    if (!$token) {
        header('Location: auth-login-basic.php');
        exit;
    }

    try {
        // Hacemos que $decoded esté disponible globalmente
        $decoded = JWT::decode($token, new Key($secretKey, 'HS256'));
        // Lo guardamos en una variable global para usarla en otras partes
        $GLOBALS['decoded'] = $decoded;

    } catch (Exception $e) {
        header('Location: auth-login-basic.php');
        exit;
    }