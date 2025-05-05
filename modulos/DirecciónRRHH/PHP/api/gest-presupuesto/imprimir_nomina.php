<?php
require '../../../conexion/conexion.php';

header('Content-Type: application/json');

try {
    // Obtener el número total de trabajadores para la paginación
    $totalQuery = $pdo->query("SELECT COUNT(*) as total FROM tmanom");
    $totalData = $totalQuery->fetch();
    $totalWorkers = $totalData['total'];

    // Obtener parámetros de paginación
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $perPage = isset($_GET['per_page']) ? (int)$_GET['per_page'] : 7;
    $offset = ($page - 1) * $perPage;

    // Consulta para obtener los trabajadores paginados
    $query = $pdo->prepare("
        SELECT 
            t.nom_ced as cedula, 
            t.nom_nom as nombres, 
            t.nom_ape as apellidos, 
            CASE WHEN t.nom_gen = 'M' THEN 'Masculino' WHEN t.nom_gen = 'F' THEN 'Femenino' ELSE t.nom_gen END as genero,
            COALESCE(d.dep_nom, 'Sin departamento') as departamento 
        FROM tmanom t
        LEFT JOIN tesdep d ON t.dep_ide = d.dep_ide
        LIMIT :limit OFFSET :offset
    ");
    
    $query->bindParam(':limit', $perPage, PDO::PARAM_INT);
    $query->bindParam(':offset', $offset, PDO::PARAM_INT);
    $query->execute();
    
    $workers = $query->fetchAll();

    // Verificar si hay datos
    if (count($workers) === 0) {
        echo json_encode([
            'success' => true,
            'workers' => [],
            'total' => 0,
            'message' => 'No hay registros en la base de datos'
        ]);
        exit;
    }

    // Devolver los datos en formato JSON
    echo json_encode([
        'success' => true,
        'workers' => $workers,
        'total' => $totalWorkers,
        'page' => $page,
        'per_page' => $perPage,
        'total_pages' => ceil($totalWorkers / $perPage)
    ]);
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener los trabajadores: ' . $e->getMessage()
    ]);
}
?>