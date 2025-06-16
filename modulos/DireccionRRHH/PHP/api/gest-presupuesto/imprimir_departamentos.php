<?php
    header('Content-Type: application/json');
    require_once '../../../conexion/conexion.php';  

    // Validar parámetros
    $all = isset($_GET['all']) && $_GET['all'] === 'true';
    $page = max(1, isset($_GET['page']) ? (int)$_GET['page'] : 1);
    $perPage = max(1, isset($_GET['per_page']) ? (int)$_GET['per_page'] : 7);

    try {
        if ($all) {
            // Obtener todos los departamentos (para búsqueda)
            $stmt = $pdo->query("SELECT dep_ide, dep_nom, dep_des FROM tesdep ORDER BY dep_ide");
            $departamentos = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'departments' => $departamentos
            ]);
        } else {
            // Obtener departamentos paginados
            $offset = ($page - 1) * $perPage;
            
            // Consulta para los datos
            $stmt = $pdo->prepare("SELECT dep_ide, dep_nom, dep_des FROM tesdep ORDER BY dep_ide LIMIT :limit OFFSET :offset");
            $stmt->bindValue(':limit', $perPage, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            $departamentos = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Consulta para el total
            $total = $pdo->query("SELECT COUNT(*) FROM tesdep")->fetchColumn();
            $totalPages = max(1, ceil($total / $perPage));
            
            echo json_encode([
                'success' => true,
                'departments' => $departamentos,
                'total' => (int)$total,
                'total_pages' => $totalPages
            ]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error al obtener departamentos: ' . $e->getMessage()
        ]);
    }
?>