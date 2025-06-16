<?php
    header('Content-Type: application/json');
    require_once '../../../conexion/conexion.php';

    $cedula = $_GET['cedula'] ?? '';

    if (empty($cedula)) {
        echo json_encode([]);
        exit;
    }

    try {
        $stmt = $pdo->prepare("SELECT ant_ide, ant_ani, ant_anf FROM tesant WHERE nom_ced = ? ORDER BY ant_ani");
        $stmt->execute([$cedula]);
        $antiguedades = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($antiguedades);
    } catch (PDOException $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }