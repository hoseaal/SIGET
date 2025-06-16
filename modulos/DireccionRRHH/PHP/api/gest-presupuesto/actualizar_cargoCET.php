<?php
    // Asegurar que no se envíe output antes de los headers
    ob_start();

    header('Content-Type: application/json');
    require_once '../../../conexion/conexion.php';
    require_once '../validar-jwt-js.php';

    // Limpiar cualquier output buffer
    ob_end_clean();

    $response = ['success' => false, 'message' => ''];

    try {
        // Verificar método de la solicitud
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            throw new Exception('Método no permitido');
        }

        // Obtener y validar input
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Error al decodificar JSON: ' . json_last_error_msg());
        }

        if (!isset($input['position_id']) || !isset($input['new_name'])) {
            throw new Exception('Datos incompletos');
        }

        $positionId = filter_var($input['position_id'], FILTER_VALIDATE_INT);
        $newName = trim($input['new_name']);

        if ($positionId === false || $positionId <= 0) {
            throw new Exception('ID de cargo inválido');
        }

        if (empty($newName)) {
            throw new Exception('El nombre no puede estar vacío');
        }

        // Establecer usuario responsable desde JWT
        $usuarioResponsable = $decoded->data->cedula;
        $pdo->exec("SET @usuario_php = " . $pdo->quote($usuarioResponsable));

        // Verificar si el cargo existe
        $stmt = $pdo->prepare("SELECT cet_ide FROM tescet WHERE cet_ide = ?");
        $stmt->execute([$positionId]);
        
        if (!$stmt->rowCount()) {
            throw new Exception('El cargo no existe');
        }
        
        // Actualizar el cargo
        $stmt = $pdo->prepare("UPDATE tescet SET cet_car = ? WHERE cet_ide = ?");
        $stmt->execute([$newName, $positionId]);
        
        $response['success'] = true;
        $response['message'] = 'Cargo actualizado correctamente';

    } catch (PDOException $e) {
        $response['message'] = 'Error en la base de datos: ' . $e->getMessage();
        error_log('PDOException en editar_cargoCET.php: ' . $e->getMessage());
    } catch (Exception $e) {
        $response['message'] = $e->getMessage();
        error_log('Exception en editar_cargoCET.php: ' . $e->getMessage());
    }

    // Asegurarse de que solo se envía JSON
    echo json_encode($response);
    exit;
?>