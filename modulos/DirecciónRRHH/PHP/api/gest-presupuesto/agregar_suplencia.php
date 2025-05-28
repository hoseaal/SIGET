<?php
    header('Content-Type: application/json');
    require_once '../../../conexion/conexion.php';
    require_once '../validar-jwt-js.php';

    try {
        // Obtener y validar datos JSON
        $json = file_get_contents('php://input');
        if (empty($json)) {
            throw new Exception('No se recibieron datos');
        }
        
        $data = json_decode($json, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Error al decodificar JSON: ' . json_last_error_msg());
        }
        
        $usuarioResponsable = $decoded->data->cedula; // Cédula del usuario logueado desde JWT

        // Validar datos requeridos
        $required = ['nom_ced', 'sup_fec_ini', 'sup_activa'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                throw new Exception("El campo $field es requerido");
            }
        }

        // 1. Establecer el usuario responsable en MySQL
        $pdo->exec("SET @usuario_php = " . $pdo->quote($usuarioResponsable));

        // 2. Insertar suplencia
        $query = "INSERT INTO tessup (
                    nom_ced, 
                    sup_fec_ini, 
                    sup_fec_fin, 
                    cet_ide, 
                    ona_ide, 
                    nvl_ran, 
                    dep_ide, 
                    sup_activa
                ) VALUES (
                    :nom_ced, 
                    :sup_fec_ini, 
                    :sup_fec_fin, 
                    :cet_ide, 
                    :ona_ide, 
                    :nvl_ran, 
                    :dep_ide, 
                    :sup_activa
                )";

        $stmt = $pdo->prepare($query);
        
        $stmt->bindValue(':nom_ced', $data['nom_ced']);
        $stmt->bindValue(':sup_fec_ini', $data['sup_fec_ini']);
        $stmt->bindValue(':sup_fec_fin', $data['sup_fec_fin'] ?? NULL);
        $stmt->bindValue(':cet_ide', $data['cet_ide'] ?? NULL, PDO::PARAM_INT);
        $stmt->bindValue(':ona_ide', $data['ona_ide'] ?? NULL, PDO::PARAM_INT);
        $stmt->bindValue(':nvl_ran', $data['nvl_ran'] ?? NULL);
        $stmt->bindValue(':dep_ide', $data['dep_ide'] ?? NULL, PDO::PARAM_INT);
        $stmt->bindValue(':sup_activa', $data['sup_activa'], PDO::PARAM_INT);
        
        if (!$stmt->execute()) {
            throw new Exception('Error al ejecutar la consulta: ' . implode(', ', $stmt->errorInfo()));
        }

        echo json_encode([
            'success' => true,
            'message' => 'Suplencia creada correctamente',
            'sup_ide' => $pdo->lastInsertId()
        ]);

    } catch (Exception $e) {
        http_response_code(400); // Bad Request
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
    }
?>