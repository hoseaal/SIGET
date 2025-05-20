<?php
    header('Content-Type: application/json');
    require_once '../../../conexion/conexion.php';

    try {
        if (!isset($_GET['cep_ide'])) {
            throw new Exception('ID de trabajador no proporcionado');
        }

        $cep_ide = $_GET['cep_ide'];

        // Consulta para obtener los detalles del trabajador
        $query = "
            SELECT 
                c.cep_ide, 
                c.cep_activa, 
                c.nom_ced, 
                n.nom_nom, 
                n.nom_ape,
                n.nom_fec,
                n.nom_gen,
                n.nom_nhi,
                n.nom_pro
            FROM 
                tescep c
            JOIN 
                tmanom n ON c.nom_ced = n.nom_ced
            WHERE 
                c.cep_ide = :cep_ide
        ";

        $stmt = $pdo->prepare($query);
        $stmt->bindParam(':cep_ide', $cep_ide, PDO::PARAM_INT);
        $stmt->execute();

        $trabajador = $stmt->fetch();

        if (!$trabajador) {
            throw new Exception('Trabajador no encontrado');
        }

        echo json_encode([
            'success' => true,
            'trabajador' => $trabajador
        ]);

    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
?>