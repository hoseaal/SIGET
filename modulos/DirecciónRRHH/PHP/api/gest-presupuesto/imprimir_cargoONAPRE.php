<?php
    header('Content-Type: application/json');
    require_once '../../../conexion/conexion.php';

    try {
        // Obtener parámetros de paginación
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $perPage = isset($_GET['per_page']) ? (int)$_GET['per_page'] : 7;
        
        // Validar parámetros
        if ($page < 1) $page = 1;
        if ($perPage < 1) $perPage = 7;
        
        // Calcular offset
        $offset = ($page - 1) * $perPage;
        
        // Consulta para obtener el total de registros
        $stmtTotal = $pdo->query("SELECT COUNT(*) as total FROM tesona");
        $total = $stmtTotal->fetchColumn();
        
        // Consulta para obtener los registros paginados
        $stmt = $pdo->prepare("SELECT ona_ide, ona_car FROM tesona ORDER BY ona_car LIMIT :limit OFFSET :offset");
        $stmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        $positions = $stmt->fetchAll();
        
        // Calcular total de páginas
        $totalPages = ceil($total / $perPage);
        
        // Preparar respuesta
        $response = [
            'success' => true,
            'positions' => $positions,
            'total' => $total,
            'total_pages' => $totalPages,
            'current_page' => $page
        ];
        
    } catch (PDOException $e) {
        $response = [
            'success' => false,
            'message' => 'Error al obtener los cargos ONAPRE: ' . $e->getMessage()
        ];
    }

    echo json_encode($response);
?>