<?php
    header('Content-Type: application/json');
    require_once '../../../conexion/conexion.php';

    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validar datos requeridos
        if (!isset($data['nom_ced'])) {
            throw new Exception('Datos incompletos');
        }

        $nom_ced = $data['nom_ced'];
        $cep_activa = isset($data['cep_activa']) ? (int)$data['cep_activa'] : 1;

        // Verificar si el trabajador ya está en la caja de ahorro
        $checkQuery = "SELECT COUNT(*) FROM tescep WHERE nom_ced = :nom_ced";
        $stmtCheck = $pdo->prepare($checkQuery);
        $stmtCheck->bindParam(':nom_ced', $nom_ced);
        $stmtCheck->execute();

        if ($stmtCheck->fetchColumn() > 0) {
            throw new Exception('El trabajador ya está registrado en la caja de ahorro');
        }

        // Verificar si la cédula existe en tmanom
        $checkCedula = "SELECT COUNT(*) FROM tmanom WHERE nom_ced = :nom_ced";
        $stmtCheckCedula = $pdo->prepare($checkCedula);
        $stmtCheckCedula->bindParam(':nom_ced', $nom_ced);
        $stmtCheckCedula->execute();

        if ($stmtCheckCedula->fetchColumn() == 0) {
            throw new Exception('La cédula proporcionada no existe en el sistema');
        }

        // Insertar nuevo registro
        $query = "INSERT INTO tescep (nom_ced, cep_activa) VALUES (:nom_ced, :cep_activa)";
        $stmt = $pdo->prepare($query);
        $stmt->bindParam(':nom_ced', $nom_ced);
        $stmt->bindParam(':cep_activa', $cep_activa, PDO::PARAM_INT);
        $stmt->execute();

        echo json_encode([
            'success' => true,
            'message' => 'Trabajador agregado a la caja de ahorro correctamente'
        ]);

    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error al agregar: ' . $e->getMessage()
        ]);
    }
?>