<?php
    header('Content-Type: application/json');

    require_once '../../../conexion/conexion.php';

    try {
        if (!isset($pdo)) {
            throw new Exception('No se pudo establecer conexión con la base de datos');
        }

        $query = "SELECT usu_mod, acc_nom FROM tesacc ORDER BY usu_mod";
        $stmt = $pdo->prepare($query);
        $stmt->execute();
        
        $access = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'access' => $access
        ]);
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error al obtener los access: ' . $e->getMessage()
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }