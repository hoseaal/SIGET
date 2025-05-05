<?php
require_once '../../../conexion/conexion.php';

header('Content-Type: application/json');

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!$data) {
        throw new Exception('Datos no recibidos');
    }

    // Validar datos recibidos
    if (empty($data['cedula']) || empty($data['nombres']) || empty($data['apellidos'])) {
        throw new Exception('Datos requeridos faltantes');
    }

    // Preparar la consulta de actualización
    $query = $pdo->prepare("
        UPDATE tmanom SET
            nom_ced = :cedula,
            nom_nom = :nombres,
            nom_ape = :apellidos,
            nom_gen = :genero,
            nom_fec = :fecha_ingreso,
            nom_nhi = :num_hijos,
            dep_ide = :dep_ide,
            cet_ide = :cargo_cet,
            ona_ide = :cargo_onapre
        WHERE nom_ced = :cedula_original
    ");
    
    // Bind de parámetros
    $query->bindParam(':cedula', $data['cedula']);
    $query->bindParam(':nombres', $data['nombres']);
    $query->bindParam(':apellidos', $data['apellidos']);
    $query->bindParam(':genero', $data['genero']);
    $query->bindParam(':fecha_ingreso', $data['fecha_ingreso']);
    $query->bindParam(':num_hijos', $data['num_hijos']);
    $query->bindParam(':dep_ide', $data['dep_ide']);
    $query->bindParam(':cargo_cet', $data['cargo_cet']);
    $query->bindParam(':cargo_onapre', $data['cargo_onapre']);
    $query->bindParam(':cedula_original', $data['cedula_original']);
    
    if ($query->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Trabajador actualizado correctamente'
        ]);
    } else {
        throw new Exception('Error al ejecutar la actualización');
    }
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error en la base de datos: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>