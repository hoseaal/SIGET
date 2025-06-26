<?php
    // Destrucción total de la sesión
    if (session_status() === PHP_SESSION_NONE) session_start();
    $_SESSION = [];
    session_unset();
    session_destroy();

    // Eliminación de cookies
    setcookie('token', '', [
        'expires' => time() - 3600,
        'path' => '/',
        'domain' => '',
        'secure' => false, 
        'httponly' => true,
        'samesite' => 'Lax'
    ]);

    $redirectUrl = '/SIGET/modulos/DireccionRRHH/html/auth-login-basic.php';

    header("Location: $redirectUrl");
    exit;
?>