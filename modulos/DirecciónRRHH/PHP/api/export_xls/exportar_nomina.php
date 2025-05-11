<?php
    // Limpiar buffer de salida
    ob_clean();
    ob_start();

    require '../../../../../vendor/autoload.php';
    use PhpOffice\PhpSpreadsheet\Spreadsheet;
    use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
    use PhpOffice\PhpSpreadsheet\Shared\Date;

    require '../../../conexion/conexion.php';

    // Consulta SQL para obtener datos de nómina
    $sql = "
    SELECT 
        t.nom_ced AS cedula,
        t.nom_nom AS nombre,
        t.nom_ape AS apellido,
        t.nom_fec AS fecha_ingreso,
        t.nom_pro AS profesionalizacion,
        t.nom_nhi AS numero_hijos,
        c.cet_car AS cargo_cet,
        o.ona_car AS cargo_onapre,
        n.nvl_sal AS salario_base,
        nh.nvl_sal AS salario_historico,
        pt.pri_por AS prima_transporte_porcentaje,
        ph.pri_por AS prima_hijos_porcentaje,
        pg.pri_por AS prima_hogares_porcentaje,
        pa.pri_por AS complemento_alimentacion_porcentaje,
        ROUND(
            (nh.nvl_sal * 
                CASE 
                    WHEN c.cet_car LIKE '%Contralor%' THEN 95.00
                    WHEN c.cet_car = 'Director General' THEN 93.00
                    WHEN c.cet_car LIKE '%Director%' THEN 90.00
                    WHEN c.cet_car LIKE '%Jefe de división general%' THEN 85.00
                    WHEN c.cet_car LIKE '%Coordinador%' OR c.cet_car LIKE '%Supervisor%' THEN 80.00
                    ELSE 0.00
                END / 100 / 2
            ), 
        2) AS prima_jerarquia
    FROM 
        tmanom t
    JOIN 
        tescet c ON t.cet_ide = c.cet_ide
    JOIN 
        tesona o ON t.ona_ide = o.ona_ide
    JOIN 
        tesnvl n ON t.ona_ide = n.ona_ide AND t.nvl_ran = n.nvl_ran
    JOIN 
        tesnvl_historico nh ON t.ona_ide = nh.ona_ide AND t.nvl_ran = nh.nvl_ran
    LEFT JOIN
        tespri pt ON pt.pri_raz = 'Prima por transporte'
    LEFT JOIN
        tespri ph ON ph.pri_raz = 'Prima por Hijos'
    LEFT JOIN
        tespri pg ON pg.pri_raz = 'Prima por hogares'
    LEFT JOIN
        tespri pa ON pa.pri_raz = 'Complemento de Alimentación'
    WHERE 
        t.cet_ide IS NOT NULL
    ";

    $stmt = $pdo->query($sql);
    $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Crear un nuevo Spreadsheet
    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();

    // Encabezados del Excel con estilo
    $sheet->setCellValue('A1', 'N°');
    $sheet->setCellValue('B1', 'CÉDULA');
    $sheet->setCellValue('C1', 'NOMBRE');
    $sheet->setCellValue('D1', 'APELLIDO');
    $sheet->setCellValue('E1', 'CARGO CET');
    $sheet->setCellValue('F1', 'CARGO ONAPRE');
    $sheet->setCellValue('G1', 'FECHA INGRESO');
    $sheet->setCellValue('H1', 'SALARIO BASE');
    $sheet->setCellValue('I1', 'ANTIGUEDAD QUINCENAL');
    $sheet->setCellValue('J1', 'PROFESIONALIZACIÓN QUINCENAL');
    $sheet->setCellValue('K1', 'PRIMA POR JERARQUÍA');
    $sheet->setCellValue('L1', 'PRIMA DE TRANSPORTE');
    $sheet->setCellValue('M1', 'PRIMA POR RECONOCIMIENTO');
    $sheet->setCellValue('N1', 'PRIMA DE HOGARES');
    $sheet->setCellValue('O1', 'COMPLEMENTO DE ALIMENTACIÓN');
    $sheet->setCellValue('P1', 'PRIMA POR HIJOS');

    // Estilo para los encabezados
    $headerStyle = [
        'font' => [
            'bold' => true,
            'color' => ['rgb' => 'FFFFFF'],
        ],
        'fill' => [
            'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
            'startColor' => ['rgb' => '4472C4'],
        ],
    ];

    $sheet->getStyle('A1:P1')->applyFromArray($headerStyle);

    // Llenar datos
    $row = 2;
    $contador = 1;
    $fecha_actual = new DateTime();
    
    foreach ($resultados as $data) {
        $sueldo_quincenal = $data['salario_base'] / 2;
        
        // Cálculo seguro de profesionalización
        $porcentaje = 0.00;
        if (isset($data['profesionalizacion'])) {
            switch ((string)$data['profesionalizacion']) {
                case '1': $porcentaje = 0.20; break;
                case '2': $porcentaje = 0.25; break;
                case '3': $porcentaje = 0.30; break;
                case '4': $porcentaje = 0.35; break;
                case '5': $porcentaje = 0.40; break;
            }
        }
        $profesionalizacion = $sueldo_quincenal * $porcentaje;
        
        // Cálculo de prima de transporte (porcentaje / 2)
        $prima_transporte = isset($data['prima_transporte_porcentaje']) ? 
            ($data['prima_transporte_porcentaje'] / 2) : 0;
            
        // Cálculo de prima por reconocimiento
        $fecha_ingreso = new DateTime($data['fecha_ingreso']);
        $diferencia = $fecha_actual->diff($fecha_ingreso);
        $anios_servicio = $diferencia->y;
        $prima_reconocimiento = ($anios_servicio / 100) * $data['salario_historico'];
        
        // Cálculo de prima por hogares (pri_por / 2)
        $prima_hogares = isset($data['prima_hogares_porcentaje']) ? 
            ($data['prima_hogares_porcentaje'] / 2) : 0;
        
        // Cálculo de complemento de alimentación (pri_por / 2 * número de hijos)
        $complemento_alimentacion = isset($data['complemento_alimentacion_porcentaje']) ? 
            ($data['complemento_alimentacion_porcentaje'] / 2 * $data['numero_hijos']) : 0;
        
        // Cálculo de prima por hijos (pri_por / 2 * número de hijos)
        $prima_hijos = isset($data['prima_hijos_porcentaje']) ? 
            ($data['prima_hijos_porcentaje'] / 2 * $data['numero_hijos']) : 0;

        $sheet->setCellValue('A' . $row, $contador);
        $sheet->setCellValue('B' . $row, $data['cedula']);
        $sheet->setCellValue('C' . $row, $data['nombre']);
        $sheet->setCellValue('D' . $row, $data['apellido']);
        $sheet->setCellValue('E' . $row, $data['cargo_cet']);
        $sheet->setCellValue('F' . $row, $data['cargo_onapre']);
        $sheet->setCellValue('G' . $row, Date::PHPToExcel($data['fecha_ingreso']));
        $sheet->getStyle('G' . $row)->getNumberFormat()->setFormatCode('dd/mm/yyyy');
        $sheet->setCellValue('H' . $row, $data['salario_base']);
        $sheet->setCellValue('I' . $row, $sueldo_quincenal);
        $sheet->setCellValue('J' . $row, $profesionalizacion);
        $sheet->setCellValue('K' . $row, $data['prima_jerarquia']);
        $sheet->setCellValue('L' . $row, $prima_transporte);
        $sheet->setCellValue('M' . $row, $prima_reconocimiento);
        $sheet->setCellValue('N' . $row, $prima_hogares);
        $sheet->setCellValue('O' . $row, $complemento_alimentacion);
        $sheet->setCellValue('P' . $row, $prima_hijos);
        
        $row++;
        $contador++;
    }

    // Aplicar formato numérico a las columnas numéricas
    $sheet->getStyle('H2:P' . $row)->getNumberFormat()->setFormatCode('#,##0.00');

    // Autoajustar columnas
    foreach (range('A', 'P') as $column) {
        $sheet->getColumnDimension($column)->setAutoSize(true);
    }

    // Congelar la primera fila (encabezados)
    $sheet->freezePane('A2');

    // Configurar el writer y descargar el archivo
    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment;filename="nomina_trabajadores.xlsx"');
    header('Cache-Control: max-age=0');

    $writer = new Xlsx($spreadsheet);
    $writer->save('php://output');
    exit;
?>