<?php
    require_once '../../../conexion/conexion.php';

    header('Content-Type: application/json');

    try {
        if (!isset($_GET['ded_id'])) {
            throw new Exception('ID de deducción no proporcionado');
        }

        $dedId = (int)$_GET['ded_id'];

        $query = $pdo->prepare("
            SELECT ded_ide, ded_raz, ded_por 
            FROM tesded 
            WHERE ded_ide = :ded_id
        ");
        
        $query->bindParam(':ded_id', $dedId, PDO::PARAM_INT);
        $query->execute();
        
        $deduction = $query->fetch(PDO::FETCH_ASSOC);

        if (!$deduction) {
            throw new Exception('Deducción no encontrada');
        }

        echo json_encode([
            'success' => true,
            'deduction' => $deduction
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error en la base de datos: ' . $e->getMessage()
        ]);
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
?>