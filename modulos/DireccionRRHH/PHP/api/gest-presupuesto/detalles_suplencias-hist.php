<?php
    header('Content-Type: application/json');
    require_once '../../../conexion/conexion.php';

    if (!isset($_GET['sup_ide'])) {
        echo json_encode(['success' => false, 'message' => 'ID de suplencia no proporcionado']);
        exit;
    }

    $sup_ide = $_GET['sup_ide'];

    try {
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
            WHERE s.sup_ide = :sup_ide
        ";

        $stmt = $pdo->prepare($query);
        $stmt->bindParam(':sup_ide', $sup_ide, PDO::PARAM_INT);
        $stmt->execute();
        $supplement = $stmt->fetch();

        if ($supplement) {
            // Formatear fechas
            $supplement['sup_fec_ini'] = $supplement['sup_fec_ini'] ? date('Y-m-d', strtotime($supplement['sup_fec_ini'])) : null;
            $supplement['sup_fec_fin'] = $supplement['sup_fec_fin'] ? date('Y-m-d', strtotime($supplement['sup_fec_fin'])) : null;
            
            echo json_encode([
                'success' => true,
                'supplement' => $supplement
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Suplencia no encontrada'
            ]);
        }

    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error al obtener detalles: ' . $e->getMessage()
        ]);
    }
?>