<?php
    header('Content-Type: application/json');
    require_once '../../../conexion/conexion.php';

    $data = json_decode(file_get_contents('php://input'), true);

    // Validar datos requeridos
    $required = ['nom_ced', 'sup_fec_ini', 'sup_activa'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            echo json_encode(['success' => false, 'message' => "El campo $field es requerido"]);
            exit;
        }
    }

    try {
        // Preparar la consulta de inserción
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
                    NULL, 
                    :cet_ide, 
                    :ona_ide, 
                    :nvl_ran, 
                    :dep_ide, 
                    :sup_activa
                )";

        $stmt = $pdo->prepare($query);
        
        // Bind de parámetros
        $stmt->bindParam(':nom_ced', $data['nom_ced']);
        $stmt->bindParam(':sup_fec_ini', $data['sup_fec_ini']);
        $stmt->bindParam(':cet_ide', $data['cet_ide'], PDO::PARAM_INT);
        $stmt->bindParam(':ona_ide', $data['ona_ide'], PDO::PARAM_INT);
        $stmt->bindParam(':nvl_ran', $data['nvl_ran']);
        $stmt->bindParam(':dep_ide', $data['dep_ide'], PDO::PARAM_INT);
        $stmt->bindParam(':sup_activa', $data['sup_activa'], PDO::PARAM_INT);
        
        $stmt->execute();

        echo json_encode([
            'success' => true,
            'message' => 'Suplencia creada correctamente',
            'sup_ide' => $pdo->lastInsertId()
        ]);

    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error al crear la suplencia: ' . $e->getMessage()
        ]);
    }
?>