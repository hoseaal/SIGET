<?php
    require '../../../conexion/conexion.php';

    // Consulta para contar usuarios en tesusu
    $queryUsuarios = "SELECT COUNT(*) as total_usuarios FROM tesusu";
    $stmtUsuarios = $pdo->query($queryUsuarios);
    $totalUsuarios = $stmtUsuarios->fetch()['total_usuarios'];

    // Consulta para contar empleados en tmanom
    $queryEmpleados = "SELECT COUNT(*) as total_empleados FROM tmanom";
    $stmtEmpleados = $pdo->query($queryEmpleados);
    $totalEmpleados = $stmtEmpleados->fetch()['total_empleados'];

    // Devolver los resultados como JSON
    header('Content-Type: application/json');
    echo json_encode([
        'total_usuarios' => $totalUsuarios,
        'total_empleados' => $totalEmpleados
    ]);