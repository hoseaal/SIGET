<?php
require_once '../../conexion/conexion.php';
header('Content-Type: application/json');

// Obtener el usuario actual del JWT
$usuarioId = $GLOBALS['decoded']->data->cedula ?? 'sistema';

// Debug: Verificar el valor del usuario (opcional)
error_log("Usuario JWT: " . $usuarioId);

// Establecer @usuario_php en la misma conexión
try {
    $pdo->exec("SET @usuario_php = '" . $usuarioId . "'");
    
    // Debug: Verificar la variable MySQL (opcional)
    $debug = $pdo->query("SELECT @usuario_php AS usuario")->fetch();
    error_log("Usuario en MySQL: " . $debug['usuario']);
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al establecer contexto: ' . $e->getMessage()
    ]);
    exit;
}

// Validar datos del formulario
$cedula = $_POST['Cedula'] ?? '';
$password = $_POST['password'] ?? '';
$tip = $_POST['tip'] ?? '';

if (empty($cedula) || empty($password) || empty($tip)) {
    echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios.']);
    exit;
}

try {
    // Verificar nómina
    $verificarNomina = $pdo->prepare("SELECT * FROM tmanom WHERE nom_ced = :cedula");
    $verificarNomina->execute([':cedula' => $cedula]);

    if ($verificarNomina->rowCount() === 0) {
        echo json_encode(['success' => false, 'message' => 'El usuario no existe en nómina.']);
        exit;
    }

    // Verificar duplicados
    $check = $pdo->prepare("SELECT * FROM tesusu WHERE nom_ced = :cedula");
    $check->execute([':cedula' => $cedula]);

    if ($check->rowCount() > 0) {
        echo json_encode(['success' => false, 'message' => 'La cédula ya está registrada.']);
        exit;
    }

    // Insertar usuario
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO tesusu (usu_ide, usu_con, usu_tip, nom_ced) VALUES (:cedula, :contrasena, :tip, :cedula)");
    $stmt->execute([
        ':cedula' => $cedula,
        ':contrasena' => $hashedPassword,
        ':tip' => $tip
    ]);

    // Éxito
    echo json_encode([
        'success' => true,
        'message' => 'Usuario registrado correctamente.',
        'redirect' => 'auth-register-basic.php'
    ]);
    exit; // Asegurar que el script termine aquí

} catch (PDOException $e) {
    // Error específico de la operación
    echo json_encode([
        'success' => false,
        'message' => 'Error al registrar el usuario: ' . $e->getMessage()
    ]);
    exit;
}