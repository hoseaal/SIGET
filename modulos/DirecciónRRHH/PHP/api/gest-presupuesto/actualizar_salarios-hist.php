<?php
    require_once '../../../conexion/conexion.php';

    header('Content-Type: application/json');

    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data) {
            throw new Exception('Datos no recibidos');
        }

        // Validar datos recibidos
        if (empty($data['nvl_ide']) || empty($data['nvl_ran']) || empty($data['nvl_sal'])) {
            throw new Exception('Datos requeridos faltantes');
        }

        // Preparar la consulta de actualización
        $query = $pdo->prepare("
            UPDATE tesnvl_historico SET
                nvl_ran = :nvl_ran,
                nvl_sal = :nvl_sal,
                ona_ide = :ona_ide,
                nvl_fec = :nvl_fec
            WHERE nvl_ide = :nvl_ide
        ");
        
        // Bind de parámetros
        $query->bindParam(':nvl_ide', $data['nvl_ide'], PDO::PARAM_INT);
        $query->bindParam(':nvl_ran', $data['nvl_ran']);
        $query->bindParam(':nvl_sal', $data['nvl_sal']);
        $query->bindParam(':nvl_fec', $data['nvl_fec']);
        
        // Manejar el caso cuando ona_ide es null
        if (empty($data['ona_ide'])) {
            $query->bindValue(':ona_ide', null, PDO::PARAM_NULL);
        } else {
            $query->bindParam(':ona_ide', $data['ona_ide'], PDO::PARAM_INT);
        }
        
        // Iniciar transacción
        $pdo->beginTransaction();

        try {
            if ($query->execute()) {
                $pdo->commit();
                echo json_encode([
                    'success' => true,
                    'message' => 'Nivel salarial actualizado correctamente'
                ]);
            } else {
                throw new Exception('Error al ejecutar la actualización');
            }
        } catch (Exception $e) {
            $pdo->rollBack();
            throw $e;
        }
        
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