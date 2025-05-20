<?php
    require '../../../conexion/conexion.php';

    header('Content-Type: application/json');

    try {
        // Verificar si se solicita todos los registros (para búsquedas)
        $all = isset($_GET['all']) && $_GET['all'] == 'true';
        $search = isset($_GET['search']) ? trim($_GET['search']) : '';

        // Consulta base
        $baseQuery = "
            SELECT 
                t.nom_ced as cedula, 
                t.nom_nom as nombres, 
                t.nom_ape as apellidos, 
                CASE WHEN t.nom_gen = 'M' THEN 'Masculino' WHEN t.nom_gen = 'F' THEN 'Femenino' ELSE t.nom_gen END as genero,
                COALESCE(d.dep_nom, 'Sin departamento') as departamento 
            FROM tmanom t
            LEFT JOIN tesdep d ON t.dep_ide = d.dep_ide
        ";

        // Añadir condiciones de búsqueda si hay término
        $whereConditions = [];
        $params = [];

        if (!empty($search)) {
            $whereConditions[] = "(
                t.nom_ced LIKE :search OR
                t.nom_nom LIKE :search OR
                t.nom_ape LIKE :search OR
                t.nom_gen LIKE :search OR
                d.dep_nom LIKE :search
            )";
            $params[':search'] = "%$search%";
        }

        // Construir consulta final
        $queryStr = $baseQuery;
        if (!empty($whereConditions)) {
            $queryStr .= " WHERE " . implode(" AND ", $whereConditions);
        }

        // Obtener el número total de registros (para paginación)
        $countQuery = $pdo->prepare("SELECT COUNT(*) as total FROM ($queryStr) as subquery");
        foreach ($params as $key => $value) {
            $countQuery->bindValue($key, $value);
        }
        $countQuery->execute();
        $totalData = $countQuery->fetch();
        $totalWorkers = $totalData['total'];

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
        $workers = $query->fetchAll(PDO::FETCH_ASSOC);

        // Preparar respuesta
        $response = [
            'success' => true,
            'workers' => $workers,
            'total' => $totalWorkers
        ];

        // Añadir información de paginación si no es una consulta de "todos"
        if (!$all) {
            $response['page'] = $page;
            $response['per_page'] = $perPage;
            $response['total_pages'] = ceil($totalWorkers / $perPage);
        }

        echo json_encode($response);
        
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error al obtener los trabajadores: ' . $e->getMessage()
        ]);
    }
?>