<?php
header('Content-Type: application/json');

require '../../../conexion/conexion.php';

try {

    // Consulta para salarios
    $querySalarios = "SELECT 
        t.nom_ced AS cedula,
        CONCAT(t.nom_nom, ' ', t.nom_ape) AS nombre_completo,
        o.ona_car AS cargo_onapre,
        t.nvl_ran AS nivel_salarial,
        n.nvl_sal AS salario
    FROM 
        tmanom t
    JOIN 
        tesona o ON t.ona_ide = o.ona_ide
    JOIN 
        tesnvl n ON t.ona_ide = n.ona_ide AND t.nvl_ran = n.nvl_ran
    ORDER BY 
        t.nom_ape, t.nom_nom";

    $stmtSalarios = $pdo->query($querySalarios);
    $salarios = $stmtSalarios->fetchAll();

    // Suma total de salarios
    $totalSalarios = 0;
    foreach ($salarios as $salario) {
        $totalSalarios += $salario['salario'];
    }

    // Conteo de registros en tesdep
    $queryCount = "SELECT COUNT(*) as total FROM tesdep";
    $stmtCount = $pdo->query($queryCount);
    $countResult = $stmtCount->fetch();
    $totalRegistros = $countResult['total'];

    // Promedio por área
    $promedioPorArea = ($totalRegistros > 0) ? $totalSalarios / $totalRegistros : 0;

    // Devolvemos los datos en JSON
    echo json_encode([
        'success' => true,
        'totalNomina' => $totalSalarios,
        'promedioArea' => $promedioPorArea,
        'formattedTotal' => number_format($totalSalarios, 2, ',', '.'),
        'formattedPromedio' => number_format($promedioPorArea, 2, ',', '.')
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al conectar con la base de datos: ' . $e->getMessage()
    ]);
}