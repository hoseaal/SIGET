<?php
    require '../../../conexion/conexion.php';

    header('Content-Type: application/json');

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents("php://input"), true);

        // Validación de datos recibidos
        if (!isset($input['cedula']) || empty($input['cedula'])) {
            echo json_encode(['status' => 'error', 'message' => 'Cédula no proporcionada']);
            exit;
        }

        if (empty($input['nuevos']) && empty($input['actualizaciones'])) {
            echo json_encode(['status' => 'error', 'message' => 'No se proporcionaron datos para guardar']);
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
                $stmtVerify = $pdo->prepare("SELECT COUNT(*) FROM tesant WHERE ant_ide = ? AND nom_ced = ?");
                
                foreach ($actualizaciones as $rango) {
                    $fechaInicial = $rango['ant_ani'];
                    $fechaFinal = $rango['ant_anf'];
                    $antId = $rango['ant_ide'];

                    if (empty($fechaInicial) || empty($fechaFinal) || empty($antId)) {
                        continue; // Saltar registros incompletos
                    }

                    // Verificar que el registro pertenece al usuario
                    $stmtVerify->execute([$antId, $cedula]);
                    if ($stmtVerify->fetchColumn() == 0) {
                        throw new PDOException("El registro con ID: $antId no pertenece al usuario $cedula");
                    }

                    $stmtUpdate->execute([$fechaInicial, $fechaFinal, $antId, $cedula]);
                    
                    // No verificar rowCount() ya que puede ser 0 si los datos son iguales
                }
            }

            // Procesar nuevos registros
            if (!empty($nuevos)) {
                $stmtInsert = $pdo->prepare("INSERT INTO tesant (nom_ced, ant_ani, ant_anf) VALUES (?, ?, ?)");
                
                foreach ($nuevos as $rango) {
                    $fechaInicial = $rango['ant_ani'];
                    $fechaFinal = $rango['ant_anf'];

                    if (!empty($fechaInicial) && !empty($fechaFinal)) {
                        $stmtInsert->execute([$cedula, $fechaInicial, $fechaFinal]);
                    }
                }
            }

            $pdo->commit();
            echo json_encode(['status' => 'success', 'message' => 'Datos procesados correctamente']);
            exit;

        } catch (PDOException $e) {
            $pdo->rollBack();
            error_log("Error al registrar antigüedades: " . $e->getMessage());
            echo json_encode(['status' => 'error', 'message' => 'Error al procesar los datos: ' . $e->getMessage()]);
            exit;
        }
    }

    // Si no es POST
    echo json_encode(['status' => 'error', 'message' => 'Método no permitido']);