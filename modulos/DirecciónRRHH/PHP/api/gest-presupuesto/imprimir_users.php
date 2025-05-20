<?php
    require_once '../../../conexion/conexion.php';

    header('Content-Type: application/json');

    try {
        // Verificar si se solicita todos los registros (para búsquedas)
        $all = isset($_GET['all']) && $_GET['all'] == 'true';
        $search = isset($_GET['search']) ? trim($_GET['search']) : '';

        // Consulta base
        $baseQuery = "
            SELECT u.usu_ide, u.usu_tip, u.nom_ced, m.nom_nom, m.nom_ape 
            FROM tesusu u
            LEFT JOIN tmanom m ON u.nom_ced = m.nom_ced
        ";

        // Añadir condiciones de búsqueda si hay término
        $whereConditions = [];
        $params = [];

        if (!empty($search)) {
            $whereConditions[] = "(
                u.nom_ced LIKE :search OR
                m.nom_nom LIKE :search OR
                m.nom_ape LIKE :search OR
                u.usu_tip LIKE :search
            )";
            $params[':search'] = "%$search%";
        }

        // Construir consulta final
        $queryStr = $baseQuery;
        if (!empty($whereConditions)) {
            $queryStr .= " WHERE " . implode(" AND ", $whereConditions);
        }
        $queryStr .= " ORDER BY u.usu_ide";

        // Obtener el número total de registros (para paginación)
        $countQuery = $pdo->prepare("SELECT COUNT(*) as total FROM ($queryStr) as subquery");
        foreach ($params as $key => $value) {
            $countQuery->bindValue($key, $value);
        }
        $countQuery->execute();
        $totalData = $countQuery->fetch();
        $totalUsers = $totalData['total'];

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
        $users = $query->fetchAll(PDO::FETCH_ASSOC);

        // Preparar respuesta
        $response = [
            'success' => true,
            'users' => $users,
            'total' => $totalUsers
        ];

        // Añadir información de paginación si no es una consulta de "todos"
        if (!$all) {
            $response['page'] = $page;
            $response['per_page'] = $perPage;
            $response['total_pages'] = ceil($totalUsers / $perPage);
        }

        echo json_encode($response);
        
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error al obtener usuarios: ' . $e->getMessage()
        ]);
    }
?>