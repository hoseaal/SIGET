<?php
    header('Content-Type: application/json');
    require_once __DIR__ . '../../../conexion/conexion.php';

    try {
        // Obtener parámetros de paginación
        $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
        $perPage = isset($_GET['per_page']) ? intval($_GET['per_page']) : 10;
        
        // Validar parámetros
        if ($page < 1) $page = 1;
        if ($perPage < 1 || $perPage > 100) $perPage = 10;
        
        $offset = ($page - 1) * $perPage;

        // Consulta para obtener los datos con JOINs
        $sql = "SELECT 
                    s.sup_ide, 
                    s.nom_ced, 
                    CONCAT(m.nom_nom, ' ', m.nom_ape) AS nombre_completo,
                    m.nom_nom,
                    m.nom_ape,
                    s.sup_fec_ini, 
                    s.sup_fec_fin, 
                    c.cet_car, 
                    o.ona_car, 
                    s.nvl_ran, 
                    d.dep_nom, 
                    s.sup_activa
                FROM tessup s
                LEFT JOIN tmanom m ON s.nom_ced = m.nom_ced
                LEFT JOIN tescet c ON s.cet_ide = c.cet_ide
                LEFT JOIN tesona o ON s.ona_ide = o.ona_ide
                LEFT JOIN tesdep d ON s.dep_ide = d.dep_ide
                ORDER BY s.sup_ide DESC
                LIMIT :offset, :perPage";

        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt->bindParam(':perPage', $perPage, PDO::PARAM_INT);
        $stmt->execute();
        $suplencias = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Consulta para el total de registros
        $sqlCount = "SELECT COUNT(*) as total FROM tessup";
        $total = $pdo->query($sqlCount)->fetchColumn();
        $totalPages = ceil($total / $perPage);

        // Formatear fechas y preparar respuesta
        foreach ($suplencias as &$suplencia) {
            // Convertir fechas a formato ISO (el formateo a dd/mm/yyyy se hará en el frontend)
            $suplencia['sup_fec_ini'] = $suplencia['sup_fec_ini'];
            $suplencia['sup_fec_fin'] = $suplencia['sup_fec_fin'];
            
            // Asegurar valores nulos
            $suplencia['cet_car'] = $suplencia['cet_car'] ?? null;
            $suplencia['ona_car'] = $suplencia['ona_car'] ?? null;
            $suplencia['dep_nom'] = $suplencia['dep_nom'] ?? null;
        }

        // Enviar respuesta
        echo json_encode([
            'success' => true,
            'suplencias' => $suplencias,
            'total' => $total,
            'total_pages' => $totalPages,
            'current_page' => $page
        ]);

    } catch (PDOException $e) {
        // Manejo de errores de base de datos
        echo json_encode([
            'success' => false,
            'message' => 'Error de base de datos: ' . $e->getMessage(),
            'error_code' => $e->getCode()
        ]);
    } catch (Exception $e) {
        // Manejo de otros errores
        echo json_encode([
            'success' => false,
            'message' => 'Error: ' . $e->getMessage()
        ]);
    }
?>