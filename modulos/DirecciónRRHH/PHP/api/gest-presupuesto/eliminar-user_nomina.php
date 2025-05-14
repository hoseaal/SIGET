<?php
    require_once '../../../conexion/conexion.php';

    // Asegurarnos de que estamos recibiendo datos JSON
    header('Content-Type: application/json');

    try {
        // Obtener el contenido crudo de la solicitud
        $json = file_get_contents('php://input');
        
        // Verificar si se recibieron datos
        if (empty($json)) {
            throw new Exception('No se recibieron datos');
        }

        // Decodificar el JSON
        $data = json_decode($json, true);
        
        // Verificar si el JSON se decodificó correctamente
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Error al decodificar JSON: ' . json_last_error_msg());
        }
        
        // Verificar que la cédula está presente
        if (!isset($data['cedula'])) {
            throw new Exception('El campo "cedula" es requerido');
        }

        $cedula = $data['cedula'];

        // Verificar si el trabajador existe
        $checkQuery = $pdo->prepare("SELECT COUNT(*) FROM tmanom WHERE nom_ced = :cedula");
        $checkQuery->bindParam(':cedula', $cedula);
        $checkQuery->execute();
        
        if ($checkQuery->fetchColumn() == 0) {
            throw new Exception('El trabajador no existe');
        }

        // Iniciar transacción para mayor seguridad
        $pdo->beginTransaction();

        try {
            // Preparar la consulta de eliminación
            $query = $pdo->prepare("DELETE FROM tmanom WHERE nom_ced = :cedula");
            $query->bindParam(':cedula', $cedula);
            
            if (!$query->execute()) {
                throw new Exception('Error al ejecutar la eliminación');
            }

            // Confirmar la transacción
            $pdo->commit();

            // Respuesta exitosa
            echo json_encode([
                'success' => true,
                'message' => 'Trabajador eliminado correctamente',
                'cedula' => $cedula
            ]);
            
        } catch (Exception $e) {
            // Revertir la transacción en caso de error
            $pdo->rollBack();
            throw $e;
        }
        
    } catch (PDOException $e) {
        // Manejar errores de base de datos
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Error en la base de datos: ' . $e->getMessage(),
            'error_code' => $e->getCode()
        ]);
    } catch (Exception $e) {
        // Manejar otros errores
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
?>