<?php
    header('Content-Type: application/json');

    require_once '../../../conexion/conexion.php';

    try {
        if (!isset($pdo)) {
            throw new Exception('No se pudo establecer conexión con la base de datos');
        }

        $query = "SELECT usu_tip, tip_nom FROM testip ORDER BY tip_nom";
        $stmt = $pdo->prepare($query);
        $stmt->execute();
        
        $roles = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'roles' => $roles
        ]);
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error al obtener los roles: ' . $e->getMessage()
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }