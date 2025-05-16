<?php
    header('Content-Type: application/json');
    require_once '../../../conexion/conexion.php'; // Asegúrate de que la ruta sea correcta

    try {
        // Obtener parámetros de paginación
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $perPage = isset($_GET['per_page']) ? (int)$_GET['per_page'] : 7;
        $offset = ($page - 1) * $perPage;

        // Consulta para obtener el total de registros
        $countQuery = $pdo->query("SELECT COUNT(*) as total FROM tessup");
        $total = $countQuery->fetch()['total'];
        $totalPages = ceil($total / $perPage);

        // Consulta principal con JOINs para obtener datos relacionados
        $query = "
            SELECT 
                s.sup_ide,
                s.nom_ced,
                CONCAT(n.nom_nom, ' ', n.nom_ape) as nom_nom,
                s.sup_fec_ini,
                s.sup_fec_fin,
                s.cet_ide,
                c.cet_car,
                s.ona_ide,
                o.ona_car,
                s.nvl_ran,
                s.dep_ide,
                d.dep_nom,
                s.sup_activa
            FROM tessup s
            LEFT JOIN tmanom n ON s.nom_ced = n.nom_ced
            LEFT JOIN tescet c ON s.cet_ide = c.cet_ide
            LEFT JOIN tesona o ON s.ona_ide = o.ona_ide
            LEFT JOIN tesdep d ON s.dep_ide = d.dep_ide
            ORDER BY s.sup_fec_ini DESC
            LIMIT :offset, :perPage
        ";

        $stmt = $pdo->prepare($query);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt->bindParam(':perPage', $perPage, PDO::PARAM_INT);
        $stmt->execute();
        $supplements = $stmt->fetchAll();

        // Formatear fechas y otros campos si es necesario
        foreach ($supplements as &$supplement) {
            $supplement['sup_fec_ini'] = $supplement['sup_fec_ini'] ? date('d/m/Y', strtotime($supplement['sup_fec_ini'])) : null;
            $supplement['sup_fec_fin'] = $supplement['sup_fec_fin'] ? date('d/m/Y', strtotime($supplement['sup_fec_fin'])) : null;
        }

        echo json_encode([
            'success' => true,
            'supplements' => $supplements,
            'total' => $total,
            'total_pages' => $totalPages
        ]);

    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error al cargar las suplencias: ' . $e->getMessage()
        ]);
    }
?>