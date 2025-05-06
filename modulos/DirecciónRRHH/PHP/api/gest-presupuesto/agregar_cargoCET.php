<?php
    require_once '../../../conexion/conexion.php';

    header('Content-Type: application/json');

    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data || !isset($data['position_name']) || empty(trim($data['position_name']))) {
            throw new Exception('Nombre del cargo no recibido o inválido');
        }

        $positionName = trim($data['position_name']);

        // Verificar si el cargo ya existe
        $checkQuery = $pdo->prepare("SELECT COUNT(*) FROM tescet WHERE cet_car = :position_name");
        $checkQuery->bindParam(':position_name', $positionName);
        $checkQuery->execute();
        
        if ($checkQuery->fetchColumn() > 0) {
            throw new Exception('El cargo ya existe');
        }

        // Insertar nuevo cargo
        $query = $pdo->prepare("INSERT INTO tescet (cet_car) VALUES (:position_name)");
        $query->bindParam(':position_name', $positionName);
        
        if ($query->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Cargo agregado correctamente',
                'position_id' => $pdo->lastInsertId()
            ]);
        } else {
            throw new Exception('Error al agregar el cargo');
        }
        
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