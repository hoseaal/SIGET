<?php
    // Limpiar buffer de salida
    ob_clean();
    ob_start();

    require '../../../../../vendor/autoload.php';
    use PhpOffice\PhpSpreadsheet\Spreadsheet;
    use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
    use PhpOffice\PhpSpreadsheet\Shared\Date;

    require '../../../conexion/conexion.php';

    // Configurar zona horaria 
    date_default_timezone_set('America/Caracas');

    // Obtener porcentaje de seguro del empleado
    $sql_seguro_empleado = "SELECT ded_por FROM tesded WHERE ded_raz LIKE '%Seguro del Empleado%' LIMIT 1";
    $stmt_seguro_empleado = $pdo->query($sql_seguro_empleado);
    $porcentaje_seguro_empleado = $stmt_seguro_empleado->fetch(PDO::FETCH_COLUMN);
    $porcentaje_seguro_empleado = $porcentaje_seguro_empleado ? $porcentaje_seguro_empleado / 100 : 0;

    // Obtener porcentaje de seguro patronal
    $sql_seguro_patronal = "SELECT ded_por FROM tesded WHERE ded_raz LIKE '%Seguro Patronal%' LIMIT 1";
    $stmt_seguro_patronal = $pdo->query($sql_seguro_patronal);
    $porcentaje_seguro_patronal = $stmt_seguro_patronal->fetch(PDO::FETCH_COLUMN);
    $porcentaje_seguro_patronal = $porcentaje_seguro_patronal ? $porcentaje_seguro_patronal / 100 : 0;

    // Obtener porcentaje de R.P.E Empleado
    $sql_rpe_empleado = "SELECT ded_por FROM tesded WHERE ded_raz LIKE '%R.P.E Empleado%' LIMIT 1";
    $stmt_rpe_empleado = $pdo->query($sql_rpe_empleado);
    $porcentaje_rpe_empleado = $stmt_rpe_empleado->fetch(PDO::FETCH_COLUMN);
    $porcentaje_rpe_empleado = $porcentaje_rpe_empleado ? $porcentaje_rpe_empleado / 100 : 0;

    // Obtener porcentaje de R.P.E Patronal
    $sql_rpe_patronal = "SELECT ded_por FROM tesded WHERE ded_raz LIKE '%R.P.E Patronal%' LIMIT 1";
    $stmt_rpe_patronal = $pdo->query($sql_rpe_patronal);
    $porcentaje_rpe_patronal = $stmt_rpe_patronal->fetch(PDO::FETCH_COLUMN);
    $porcentaje_rpe_patronal = $porcentaje_rpe_patronal ? $porcentaje_rpe_patronal / 100 : 0;

    // Obtener porcentaje de FAOV Empleado
    $sql_faov_empleado = "SELECT ded_por FROM tesded WHERE ded_raz LIKE '%F.A.O.V Empleado%' LIMIT 1";
    $stmt_faov_empleado = $pdo->query($sql_faov_empleado);
    $porcentaje_faov_empleado = $stmt_faov_empleado->fetch(PDO::FETCH_COLUMN);
    $porcentaje_faov_empleado = $porcentaje_faov_empleado ? $porcentaje_faov_empleado / 100 : 0;

    // Obtener porcentaje de FAOV Patronal
    $sql_faov_patronal = "SELECT ded_por FROM tesded WHERE ded_raz LIKE '%F.A.O.V Patronal%' LIMIT 1";
    $stmt_faov_patronal = $pdo->query($sql_faov_patronal);
    $porcentaje_faov_patronal = $stmt_faov_patronal->fetch(PDO::FETCH_COLUMN);
    $porcentaje_faov_patronal = $porcentaje_faov_patronal ? $porcentaje_faov_patronal / 100 : 0;

    // Obtener porcentaje de FEJP Empleado y Patronal
    $sql_fejp = "SELECT ded_por FROM tesded WHERE ded_raz LIKE '%F.E.J.P Empleado y Patronal%' LIMIT 1";
    $stmt_fejp = $pdo->query($sql_fejp);
    $porcentaje_fejp = $stmt_fejp->fetch(PDO::FETCH_COLUMN);
    $porcentaje_fejp = $porcentaje_fejp ? $porcentaje_fejp / 100 : 0;

    // Obtener porcentaje de Caja Empleado y Patronal
    $sql_caja = "SELECT ded_por FROM tesded WHERE ded_raz LIKE '%Caja Empleado y Patronal%' LIMIT 1";
    $stmt_caja = $pdo->query($sql_caja);
    $porcentaje_caja = $stmt_caja->fetch(PDO::FETCH_COLUMN);
    $porcentaje_caja = $porcentaje_caja ? $porcentaje_caja / 100 : 0;

    // Obtener datos de cajas de ahorro
    $sql_cajas = "SELECT nom_ced, cep_activa FROM tescep";
    $stmt_cajas = $pdo->query($sql_cajas);
    $cajas_ahorro = $stmt_cajas->fetchAll(PDO::FETCH_GROUP|PDO::FETCH_ASSOC);

    // Calcular cantidad de lunes según periodo del mes - VERSIÓN CORREGIDA
    $dia_actual = date('j');
    $mes_actual = date('n');
    $ano_actual = date('Y');
    
    $cantidad_lunes = 0;
    if ($dia_actual <= 15) {
        // Contar lunes del 1 al 15
        $fecha_inicio = new DateTime("$ano_actual-$mes_actual-01");
        $fecha_fin = new DateTime("$ano_actual-$mes_actual-15");
    } else {
        // Contar lunes del 16 al final del mes - FORMA CORRECTA
        $fecha_inicio = new DateTime("$ano_actual-$mes_actual-16");
        // Obtener el último día del mes correctamente
        $fecha_fin = new DateTime("last day of $ano_actual-$mes_actual");
    }
    
    $intervalo = new DateInterval('P1D');
    $periodo = new DatePeriod($fecha_inicio, $intervalo, $fecha_fin);
    
    foreach ($periodo as $fecha) {
        if ($fecha->format('N') == 1) { // 1 = Lunes
            $cantidad_lunes++;
        }
    }

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
                    WHEN c.cet_car = 'DIRECTOR(A) GENERAL' THEN 93.00
                    WHEN c.cet_car LIKE '%Director%' THEN 90.00
                    WHEN c.cet_car LIKE '%Jefe de división general%' THEN 85.00
                    WHEN c.cet_car LIKE '%Coordinador%' 
                        OR c.cet_car LIKE '%Supervisor%' 
                        OR c.cet_car LIKE '%Jefe de División%' THEN 80.00
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

    // Obtener datos de antigüedad para todos los trabajadores
    $sql_antiguedad = "SELECT nom_ced, ant_ani, ant_anf FROM tesant";
    $stmt_ant = $pdo->query($sql_antiguedad);
    $antiguedades = $stmt_ant->fetchAll(PDO::FETCH_GROUP|PDO::FETCH_ASSOC);

    // Obtener datos de suplencias activas con cargo CET
    $sql_suplencias = "SELECT s.nom_ced, s.sup_activa, n.nvl_sal AS salario_suplencia, 
                      c.cet_car AS cargo_suplencia, nh.nvl_sal AS salario_historico_suplencia
                      FROM tessup s
                      JOIN tesnvl n ON s.ona_ide = n.ona_ide AND s.nvl_ran = n.nvl_ran
                      JOIN tesnvl_historico nh ON s.ona_ide = nh.ona_ide AND s.nvl_ran = nh.nvl_ran
                      LEFT JOIN tescet c ON s.cet_ide = c.cet_ide
                      WHERE s.sup_activa = 1";
    $stmt_sup = $pdo->query($sql_suplencias);
    $suplencias = $stmt_sup->fetchAll(PDO::FETCH_GROUP|PDO::FETCH_ASSOC);

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
    $sheet->setCellValue('I1', 'SALARIO BASE QUINCENAL');
    $sheet->setCellValue('J1', 'ANTIGUEDAD QUINCENAL');
    $sheet->setCellValue('K1', 'PROFESIONALIZACIÓN QUINCENAL');
    $sheet->setCellValue('L1', 'PRIMA POR JERARQUÍA');
    $sheet->setCellValue('M1', 'PRIMA DE TRANSPORTE');
    $sheet->setCellValue('N1', 'PRIMA DE RECONOCIMIENTO');
    $sheet->setCellValue('O1', 'PRIMA DE HOGARES');
    $sheet->setCellValue('P1', 'COMPLEMENTO DE ALIMENTACIÓN');
    $sheet->setCellValue('Q1', 'PRIMA POR HIJOS');
    $sheet->setCellValue('R1', 'DIFERENCIA DE SUELDO BÁSICO');
    $sheet->setCellValue('S1', 'DIFERENCIA DE ANTIGUEDAD');
    $sheet->setCellValue('T1', 'DIFERENCIA DE PROFESIONALIZACIÓN');
    $sheet->setCellValue('U1', 'DIFERENCIA DE JERARQUÍA');
    $sheet->setCellValue('V1', 'TOTAL DE ASIGNACIONES');
    $sheet->setCellValue('W1', 'TOTAL DE DEDUCCIONES');
    $sheet->setCellValue('X1', 'ASIGNACIÓN MENSUAL');
    $sheet->setCellValue('Y1', 'SEMANAL PARA EL IVSS');
    $sheet->setCellValue('Z1', 'SEGURO EMPLEADO');
    $sheet->setCellValue('AA1', 'SEGURO PATRONAL');
    $sheet->setCellValue('AB1', 'R.P.E EMPLEADO');
    $sheet->setCellValue('AC1', 'R.P.E PATRONAL');
    $sheet->setCellValue('AD1', 'FAOV EMPLEADO');
    $sheet->setCellValue('AE1', 'FAOV PATRONAL');
    $sheet->setCellValue('AF1', 'FEJP EMPLEADO Y PATRONAL');
    $sheet->setCellValue('AG1', 'CAJA EMPLEADO Y PATRONAL');

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
        'alignment' => [
            'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
            'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
            'wrapText' => true,
        ],
    ];

    $sheet->getStyle('A1:AG1')->applyFromArray($headerStyle);

    // Llenar datos
    $row = 2;
    $contador = 1;
    $fecha_actual = new DateTime();
    
    foreach ($resultados as $data) {
        $sueldo_quincenal = round($data['salario_base'] / 2, 2);
        
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
        $profesionalizacion = round($sueldo_quincenal * $porcentaje, 2);
        
        // Cálculo de prima de transporte (porcentaje / 2)
        $prima_transporte = isset($data['prima_transporte_porcentaje']) ? 
            round($data['prima_transporte_porcentaje'] / 2, 2) : 0;
        
        // Cálculo de prima por hogares (pri_por / 2)
        $prima_hogares = isset($data['prima_hogares_porcentaje']) ? 
            round($data['prima_hogares_porcentaje'] / 2, 2) : 0;
        
        // Cálculo de complemento de alimentación (pri_por / 2 * número de hijos)
        $complemento_alimentacion = isset($data['complemento_alimentacion_porcentaje']) ? 
            round($data['complemento_alimentacion_porcentaje'] / 2 * $data['numero_hijos'], 2) : 0;
        
        // Cálculo de prima por hijos (pri_por / 2 * número de hijos)
        $prima_hijos = isset($data['prima_hijos_porcentaje']) ? 
            round($data['prima_hijos_porcentaje'] / 2 * $data['numero_hijos'], 2) : 0;

        // Cálculo de antigüedad quincenal
        $antiguedad_quincenal = 0;
        $prima_reconocimiento = 0;
        
        // Calcular diferencia entre fecha actual y fecha de ingreso
        $fecha_ingreso = new DateTime($data['fecha_ingreso']);
        $dias_recientes = $fecha_actual->diff($fecha_ingreso)->days;
        
        if (isset($antiguedades[$data['cedula']])) {
            $dias_antiguedad = 0;
            
            // Sumar todas las diferencias entre ant_anf y ant_ani
            foreach ($antiguedades[$data['cedula']] as $ant) {
                $fecha_ini = new DateTime($ant['ant_ani']);
                $fecha_fin = new DateTime($ant['ant_anf']);
                $dias_antiguedad += $fecha_fin->diff($fecha_ini)->days;
            }
            
            // Total de días y conversión a años (parte entera)
            $total_dias = $dias_antiguedad + $dias_recientes;
            $anos_antiguedad = floor($total_dias / 365);
        } else {
            // Si no hay registros en tesant, usar solo los días recientes
            $anos_antiguedad = floor($dias_recientes / 365);
        }
        
        // Determinar el porcentaje para antigüedad quincenal
        $porcentaje_antiguedad = 0;
        if ($anos_antiguedad >= 23) {
            $porcentaje_antiguedad = 0.3;
        } elseif ($anos_antiguedad == 22) {
            $porcentaje_antiguedad = 0.296;
        } elseif ($anos_antiguedad == 21) {
            $porcentaje_antiguedad = 0.278;
        } elseif ($anos_antiguedad == 20) {
            $porcentaje_antiguedad = 0.26;
        } elseif ($anos_antiguedad == 19) {
            $porcentaje_antiguedad = 0.244;
        } elseif ($anos_antiguedad == 18) {
            $porcentaje_antiguedad = 0.228;
        } elseif ($anos_antiguedad == 17) {
            $porcentaje_antiguedad = 0.212;
        } elseif ($anos_antiguedad == 16) {
            $porcentaje_antiguedad = 0.196;
        } elseif ($anos_antiguedad == 15) {
            $porcentaje_antiguedad = 0.18;
        } elseif ($anos_antiguedad == 14) {
            $porcentaje_antiguedad = 0.166;
        } elseif ($anos_antiguedad == 13) {
            $porcentaje_antiguedad = 0.152;
        } elseif ($anos_antiguedad == 12) {
            $porcentaje_antiguedad = 0.138;
        } elseif ($anos_antiguedad == 11) {
            $porcentaje_antiguedad = 0.124;
        } elseif ($anos_antiguedad == 10) {
            $porcentaje_antiguedad = 0.11;
        } elseif ($anos_antiguedad == 9) {
            $porcentaje_antiguedad = 0.098;
        } elseif ($anos_antiguedad == 8) {
            $porcentaje_antiguedad = 0.086;
        } elseif ($anos_antiguedad == 7) {
            $porcentaje_antiguedad = 0.074;
        } elseif ($anos_antiguedad == 6) {
            $porcentaje_antiguedad = 0.062;
        } elseif ($anos_antiguedad == 5) {
            $porcentaje_antiguedad = 0.05;
        } elseif ($anos_antiguedad == 4) {
            $porcentaje_antiguedad = 0.04;
        } elseif ($anos_antiguedad == 3) {
            $porcentaje_antiguedad = 0.03;
        } elseif ($anos_antiguedad == 2) {
            $porcentaje_antiguedad = 0.02;
        } elseif ($anos_antiguedad == 1) {
            $porcentaje_antiguedad = 0.01;
        }
        
        $antiguedad_quincenal = round(($data['salario_base'] * $porcentaje_antiguedad) / 2, 2);
        
        // Determinar el porcentaje para prima de reconocimiento
        $porcentaje_reconocimiento = 0;
        if ($anos_antiguedad >= 23) {
            $porcentaje_reconocimiento = 0.60;
        } elseif ($anos_antiguedad == 22) {
            $porcentaje_reconocimiento = 0.59;
        } elseif ($anos_antiguedad == 21) {
            $porcentaje_reconocimiento = 0.56;
        } elseif ($anos_antiguedad == 20) {
            $porcentaje_reconocimiento = 0.52;
        } elseif ($anos_antiguedad == 19) {
            $porcentaje_reconocimiento = 0.49;
        } elseif ($anos_antiguedad == 18) {
            $porcentaje_reconocimiento = 0.46;
        } elseif ($anos_antiguedad == 17) {
            $porcentaje_reconocimiento = 0.42;
        } elseif ($anos_antiguedad == 16) {
            $porcentaje_reconocimiento = 0.39;
        } elseif ($anos_antiguedad == 15) {
            $porcentaje_reconocimiento = 0.36;
        } elseif ($anos_antiguedad == 14) {
            $porcentaje_reconocimiento = 0.33;
        } elseif ($anos_antiguedad == 13) {
            $porcentaje_reconocimiento = 0.30;
        } elseif ($anos_antiguedad == 12) {
            $porcentaje_reconocimiento = 0.28;
        } elseif ($anos_antiguedad == 11) {
            $porcentaje_reconocimiento = 0.25;
        } elseif ($anos_antiguedad == 10) {
            $porcentaje_reconocimiento = 0.22;
        } elseif ($anos_antiguedad == 9) {
            $porcentaje_reconocimiento = 0.20;
        } elseif ($anos_antiguedad == 8) {
            $porcentaje_reconocimiento = 0.17;
        } elseif ($anos_antiguedad == 7) {
            $porcentaje_reconocimiento = 0.15;
        } elseif ($anos_antiguedad == 6) {
            $porcentaje_reconocimiento = 0.12;
        } elseif ($anos_antiguedad == 5) {
            $porcentaje_reconocimiento = 0.10;
        } elseif ($anos_antiguedad == 4) {
            $porcentaje_reconocimiento = 0.08;
        } elseif ($anos_antiguedad == 3) {
            $porcentaje_reconocimiento = 0.06;
        } elseif ($anos_antiguedad == 2) {
            $porcentaje_reconocimiento = 0.04;
        } elseif ($anos_antiguedad == 1) {
            $porcentaje_reconocimiento = 0.02;
        }
        
        $prima_reconocimiento = round(($data['salario_historico'] * $porcentaje_reconocimiento) / 2, 2);

        // Cálculo de diferencias por suplencia
        $diferencia_sueldo = 'SIN SUPLENCIA ACTIVA';
        $diferencia_antiguedad = 'SIN SUPLENCIA ACTIVA';
        $diferencia_profesionalizacion = 'SIN SUPLENCIA ACTIVA';
        $diferencia_jerarquia = 'SIN SUPLENCIA ACTIVA';
        $salario_suplencia = 0;
        
        if (isset($suplencias[$data['cedula']])) {
            foreach ($suplencias[$data['cedula']] as $suplencia) {
                if ($suplencia['sup_activa'] == 1) {
                    $salario_suplencia = $suplencia['salario_suplencia'];
                    
                    // Diferencia de sueldo básico
                    $diferencia = max($salario_suplencia, $data['salario_base']) - min($salario_suplencia, $data['salario_base']);
                    $diferencia_sueldo = round($diferencia / 2, 2);
                    
                    // Diferencia de antigüedad
                    $antiguedad_suplencia = round(($salario_suplencia * $porcentaje_antiguedad) / 2, 2);
                    $diferencia_antiguedad = round($antiguedad_suplencia - $antiguedad_quincenal, 2);
                    
                    // Diferencia de profesionalización
                    $profesionalizacion_suplencia = round(($salario_suplencia / 2) * $porcentaje, 2);
                    $diferencia_profesionalizacion = round($profesionalizacion_suplencia - $profesionalizacion, 2);
                    
                    // Diferencia de jerarquía
                    $porcentaje_jerarquia_suplencia = 0;
                    if (isset($suplencia['cargo_suplencia'])) {
                        $cargo_suplencia = $suplencia['cargo_suplencia'];
                        if (stripos($cargo_suplencia, 'Contralor') !== false) {
                            $porcentaje_jerarquia_suplencia = 95.00;
                        } elseif ($cargo_suplencia == 'DIRECTOR(A) GENERAL') {
                            $porcentaje_jerarquia_suplencia = 93.00;
                        } elseif (stripos($cargo_suplencia, 'Director') !== false) {
                            $porcentaje_jerarquia_suplencia = 90.00;
                        } elseif (stripos($cargo_suplencia, 'Jefe de división general') !== false) {
                            $porcentaje_jerarquia_suplencia = 85.00;
                        } elseif (stripos($cargo_suplencia, 'Coordinador') !== false || 
                                 stripos($cargo_suplencia, 'Supervisor') !== false || 
                                 stripos($cargo_suplencia, 'Jefe de División') !== false) {
                            $porcentaje_jerarquia_suplencia = 80.00;
                        }
                    }
                    
                    $prima_jerarquia_suplencia = round(($suplencia['salario_historico_suplencia'] * $porcentaje_jerarquia_suplencia / 100 / 2), 2);
                    $diferencia_jerarquia = round($prima_jerarquia_suplencia - $data['prima_jerarquia'], 2);
                    
                    break; // Tomamos la primera suplencia activa encontrada
                }
            }
        }

        // Cálculo del total de asignaciones con redondeo preciso
        $total_asignaciones = round($sueldo_quincenal + $antiguedad_quincenal + $profesionalizacion + $data['prima_jerarquia'] + 
                             $prima_transporte + $prima_reconocimiento + $prima_hogares + $complemento_alimentacion + $prima_hijos, 2);
        
        // Sumar diferencias si existen (convertir texto a 0)
        $total_asignaciones += is_numeric($diferencia_sueldo) ? $diferencia_sueldo : 0;
        $total_asignaciones += is_numeric($diferencia_antiguedad) ? $diferencia_antiguedad : 0;
        $total_asignaciones += is_numeric($diferencia_profesionalizacion) ? $diferencia_profesionalizacion : 0;
        $total_asignaciones += is_numeric($diferencia_jerarquia) ? $diferencia_jerarquia : 0;

        // Redondeo final para garantizar precisión
        $total_asignaciones = round($total_asignaciones, 2);

        // Cálculo de la asignación mensual
        $asignacion_mensual = round((
            $sueldo_quincenal + 
            $antiguedad_quincenal + 
            $profesionalizacion + 
            $data['prima_jerarquia'] + 
            $prima_transporte + 
            $prima_reconocimiento + 
            $prima_hogares
        ) * 2, 2);

        // Cálculo del semanal para IVSS
        $semanal_ivss = 0;
        if ($asignacion_mensual > 650.00) {
            $semanal_ivss = 150.00;
        } else {
            $semanal_ivss = round((($asignacion_mensual / 2) * 24) / 52, 2);
        }

        // Cálculo del seguro del empleado
        $seguro_empleado = 0;
        if ($asignacion_mensual > 650.00) {
            $base_calculo = 650.00;
            $seguro_empleado = round((($base_calculo * 12) / 52) * $porcentaje_seguro_empleado * $cantidad_lunes, 2);
        } else {
            $base_calculo = $asignacion_mensual / 2;
            $seguro_empleado = round((($base_calculo * 24) / 52) * $porcentaje_seguro_empleado * $cantidad_lunes, 2);
        }

        // Cálculo del seguro patronal (misma lógica que seguro empleado pero con diferente porcentaje)
        $seguro_patronal = 0;
        if ($asignacion_mensual > 650.00) {
            $base_calculo = 650.00;
            $seguro_patronal = round((($base_calculo * 12) / 52) * $porcentaje_seguro_patronal * $cantidad_lunes, 2);
        } else {
            $base_calculo = $asignacion_mensual / 2;
            $seguro_patronal = round((($base_calculo * 24) / 52) * $porcentaje_seguro_patronal * $cantidad_lunes, 2);
        }

        // Cálculo del R.P.E Empleado
        $rpe_empleado = 0;
        $limite_rpe = 130 * 10; // 130 * 10 = 1300
        
        if ($asignacion_mensual > $limite_rpe) {
            $base_calculo = $limite_rpe;
            $rpe_empleado = round((($base_calculo * 12) / 52) * $porcentaje_rpe_empleado * $cantidad_lunes, 2);
        } else {
            $base_calculo = $asignacion_mensual / 2;
            $rpe_empleado = round((($base_calculo * 24) / 52) * $porcentaje_rpe_empleado * $cantidad_lunes, 2);
        }

        // Cálculo del R.P.E Patronal (misma lógica que R.P.E Empleado pero con diferente porcentaje)
        $rpe_patronal = 0;
        if ($asignacion_mensual > $limite_rpe) {
            $base_calculo = $limite_rpe;
            $rpe_patronal = round((($base_calculo * 12) / 52) * $porcentaje_rpe_patronal * $cantidad_lunes, 2);
        } else {
            $base_calculo = $asignacion_mensual / 2;
            $rpe_patronal = round((($base_calculo * 24) / 52) * $porcentaje_rpe_patronal * $cantidad_lunes, 2);
        }

        // Cálculo del FAOV Empleado (1% del total de asignaciones)
        $faov_empleado = round($total_asignaciones * $porcentaje_faov_empleado, 2);

        // Cálculo del FAOV Patronal (2% del total de asignaciones)
        $faov_patronal = round($faov_empleado * $porcentaje_faov_patronal, 2);

        // Cálculo del FEJP Empleado y Patronal
        $base_fejp = $sueldo_quincenal + $antiguedad_quincenal;
        
        // Sumar diferencias si son numéricas
        $base_fejp += is_numeric($diferencia_sueldo) ? $diferencia_sueldo : 0;
        $base_fejp += is_numeric($diferencia_antiguedad) ? $diferencia_antiguedad : 0;
        
        $fejp = round($base_fejp * $porcentaje_fejp, 2);

        // Cálculo de Caja Empleado y Patronal - VERSIÓN CORREGIDA
        $caja_ahorro = 'No está en caja de ahorro';
        
        // Verificar si el empleado está en la tabla tescep
        if (isset($cajas_ahorro[$data['cedula']])) {
            $cep_activa = $cajas_ahorro[$data['cedula']][0]['cep_activa']; // Accedemos correctamente al valor
            
            if ($cep_activa == 1) {
                // Calcular base para caja de ahorro
                $base_caja = $sueldo_quincenal;
                
                // Sumar diferencia de sueldo si existe
                $base_caja += is_numeric($diferencia_sueldo) ? $diferencia_sueldo : 0;
                
                // Calcular caja de ahorro
                $caja_ahorro = round($base_caja * $porcentaje_caja, 2);
            }
        }

        // Cálculo del total de deducciones
        $total_deducciones = 0;
        
        // Sumar solo las deducciones del empleado (no patronales)
        if (is_numeric($seguro_empleado)) $total_deducciones += $seguro_empleado;
        if (is_numeric($rpe_empleado)) $total_deducciones += $rpe_empleado;
        if (is_numeric($faov_empleado)) $total_deducciones += $faov_empleado;
        if (is_numeric($fejp)) $total_deducciones += $fejp;
        if (is_numeric($caja_ahorro)) $total_deducciones += $caja_ahorro;
        
        $total_deducciones = round($total_deducciones, 2);

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
        $sheet->setCellValue('J' . $row, $antiguedad_quincenal);
        $sheet->setCellValue('K' . $row, $profesionalizacion);
        $sheet->setCellValue('L' . $row, $data['prima_jerarquia']);
        $sheet->setCellValue('M' . $row, $prima_transporte);
        $sheet->setCellValue('N' . $row, $prima_reconocimiento);
        $sheet->setCellValue('O' . $row, $prima_hogares);
        $sheet->setCellValue('P' . $row, $complemento_alimentacion);
        $sheet->setCellValue('Q' . $row, $prima_hijos);
        $sheet->setCellValue('R' . $row, $diferencia_sueldo);
        $sheet->setCellValue('S' . $row, $diferencia_antiguedad);
        $sheet->setCellValue('T' . $row, $diferencia_profesionalizacion);
        $sheet->setCellValue('U' . $row, $diferencia_jerarquia);
        $sheet->setCellValue('V' . $row, $total_asignaciones);
        $sheet->setCellValue('W' . $row, $total_deducciones);
        $sheet->setCellValue('X' . $row, $asignacion_mensual);
        $sheet->setCellValue('Y' . $row, $semanal_ivss);
        $sheet->setCellValue('Z' . $row, $seguro_empleado);
        $sheet->setCellValue('AA' . $row, $seguro_patronal);
        $sheet->setCellValue('AB' . $row, $rpe_empleado);
        $sheet->setCellValue('AC' . $row, $rpe_patronal);
        $sheet->setCellValue('AD' . $row, $faov_empleado);
        $sheet->setCellValue('AE' . $row, $faov_patronal);
        $sheet->setCellValue('AF' . $row, $fejp);
        $sheet->setCellValue('AG' . $row, $caja_ahorro);
        
        $row++;
        $contador++;
    }

    // Aplicar formato numérico a las columnas numéricas
    $sheet->getStyle('H2:AG' . $row)->getNumberFormat()->setFormatCode('#,##0.00');

    // Estilo para el contenido
    $contentStyle = [
        'alignment' => [
            'wrapText' => true,
            'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_TOP,
        ],
    ];
    $sheet->getStyle('A2:AG' . $row)->applyFromArray($contentStyle);

    // Configurar anchos de columnas específicas para mejor visualización
    $sheet->getColumnDimension('A')->setWidth(5);  // N°
    $sheet->getColumnDimension('B')->setWidth(12); // CÉDULA
    $sheet->getColumnDimension('C')->setWidth(20); // NOMBRE
    $sheet->getColumnDimension('D')->setWidth(20); // APELLIDO
    $sheet->getColumnDimension('E')->setWidth(30); // CARGO CET
    $sheet->getColumnDimension('F')->setWidth(30); // CARGO ONAPRE
    $sheet->getColumnDimension('G')->setWidth(12); // FECHA INGRESO
    $sheet->getColumnDimension('H')->setWidth(12); // SALARIO BASE
    $sheet->getColumnDimension('I')->setWidth(12); // SALARIO BASE QUINCENAL
    $sheet->getColumnDimension('J')->setWidth(12); // ANTIGUEDAD QUINCENAL
    $sheet->getColumnDimension('K')->setWidth(12); // PROFESIONALIZACIÓN QUINCENAL
    $sheet->getColumnDimension('L')->setWidth(12); // PRIMA POR JERARQUÍA
    $sheet->getColumnDimension('M')->setWidth(12); // PRIMA DE TRANSPORTE
    $sheet->getColumnDimension('N')->setWidth(12); // PRIMA DE RECONOCIMIENTO
    $sheet->getColumnDimension('O')->setWidth(12); // PRIMA DE HOGARES
    $sheet->getColumnDimension('P')->setWidth(12); // COMPLEMENTO DE ALIMENTACIÓN
    $sheet->getColumnDimension('Q')->setWidth(12); // PRIMA POR HIJOS
    $sheet->getColumnDimension('R')->setWidth(23); // DIFERENCIA DE SUELDO BÁSICO
    $sheet->getColumnDimension('S')->setWidth(23); // DIFERENCIA DE ANTIGUEDAD
    $sheet->getColumnDimension('T')->setWidth(23); // DIFERENCIA DE PROFESIONALIZACIÓN
    $sheet->getColumnDimension('U')->setWidth(23); // DIFERENCIA DE JERARQUÍA
    $sheet->getColumnDimension('V')->setWidth(12); // TOTAL DE ASIGNACIONES
    $sheet->getColumnDimension('W')->setWidth(12); // TOTAL DE DEDUCCIONES
    $sheet->getColumnDimension('X')->setWidth(12); // ASIGNACIÓN MENSUAL
    $sheet->getColumnDimension('Y')->setWidth(12); // SEMANAL PARA EL IVSS
    $sheet->getColumnDimension('Z')->setWidth(12); // SEGURO EMPLEADO
    $sheet->getColumnDimension('AA')->setWidth(12); // SEGURO PATRONAL
    $sheet->getColumnDimension('AB')->setWidth(12); // R.P.E EMPLEADO
    $sheet->getColumnDimension('AC')->setWidth(12); // R.P.E PATRONAL
    $sheet->getColumnDimension('AD')->setWidth(12); // FAOV EMPLEADO
    $sheet->getColumnDimension('AE')->setWidth(12); // FAOV PATRONAL
    $sheet->getColumnDimension('AF')->setWidth(12); // FEJP EMPLEADO Y PATRONAL
    $sheet->getColumnDimension('AG')->setWidth(20); // CAJA EMPLEADO Y PATRONAL

    // Congelar la primera fila (encabezados)
    $sheet->freezePane('A2');

    // Generar nombre del archivo con formato: Mes_Contralor y Funcionarios_Fecha
    $meses = [
        1 => 'Enero', 2 => 'Febrero', 3 => 'Marzo', 4 => 'Abril',
        5 => 'Mayo', 6 => 'Junio', 7 => 'Julio', 8 => 'Agosto',
        9 => 'Septiembre', 10 => 'Octubre', 11 => 'Noviembre', 12 => 'Diciembre'
    ];
    // Obtener fecha actual 
    $fecha_actual = new DateTime('now', new DateTimeZone('America/Caracas'));
    $mes_actual = $meses[(int)$fecha_actual->format('n')];
    $fecha_descarga = $fecha_actual->format('d-m-Y');
    
    $nombre_archivo = $mes_actual . '_Contralor y Funcionarios_' . $fecha_descarga . '.xlsx';

    // Configurar el writer y descargar el archivo
    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment;filename="' . $nombre_archivo . '"');
    header('Cache-Control: max-age=0');

    $writer = new Xlsx($spreadsheet);
    $writer->save('php://output');
    exit;
?>