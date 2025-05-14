<?php
    require_once '../../../conexion/conexion.php';

    header('Content-Type: application/json');

    try {
        // Obtener parámetros de paginación
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $perPage = isset($_GET['per_page']) ? (int)$_GET['per_page'] : 7;
        $offset = ($page - 1) * $perPage;

        // Obtener el número total de cargos
        $totalQuery = $pdo->query("SELECT COUNT(*) FROM tescet");
        $totalPositions = $totalQuery->fetchColumn();

        // Consulta para obtener los cargos paginados
        $query = $pdo->prepare("
            SELECT cet_ide, cet_car 
            FROM tescet 
            ORDER BY cet_car ASC
            LIMIT :limit OFFSET :offset
        ");
        
        $query->bindParam(':limit', $perPage, PDO::PARAM_INT);
        $query->bindParam(':offset', $offset, PDO::PARAM_INT);
        $query->execute();
        
        $positions = $query->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'positions' => $positions,
            'total' => $totalPositions,
            'page' => $page,
            'per_page' => $perPage,
            'total_pages' => ceil($totalPositions / $perPage)
        ]);
        
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error al obtener los cargos: ' . $e->getMessage()
        ]);
    }
?>