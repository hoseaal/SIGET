<?php
    require_once '../../../conexion/conexion.php';

    header('Content-Type: application/json');

    try {
        // Obtener parámetros de paginación
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $perPage = isset($_GET['per_page']) ? (int)$_GET['per_page'] : 7;
        $offset = ($page - 1) * $perPage;

        // Consulta para contar el total de usuarios
        $totalQuery = $pdo->query("SELECT COUNT(*) FROM tesusu");
        $totalUsers = $totalQuery->fetchColumn();

        // Consulta para obtener usuarios con datos de empleado
        $query = $pdo->prepare("
            SELECT u.usu_ide, u.usu_tip, u.nom_ced, m.nom_nom, m.nom_ape 
            FROM tesusu u
            LEFT JOIN tmanom m ON u.nom_ced = m.nom_ced
            LIMIT :limit OFFSET :offset
        ");
        
        $query->bindParam(':limit', $perPage, PDO::PARAM_INT);
        $query->bindParam(':offset', $offset, PDO::PARAM_INT);
        $query->execute();
        
        $users = $query->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'users' => $users,
            'total' => $totalUsers,
            'page' => $page,
            'per_page' => $perPage,
            'total_pages' => ceil($totalUsers / $perPage)
        ]);
        
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error al obtener usuarios: ' . $e->getMessage()
        ]);
    }
?>