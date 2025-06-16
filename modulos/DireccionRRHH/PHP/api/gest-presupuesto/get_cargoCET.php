<?php
    require_once '../../../conexion/conexion.php';

    header('Content-Type: application/json');

    try {
        if (!isset($_GET['id'])) {
            throw new Exception('ID de cargo no proporcionado');
        }

        $positionId = $_GET['id'];

        // Consulta para obtener los detalles del cargo
        $query = $pdo->prepare("SELECT cet_ide, cet_car FROM tescet WHERE cet_ide = :id");
        $query->bindParam(':id', $positionId, PDO::PARAM_INT);
        $query->execute();
        
        $cargo = $query->fetch(PDO::FETCH_ASSOC);

        if (!$cargo) {
            throw new Exception('Cargo no encontrado');
        }

        echo json_encode([
            'success' => true,
            'cargo' => $cargo
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