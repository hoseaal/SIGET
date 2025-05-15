<?php
require_once '../../conexion/conexion.php';
header('Content-Type: application/json');

// Obtener datos del formulario
$cedula = $_POST['Cedula'] ?? '';
$password = $_POST['password'] ?? '';
$tip =  $_POST['tip'] ?? '';

if (empty($cedula) || empty($password) || empty($tip)) {
    echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios.']);
    exit;
}

if (!$pdo) {
    echo json_encode(['success' => false, 'message' => 'Error en la conexión a la base de datos.']);
    exit;
}

try {
    // ✅ Verificar si la cédula existe en la nómina
    $verificarNomina = $pdo->prepare("SELECT * FROM tmanom WHERE nom_ced = :cedula");
    $verificarNomina->bindParam(':cedula', $cedula);
    $verificarNomina->execute();

    if ($verificarNomina->rowCount() === 0) {
        echo json_encode(['success' => false, 'message' => 'El usuario que intenta añadir no existe en nómina.']);
        exit;
    }

    // Verificar si ya existe la cédula en la tabla de usuarios
    $check = $pdo->prepare("SELECT * FROM tesusu WHERE nom_ced = :cedula");
    $check->bindParam(':cedula', $cedula);
    $check->execute();

    if ($check->rowCount() > 0) {
        echo json_encode(['success' => false, 'message' => 'La cédula ya está registrada.']);
        exit;
    }

    // Hash de la contraseña
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Insertar nuevo usuario
    $stmt = $pdo->prepare("INSERT INTO tesusu (usu_ide, usu_con, usu_tip, nom_ced) VALUES (:cedula, :contrasena, :tip, :cedula)");
    $stmt->bindParam(':contrasena', $hashedPassword);
    $stmt->bindParam(':tip', $tip);
    $stmt->bindParam(':cedula', $cedula);
    $stmt->execute();

    echo json_encode([
        'success' => true,
        'message' => 'Usuario registrado correctamente.',
        'redirect' => 'auth-register-basic.php'
    ]);    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al registrar el usuario: ' . $e->getMessage()
    ]);
}