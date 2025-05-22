<?php
require_once '../../conexion/conexion.php';
require_once 'validar-jwt2.php';
header('Content-Type: application/json');

// Obtener datos del formulario y JWT
$cedula = $_POST['Cedula'] ?? '';
$usuario = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';
$nombre = $_POST['nombre'] ?? '';
$apellidos = $_POST['apellidos'] ?? '';
$tip = $_POST['tip'] ?? '';
$moduloaccess = $_POST['moduloaccess'] ?? '';
$usuarioResponsable = $decoded->data->cedula;

if (empty($cedula) || empty($password) || empty($tip)) {
    echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios.']);
    exit;
}

try {
    // 1. Establecer el usuario responsable en MySQL
    $pdo->exec("SET @usuario_php = " . $pdo->quote($usuarioResponsable));

    // 2. Verificar si ya existe
    $check = $pdo->prepare("SELECT * FROM tesusu WHERE nom_ced = :cedula");
    $check->bindParam(':cedula', $cedula);
    $check->execute();

    if ($check->rowCount() > 0) {
        echo json_encode(['success' => false, 'message' => 'La cédula ya está registrada.']);
        exit;
    }

    // 4. Insertar usuario
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT,['cost'=> 12]);
    $stmt = $pdo->prepare("INSERT INTO tesusu (usu_ide, usu_usu, usu_con, usu_nom, usu_ape, usu_tip, usu_mod, nom_ced) VALUES (:cedula, :usuario, :contrasena, :nombre, :apellidos, :tip, :moduloaccess, :cedula)");
    $stmt->bindParam(':contrasena', $hashedPassword);
    $stmt->bindParam(':tip', $tip);
    $stmt->bindParam(':cedula', $cedula);
    $stmt->bindParam(':usuario', $usuario);
    $stmt->bindParam(':nombre', $nombre);
    $stmt->bindParam(':apellidos', $apellidos);
    $stmt->bindParam(':moduloaccess', $moduloaccess);
    
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