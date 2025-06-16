<?php
    require_once '../../../conexion/conexion.php';

    header('Content-Type: application/json');

    try {
        // Obtener parámetros de paginación
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $perPage = isset($_GET['per_page']) ? (int)$_GET['per_page'] : 8;
        $offset = ($page - 1) * $perPage;

        // Obtener el número total de deducciones
        $totalQuery = $pdo->query("SELECT COUNT(*) as total FROM tesded");
        $totalData = $totalQuery->fetch();
        $totalDeductions = $totalData['total'];

        // Consulta para obtener las deducciones paginadas
        $query = $pdo->prepare("
            SELECT ded_ide, ded_raz, ded_por 
            FROM tesded 
            ORDER BY ded_ide
            LIMIT :limit OFFSET :offset
        ");
        
        $query->bindParam(':limit', $perPage, PDO::PARAM_INT);
        $query->bindParam(':offset', $offset, PDO::PARAM_INT);
        $query->execute();
        
        $deductions = $query->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'deductions' => $deductions,
            'total' => $totalDeductions,
            'page' => $page,
            'per_page' => $perPage,
            'total_pages' => ceil($totalDeductions / $perPage)
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error en la base de datos: ' . $e->getMessage()
        ]);
    }
?>