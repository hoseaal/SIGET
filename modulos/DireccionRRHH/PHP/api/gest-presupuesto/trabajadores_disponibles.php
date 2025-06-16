<?php
    header('Content-Type: application/json');
    require_once '../../../conexion/conexion.php';

    try {
        // Consulta para obtener todos los trabajadores
        $queryTrabajadores = "
            SELECT 
                nom_ced, 
                CONCAT(nom_nom, ' ', nom_ape) AS nombre_completo,
                nom_nom,
                nom_ape
            FROM 
                tmanom
            ORDER BY 
                nom_nom, nom_ape
        ";

        $stmtTrabajadores = $pdo->query($queryTrabajadores);
        $todosLosTrabajadores = $stmtTrabajadores->fetchAll(PDO::FETCH_ASSOC); // Especificamos FETCH_ASSOC

        // Consulta para obtener los trabajadores ya en la caja de ahorro
        $queryEnCaja = "SELECT nom_ced FROM tescep";
        $stmtEnCaja = $pdo->query($queryEnCaja);
        $enCaja = $stmtEnCaja->fetchAll(PDO::FETCH_COLUMN, 0); // Especificamos columna 0

        // Filtrar trabajadores que no están en la caja
        $trabajadoresDisponibles = array_filter($todosLosTrabajadores, function($t) use ($enCaja) {
            return !in_array($t['nom_ced'], $enCaja);
        });

        // Depuración - Registrar los datos que se enviarán
        error_log("Trabajadores disponibles: " . print_r($trabajadoresDisponibles, true));

        echo json_encode([
            'success' => true,
            'trabajadores' => array_values($trabajadoresDisponibles) // Reindexamos el array
        ], JSON_UNESCAPED_UNICODE); // Aseguramos que los caracteres especiales se mantengan

    } catch (PDOException $e) {
        error_log("Error en trabajadores_disponibles.php: " . $e->getMessage());
        echo json_encode([
            'success' => false,
            'message' => 'Error al cargar trabajadores disponibles: ' . $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
    }
?>