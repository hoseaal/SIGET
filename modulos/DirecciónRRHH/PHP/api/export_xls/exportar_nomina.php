<?php
    // Limpiar buffer de salida
    ob_clean();
    ob_start();

    require '../../../../../vendor/autoload.php';
    use PhpOffice\PhpSpreadsheet\Spreadsheet;
    use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

    require '../../../conexion/conexion.php';

    // Consulta SQL para obtener datos de nómina
    $sql = "
    SELECT 
        t.nom_ced AS cedula,
        t.nom_nom AS nombre,
        t.nom_ape AS apellido,
        c.cet_car AS cargo_cet,
        nh.nvl_sal AS salario_historico,
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
        tesnvl_historico nh ON 
        t.ona_ide = nh.ona_ide AND 
        t.nvl_ran = nh.nvl_ran
    WHERE 
        t.cet_ide IS NOT NULL
    ";

    $stmt = $pdo->query($sql);
    $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Crear un nuevo Spreadsheet
    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();

    // Encabezados del Excel con estilo
    $sheet->setCellValue('A1', 'Cédula');
    $sheet->setCellValue('B1', 'Nombre');
    $sheet->setCellValue('C1', 'Apellido');
    $sheet->setCellValue('D1', 'Cargo CET');
    $sheet->setCellValue('E1', 'Salario Base');
    $sheet->setCellValue('F1', 'Prima por Jerarquía');

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

    $sheet->getStyle('A1:F1')->applyFromArray($headerStyle);

    // Llenar datos
    $row = 2;
    foreach ($resultados as $data) {
        $sheet->setCellValue('A' . $row, $data['cedula']);
        $sheet->setCellValue('B' . $row, $data['nombre']);
        $sheet->setCellValue('C' . $row, $data['apellido']);
        $sheet->setCellValue('D' . $row, $data['cargo_cet']);
        $sheet->setCellValue('E' . $row, $data['salario_historico']);
        $sheet->setCellValue('F' . $row, $data['prima_jerarquia']);
        $row++;
    }

    // Formato para columnas numéricas
    $sheet->getStyle('E2:F' . $row)
        ->getNumberFormat()
        ->setFormatCode('#,##0.00');

    // Autoajustar el ancho de las columnas
    foreach (range('A', 'F') as $column) {
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