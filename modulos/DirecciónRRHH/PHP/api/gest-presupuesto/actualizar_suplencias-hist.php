<?php
header('Content-Type: application/json');
require_once '../../../conexion/conexion.php';
require_once '../validar-jwt-js.php';

$data = json_decode(file_get_contents('php://input'), true);
$usuarioResponsable = $decoded->data->cedula; // Cédula del usuario logueado desde JWT

if (!isset($data['sup_ide'])) {
    echo json_encode(['success' => false, 'message' => 'ID de suplencia no proporcionado']);
    exit;
}

// Validar datos requeridos
$required = ['nom_ced', 'sup_fec_ini', 'sup_activa'];
foreach ($required as $field) {
    if (!isset($data[$field])) {
        echo json_encode(['success' => false, 'message' => "El campo $field es requerido"]);
        exit;
    }
}

try {

    // Establecer el usuario responsable en MySQL
    $pdo->exec("SET @usuario_php = " . $pdo->quote($usuarioResponsable));

    // Obtener el estado actual para verificar cambios
    $checkStmt = $pdo->prepare("SELECT sup_activa FROM tessup WHERE sup_ide = ?");
    $checkStmt->execute([$data['sup_ide']]);
    $currentStatus = $checkStmt->fetchColumn();
    
    // Si el estado no cambió, no hacer ninguna actualización
    if ($currentStatus == $data['sup_activa']) {
        echo json_encode([
            'success' => false,
            'message' => 'No se detectaron cambios en el estado de la suplencia'
        ]);
        exit;
    }

    // Preparar la consulta de actualización
    $query = "UPDATE tessup SET 
                sup_activa = :sup_activa, 
                sup_fec_ini = :sup_fec_ini";
    
    // Agregar sup_fec_fin solo si se está desactivando la suplencia
    if ($data['sup_activa'] == 0 && isset($data['sup_fec_fin'])) {
        $query .= ", sup_fec_fin = :sup_fec_fin";
    } else if ($data['sup_activa'] == 1) {
        // Si se está reactivando, limpiar la fecha de fin
        $query .= ", sup_fec_fin = NULL";
    }
    
    $query .= " WHERE sup_ide = :sup_ide";

    $stmt = $pdo->prepare($query);
    
    // Bind de parámetros obligatorios
    $stmt->bindParam(':sup_ide', $data['sup_ide'], PDO::PARAM_INT);
    $stmt->bindParam(':sup_activa', $data['sup_activa'], PDO::PARAM_INT);
    $stmt->bindParam(':sup_fec_ini', $data['sup_fec_ini']);
    
    // Bind de sup_fec_fin solo si es necesario
    if ($data['sup_activa'] == 0 && isset($data['sup_fec_fin'])) {
        $stmt->bindParam(':sup_fec_fin', $data['sup_fec_fin']);
    }
    
    $stmt->execute();

    echo json_encode([
        'success' => true,
        'message' => 'Suplencia actualizada correctamente'
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al actualizar la suplencia: ' . $e->getMessage()
    ]);
}
?>