<?php
    require_once '../validar-jwt-js.php';

    if (!isset($decoded) || !isset($decoded->data->cedula)) {
        header('HTTP/1.1 401 Unauthorized');
        exit;
    }

    require_once '../../../conexion/conexion.php';

    try {
        $cedula = $decoded->data->cedula;
        
        // Consulta principal para obtener datos del trabajador
        $query = "SELECT t.*, 
                        cet.cet_car as cargo_cet, 
                        ona.ona_car as cargo_onapre,
                        dep.dep_nom as departamento
                FROM tmanom t
                LEFT JOIN tescet cet ON t.cet_ide = cet.cet_ide
                LEFT JOIN tesona ona ON t.ona_ide = ona.ona_ide
                LEFT JOIN tesdep dep ON t.dep_ide = dep.dep_ide
                WHERE t.nom_ced = ?";
        
        $stmt = $pdo->prepare($query);
        $stmt->execute([$cedula]);
        $trabajador = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$trabajador) {
            header('HTTP/1.1 404 Not Found');
            echo json_encode(['error' => 'No se encontró información de trabajador']);
            exit;
        }

        // Consulta adicional para verificar si tiene caja de ahorro
        $queryCaja = "SELECT cep_activa FROM tescep WHERE nom_ced = ?";
        $stmtCaja = $pdo->prepare($queryCaja);
        $stmtCaja->execute([$cedula]);
        $caja = $stmtCaja->fetch(PDO::FETCH_ASSOC);

        $trabajador['tiene_caja_ahorro'] = ($caja && $caja['cep_activa'] == 1);

        header('Content-Type: application/json');
        echo json_encode($trabajador);
    } catch (PDOException $e) {
        header('HTTP/1.1 500 Internal Server Error');
        echo json_encode(['error' => $e->getMessage()]);
    }