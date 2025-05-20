<?php
    header('Content-Type: application/json');
    require_once '../../../conexion/conexion.php';

    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validar datos requeridos
        if (!isset($data['cep_ide']) || !isset($data['nom_ced'])) {
            throw new Exception('Datos incompletos');
        }

        $cep_ide = $data['cep_ide'];
        $nom_ced = $data['nom_ced'];
        $cep_activa = isset($data['cep_activa']) ? (int)$data['cep_activa'] : 1;

        // Verificar si la cédula existe en tmanom
        $checkCedula = "SELECT COUNT(*) FROM tmanom WHERE nom_ced = :nom_ced";
        $stmtCheck = $pdo->prepare($checkCedula);
        $stmtCheck->bindParam(':nom_ced', $nom_ced);
        $stmtCheck->execute();

        if ($stmtCheck->fetchColumn() == 0) {
            throw new Exception('La cédula proporcionada no existe en el sistema');
        }

        // Actualizar o insertar registro
        if ($cep_ide > 0) {
            // Actualización
            $query = "UPDATE tescep SET nom_ced = :nom_ced, cep_activa = :cep_activa WHERE cep_ide = :cep_ide";
            $stmt = $pdo->prepare($query);
            $stmt->bindParam(':cep_ide', $cep_ide, PDO::PARAM_INT);
            $stmt->bindParam(':nom_ced', $nom_ced);
            $stmt->bindParam(':cep_activa', $cep_activa, PDO::PARAM_INT);
            $stmt->execute();
        } else {
            // Inserción (en caso de que quieras permitir agregar nuevos desde el modal)
            $query = "INSERT INTO tescep (nom_ced, cep_activa) VALUES (:nom_ced, :cep_activa)";
            $stmt = $pdo->prepare($query);
            $stmt->bindParam(':nom_ced', $nom_ced);
            $stmt->bindParam(':cep_activa', $cep_activa, PDO::PARAM_INT);
            $stmt->execute();
        }

        echo json_encode([
            'success' => true,
            'message' => 'Cambios guardados exitosamente'
        ]);

    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error al guardar: ' . $e->getMessage()
        ]);
    }
?>