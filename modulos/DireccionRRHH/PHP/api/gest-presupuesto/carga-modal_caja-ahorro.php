<?php
    header('Content-Type: application/json');
    require_once '../../../conexion/conexion.php';

    try {
        // Consulta para obtener todos los trabajadores (para el select)
        $queryTrabajadores = "
            SELECT 
                nom_ced, 
                CONCAT(nom_nom, ' ', nom_ape) AS nombre_completo
            FROM 
                tmanom
            ORDER BY 
                nom_nom, nom_ape
        ";

        $stmtTrabajadores = $pdo->query($queryTrabajadores);
        $trabajadores = $stmtTrabajadores->fetchAll();

        // Consulta para obtener los trabajadores ya en la caja de ahorro
        $queryEnCaja = "SELECT nom_ced FROM tescep";
        $stmtEnCaja = $pdo->query($queryEnCaja);
        $enCaja = $stmtEnCaja->fetchAll(PDO::FETCH_COLUMN);

        // Filtrar trabajadores que no están en la caja
        $trabajadoresDisponibles = array_filter($trabajadores, function($t) use ($enCaja) {
            return !in_array($t['nom_ced'], $enCaja);
        });

        // También incluir los que ya están en la caja (para edición)
        $todosLosTrabajadores = $trabajadores;

        echo json_encode([
            'success' => true,
            'trabajadores' => array_values($trabajadoresDisponibles),
            'todosLosTrabajadores' => $todosLosTrabajadores
        ]);

    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error al cargar datos: ' . $e->getMessage()
        ]);
    }
?>