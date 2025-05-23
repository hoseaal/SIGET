<?php
    header('Content-Type: application/json');
    require_once '../../../conexion/conexion.php';
    require_once '../validar-jwt-js.php';

    $data = json_decode(file_get_contents('php://input'), true);
    $usuarioResponsable = $decoded->data->cedula; // Cédula del usuario logueado desde JWT

    // Validar datos requeridos
    $required = ['nom_ced', 'sup_fec_ini', 'sup_activa'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            echo json_encode(['success' => false, 'message' => "El campo $field es requerido"]);
            exit;
        }
    }

    try {
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
        
        // Usar bindValue en lugar de bindParam para valores con operador ??
        $stmt->bindValue(':nom_ced', $data['nom_ced']);
        $stmt->bindValue(':sup_fec_ini', $data['sup_fec_ini']);
        $stmt->bindValue(':sup_fec_fin', $data['sup_fec_fin'] ?? NULL);
        $stmt->bindValue(':cet_ide', $data['cet_ide'] ?? NULL, PDO::PARAM_INT);
        $stmt->bindValue(':ona_ide', $data['ona_ide'] ?? NULL, PDO::PARAM_INT);
        $stmt->bindValue(':nvl_ran', $data['nvl_ran'] ?? NULL);
        $stmt->bindValue(':dep_ide', $data['dep_ide'] ?? NULL, PDO::PARAM_INT);
        $stmt->bindValue(':sup_activa', $data['sup_activa'], PDO::PARAM_INT);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Suplencia creada correctamente',
                'sup_ide' => $pdo->lastInsertId()
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Error al ejecutar la consulta',
                'error' => $stmt->errorInfo()
            ]);
        }

    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error al crear la suplencia: ' . $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
    }
?>