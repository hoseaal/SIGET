<?php
    require_once '../../../conexion/conexion.php';

    header('Content-Type: application/json');

    try {
        // Verificar si se solicita todos los registros (para búsquedas)
        $all = isset($_GET['all']) && $_GET['all'] == 'true';
        $search = isset($_GET['search']) ? trim($_GET['search']) : '';

        // Consulta base
        $baseQuery = "
            SELECT 
                t.nvl_ide,
                t.nvl_ran,
                t.nvl_sal,
                o.ona_car
            FROM tesnvl t
            LEFT JOIN tesona o ON t.ona_ide = o.ona_ide
        ";

        // Añadir condiciones de búsqueda si hay término
        $whereConditions = [];
        $params = [];

        if (!empty($search)) {
            $whereConditions[] = "(
                t.nvl_ran LIKE :search OR
                t.nvl_sal LIKE :search OR
                o.ona_car LIKE :search
            )";
            $params[':search'] = "%$search%";
        }

        // Construir consulta final
        $queryStr = $baseQuery;
        if (!empty($whereConditions)) {
            $queryStr .= " WHERE " . implode(" AND ", $whereConditions);
        }
        $queryStr .= " ORDER BY t.nvl_ide";

        // Obtener el número total de registros (para paginación)
        $countQuery = $pdo->prepare("SELECT COUNT(*) as total FROM ($queryStr) as subquery");
        foreach ($params as $key => $value) {
            $countQuery->bindValue($key, $value);
        }
        $countQuery->execute();
        $totalData = $countQuery->fetch();
        $totalSalaries = $totalData['total'];

        // Manejar paginación a menos que se soliciten todos los registros
        if (!$all) {
            $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
            $perPage = isset($_GET['per_page']) ? (int)$_GET['per_page'] : 7;
            $offset = ($page - 1) * $perPage;
            
            $queryStr .= " LIMIT :limit OFFSET :offset";
            $params[':limit'] = $perPage;
            $params[':offset'] = $offset;
        }

        // Consulta principal
        $query = $pdo->prepare($queryStr);
        
        // Vincular parámetros
        foreach ($params as $key => $value) {
            if ($key === ':limit' || $key === ':offset') {
                $query->bindValue($key, $value, PDO::PARAM_INT);
            } else {
                $query->bindValue($key, $value);
            }
        }

        $query->execute();
        $salaries = $query->fetchAll(PDO::FETCH_ASSOC);

        // Formatear salarios
        foreach ($salaries as &$salary) {
            $salary['nvl_sal'] = (float)$salary['nvl_sal'];
        }

        // Preparar respuesta
        $response = [
            'success' => true,
            'salaries' => $salaries,
            'total' => $totalSalaries
        ];

        // Añadir información de paginación si no es una consulta de "todos"
        if (!$all) {
            $response['page'] = $page;
            $response['per_page'] = $perPage;
            $response['total_pages'] = ceil($totalSalaries / $perPage);
        }

        echo json_encode($response);
        
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error al obtener los niveles salariales: ' . $e->getMessage()
        ]);
    }
?>