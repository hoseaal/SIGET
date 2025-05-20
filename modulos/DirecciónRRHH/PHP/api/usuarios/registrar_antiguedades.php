<?php
    require '../../../conexion/conexion.php';

    header('Content-Type: application/json');

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents("php://input"), true);

        // Validación de datos recibidos
        if (!isset($input['cedula']) || (!isset($input['nuevos']) && !isset($input['actualizaciones']))) {
            echo json_encode(['status' => 'error', 'message' => 'Datos incompletos']);
            exit;
        }

        $cedula = $input['cedula'];
        $nuevos = $input['nuevos'] ?? [];
        $actualizaciones = $input['actualizaciones'] ?? [];

        try {
            $pdo->beginTransaction();

            // Procesar actualizaciones de registros existentes
            if (!empty($actualizaciones)) {
                $stmtUpdate = $pdo->prepare("UPDATE tesant SET ant_ani = ?, ant_anf = ? WHERE ant_ide = ? AND nom_ced = ?");
                
                foreach ($actualizaciones as $rango) {
                    $fechaInicial = $rango['ant_ani'];
                    $fechaFinal = $rango['ant_anf'];
                    $antId = $rango['ant_ide'];

                    if ($fechaInicial && $fechaFinal && $antId) {
                        $stmtUpdate->execute([$fechaInicial, $fechaFinal, $antId, $cedula]);
                        
                        // Verificar si realmente se actualizó algún registro
                        if ($stmtUpdate->rowCount() === 0) {
                            throw new PDOException("No se pudo actualizar el registro con ID: $antId");
                        }
                    }
                }
            }

            // Procesar nuevos registros
            if (!empty($nuevos)) {
                $stmtInsert = $pdo->prepare("INSERT INTO tesant (nom_ced, ant_ani, ant_anf) VALUES (?, ?, ?)");
                
                foreach ($nuevos as $rango) {
                    $fechaInicial = $rango['ant_ani'];
                    $fechaFinal = $rango['ant_anf'];

                    if ($fechaInicial && $fechaFinal) {
                        $stmtInsert->execute([$cedula, $fechaInicial, $fechaFinal]);
                    }
                }
            }

            $pdo->commit();
            echo json_encode(['status' => 'success', 'message' => 'Datos procesados correctamente']);
            exit;

        } catch (PDOException $e) {
            $pdo->rollBack();
            echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
            exit;
        }
    }

    // Si no es POST
    echo json_encode(['status' => 'error', 'message' => 'Método no permitido']);