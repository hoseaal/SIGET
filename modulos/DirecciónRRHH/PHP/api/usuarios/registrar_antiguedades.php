<?php
require '../../../conexion/conexion.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents("php://input"), true);

    if (!isset($input['cedula']) || !isset($input['rangos'])) {
        echo json_encode(['status' => 'error', 'message' => 'Datos incompletos']);
        exit;
    }

    $cedula = $input['cedula'];
    $rangos = $input['rangos'];

    try {
        $stmt = $pdo->prepare("INSERT INTO tesant (nom_ced, ant_ani, ant_anf) VALUES (?, ?, ?)");

        foreach ($rangos as $rango) {
            $fechaInicial = $rango['ant_ani'];
            $fechaFinal = $rango['ant_anf'];

            if ($fechaInicial && $fechaFinal) {
                $stmt->execute([$cedula, $fechaInicial, $fechaFinal]);
            }
        }

        echo json_encode(['status' => 'success']);
        exit;

    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
        exit;
    }
}