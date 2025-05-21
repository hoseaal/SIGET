<?php
    require_once '../../../conexion/conexion.php';

    header('Content-Type: application/json');

    try {
        // Consulta para obtener el total de empleados
        $queryTotal = "SELECT COUNT(*) as total FROM tmanom";
        $stmtTotal = $pdo->query($queryTotal);
        $totalEmpleados = $stmtTotal->fetch()['total'];

        // Consulta para obtener empleados por departamento
        $queryDeptos = "
            SELECT 
                d.dep_nom as nombre, 
                COUNT(t.nom_ced) as cantidad,
                d.dep_des as descripcion
            FROM 
                tesdep d
            LEFT JOIN 
                tmanom t ON d.dep_ide = t.dep_ide
            GROUP BY 
                d.dep_ide, d.dep_nom, d.dep_des
            ORDER BY 
                cantidad DESC
        ";
        $stmtDeptos = $pdo->query($queryDeptos);
        $departamentos = $stmtDeptos->fetchAll();

        // Procesamos los datos para obtener los 3 primeros y sumar los demás como "Otros"
        $topDepartamentos = array_slice($departamentos, 0, 3);
        $otrosDepartamentos = array_slice($departamentos, 3);
        
        $totalOtros = 0;
        foreach ($otrosDepartamentos as $depto) {
            $totalOtros += $depto['cantidad'];
        }

        // Calculamos porcentajes
        $labels = [];
        $series = [];
        $porcentajes = [];
        
        foreach ($topDepartamentos as $depto) {
            $labels[] = $depto['nombre'];
            $series[] = $depto['cantidad'];
            $porcentajes[] = round(($depto['cantidad'] / $totalEmpleados) * 100);
        }
        
        if ($totalOtros > 0) {
            $labels[] = 'Otros';
            $series[] = $totalOtros;
            $porcentajes[] = round(($totalOtros / $totalEmpleados) * 100);
        }

        // Construimos la respuesta
        $response = [
            'total_empleados' => (int)$totalEmpleados,
            'departamentos' => $topDepartamentos,
            'otros' => $totalOtros,
            'chart_data' => [
                'labels' => $labels,
                'series' => $series,
                'porcentajes' => $porcentajes
            ]
        ];

        echo json_encode($response);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al obtener datos: ' . $e->getMessage()]);
    }