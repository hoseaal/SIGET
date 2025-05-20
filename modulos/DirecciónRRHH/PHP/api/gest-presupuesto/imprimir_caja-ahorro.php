<?php
    header('Content-Type: application/json');
    require_once '../../../conexion/conexion.php';

    try {
        // Verificar si se solicita todos los registros (para búsquedas)
        $all = isset($_GET['all']) && $_GET['all'] == 'true';
        $search = isset($_GET['search']) ? trim($_GET['search']) : '';

        // Consulta base con JOIN
        $baseQuery = "
            SELECT 
                c.cep_ide, 
                c.cep_activa, 
                c.nom_ced, 
                n.nom_nom, 
                n.nom_ape
            FROM 
                tescep c
            JOIN 
                tmanom n ON c.nom_ced = n.nom_ced
        ";

        // Añadir condiciones de búsqueda si hay término
        $whereConditions = [];
        $params = [];

        if (!empty($search)) {
            $whereConditions[] = "(
                c.nom_ced LIKE :search OR
                n.nom_nom LIKE :search OR
                n.nom_ape LIKE :search OR
                (c.cep_activa = 1 AND 'activo' LIKE :search) OR
                (c.cep_activa = 0 AND 'inactivo' LIKE :search)
            ";
            $params[':search'] = "%$search%";
        }

        // Construir consulta final
        $queryStr = $baseQuery;
        if (!empty($whereConditions)) {
            $queryStr .= " WHERE " . implode(" AND ", $whereConditions);
        }
        $queryStr .= " ORDER BY n.nom_nom, n.nom_ape";

        // Obtener el número total de registros (para paginación)
        $countQuery = $pdo->prepare("SELECT COUNT(*) as total FROM ($queryStr) as subquery");
        foreach ($params as $key => $value) {
            $countQuery->bindValue($key, $value);
        }
        $countQuery->execute();
        $totalData = $countQuery->fetch();
        $total = $totalData['total'];

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
        $trabajadores = $query->fetchAll(PDO::FETCH_ASSOC);

        // Preparar respuesta
        $response = [
            'success' => true,
            'trabajadores' => $trabajadores,
            'total' => $total
        ];

        // Añadir información de paginación si no es una consulta de "todos"
        if (!$all) {
            $response['page'] = $page;
            $response['per_page'] = $perPage;
            $response['total_pages'] = ceil($total / $perPage);
        }

        echo json_encode($response);
        
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error al obtener los trabajadores: ' . $e->getMessage()
        ]);
    }
?>