<?php
    require_once '../../../conexion/conexion.php';

    header('Content-Type: application/json');

    try {
        if (!isset($_GET['cedula'])) {
            throw new Exception('Cédula no proporcionada');
        }

        $cedula = $_GET['cedula'];

        // Consulta para obtener los detalles completos del trabajador
        $query = $pdo->prepare("
            SELECT 
                t.nom_ced as cedula,
                t.nom_nom as nombres,
                t.nom_ape as apellidos,
                t.nom_gen as genero,
                t.nom_fec as fecha_ingreso,
                t.nom_nhi as num_hijos,
                t.nom_pro as nom_pro,
                t.dep_ide as dep_ide,
                d.dep_nom as departamento,
                t.cet_ide as cargo_cet,
                t.ona_ide as cargo_onapre,
                t.nvl_ran as nvl_ran
            FROM tmanom t
            LEFT JOIN tesdep d ON t.dep_ide = d.dep_ide
            WHERE t.nom_ced = :cedula
        ");
        
        $query->bindParam(':cedula', $cedula);
        $query->execute();
        
        $worker = $query->fetch(PDO::FETCH_ASSOC);

        if (!$worker) {
            throw new Exception('Trabajador no encontrado');
        }

        echo json_encode([
            'success' => true,
            'worker' => $worker
        ]);
        
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error en la base de datos: ' . $e->getMessage()
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
?>