<?php
    require_once '../../../conexion/conexion.php';

    header('Content-Type: application/json');

    try {
        if (!isset($_GET['pri_ide'])) {
            throw new Exception('ID de asignación no proporcionado');
        }

        $pri_ide = $_GET['pri_ide'];

        // Consulta para obtener los detalles de la asignación
        $query = $pdo->prepare("
            SELECT pri_ide, pri_raz, pri_por
            FROM tespri
            WHERE pri_ide = :pri_ide
        ");
        
        $query->bindParam(':pri_ide', $pri_ide);
        $query->execute();
        
        $assignment = $query->fetch(PDO::FETCH_ASSOC);

        if (!$assignment) {
            throw new Exception('Asignación no encontrada');
        }

        echo json_encode([
            'success' => true,
            'assignment' => $assignment
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