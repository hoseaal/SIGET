<?php
    require_once '../../../conexion/conexion.php';
    require_once '../validar-jwt-js.php';
    header('Content-Type: application/json');

    try {
        $data = json_decode(file_get_contents('php://input'), true);
        $usuarioResponsable = $decoded->data->cedula; // Cédula del JWT

        if (!$data) throw new Exception('Datos no recibidos');

        // Validaciones (código existente)
        if (empty($data['nvl_ide']) || empty($data['nvl_ran']) || empty($data['nvl_sal'])) {
            throw new Exception('Datos requeridos faltantes');
        }

        if (!is_numeric($data['nvl_sal'])) {
            throw new Exception('El salario debe ser un valor numérico');
        }

        // 1. Establecer usuario responsable en MySQL
        $pdo->exec("SET @usuario_php = " . $pdo->quote($usuarioResponsable));

        // 2. Consulta de actualización (el trigger registrará el cambio)
        $query = $pdo->prepare("
            UPDATE tesnvl SET
                nvl_ran = :nvl_ran,
                nvl_sal = :nvl_sal,
                ona_ide = :ona_ide
            WHERE nvl_ide = :nvl_ide
        ");
        
        // Bind de parámetros (código existente)
        $query->bindParam(':nvl_ide', $data['nvl_ide'], PDO::PARAM_INT);
        $query->bindParam(':nvl_ran', $data['nvl_ran'], PDO::PARAM_STR);
        $query->bindParam(':nvl_sal', $data['nvl_sal']);

        if (empty($data['ona_ide'])) {
            $query->bindValue(':ona_ide', null, PDO::PARAM_NULL);
        } else {
            $query->bindParam(':ona_ide', $data['ona_ide'], PDO::PARAM_INT);
        }

        // Transacción
        $pdo->beginTransaction();
        if ($query->execute()) {
            $pdo->commit();
            echo json_encode([
                'success' => true,
                'message' => 'Nivel salarial actualizado correctamente'
            ]);
        } else {
            throw new Exception('Error al ejecutar la actualización');
        }

    } catch (PDOException $e) {
        $pdo->rollBack();
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