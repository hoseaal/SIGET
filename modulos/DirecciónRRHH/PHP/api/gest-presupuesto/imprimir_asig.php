<?php
    require_once '../../../conexion/conexion.php';

    header('Content-Type: application/json');

    try {
        // Obtener parámetros de paginación
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $perPage = isset($_GET['per_page']) ? (int)$_GET['per_page'] : 8;
        $offset = ($page - 1) * $perPage;

        // Obtener el número total de asignaciones
        $totalQuery = $pdo->query("SELECT COUNT(*) FROM tespri");
        $totalAssignments = $totalQuery->fetchColumn();

        // Consulta para obtener las asignaciones paginadas
        $query = $pdo->prepare("
            SELECT pri_ide, pri_raz, pri_por 
            FROM tespri 
            ORDER BY pri_ide
            LIMIT :limit OFFSET :offset
        ");
        
        $query->bindParam(':limit', $perPage, PDO::PARAM_INT);
        $query->bindParam(':offset', $offset, PDO::PARAM_INT);
        $query->execute();
        
        $assignments = $query->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'assignments' => $assignments,
            'total' => $totalAssignments,
            'page' => $page,
            'per_page' => $perPage,
            'total_pages' => ceil($totalAssignments / $perPage)
        ]);
        
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error al obtener las asignaciones: ' . $e->getMessage()
        ]);
    }
?>