<?php
require_once '../../../vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$secretKey = 'C0ntr@l0r!aD3lEst4d0T@ch!r@';

// Leer el token desde la cookie
$token = $_COOKIE['token'] ?? null;

if (!$token) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Token no proporcionado.']);
    exit;
}

try {
    $decoded = JWT::decode($token, new Key($secretKey, 'HS256'));
    // IMPORTANTE: exportamos $decoded para que el archivo que lo incluya pueda usarlo
    // Si estás usando PHP 7.1+, no necesitas hacer nada más
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Token inválido: ' . $e->getMessage()]);
    exit;
}