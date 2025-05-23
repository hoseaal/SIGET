<?php
    require_once '../../../conexion/conexion.php';

    header('Content-Type: application/json');

    try {
        if (!isset($_GET['user_id'])) {
            throw new Exception('ID de usuario no proporcionado');
        }

        $userId = $_GET['user_id'];

        $query = $pdo->prepare("
            SELECT 
                u.usu_ide, 
                u.usu_tip, 
                u.nom_ced, 
                u.usu_nom, 
                u.usu_ape
            FROM tesusu u
            WHERE u.usu_ide = :user_id
        ");
        
        $query->bindParam(':user_id', $userId);
        $query->execute();
        
        $user = $query->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            throw new Exception('Usuario no encontrado');
        }

        // Asegurarse que usu_tip está presente
        if (!isset($user['usu_tip'])) {
            throw new Exception('Datos incompletos del usuario');
        }

        echo json_encode([
            'success' => true,
            'user' => $user
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