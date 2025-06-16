<?php
    require_once '../../../conexion/conexion.php';

    header('Content-Type: application/json');

    try {
        // Obtener parámetros de paginación
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $perPage = isset($_GET['per_page']) ? (int)$_GET['per_page'] : 7;
        $offset = ($page - 1) * $perPage;

        // Obtener el número total de registros
        $totalQuery = $pdo->query("SELECT COUNT(*) as total FROM tesnvl_historico");
        $totalData = $totalQuery->fetch();
        $totalSalaries = $totalData['total'];

        // Consulta para obtener los niveles salariales con JOIN a tesona
        $query = $pdo->prepare("
            SELECT 
                t.nvl_ide,
                t.nvl_ran,
                t.nvl_sal,
                t.nvl_fec,
                o.ona_car
            FROM tesnvl_historico t
            LEFT JOIN tesona o ON t.ona_ide = o.ona_ide
            ORDER BY t.nvl_ide
            LIMIT :limit OFFSET :offset
        ");
        
        $query->bindParam(':limit', $perPage, PDO::PARAM_INT);
        $query->bindParam(':offset', $offset, PDO::PARAM_INT);
        $query->execute();
        
        $salaries = $query->fetchAll(PDO::FETCH_ASSOC);

        // Formatear salarios
        foreach ($salaries as &$salary) {
            $salary['nvl_sal'] = (float)$salary['nvl_sal'];
        }

        echo json_encode([
            'success' => true,
            'salaries' => $salaries,
            'total' => $totalSalaries,
            'page' => $page,
            'per_page' => $perPage,
            'total_pages' => ceil($totalSalaries / $perPage)
        ]);
        
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error al obtener los niveles salariales: ' . $e->getMessage()
        ]);
    }
?>