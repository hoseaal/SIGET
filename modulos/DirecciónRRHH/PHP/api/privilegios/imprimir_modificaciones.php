<?php
    header('Content-Type: application/json');
    require_once '../../../conexion/conexion.php';

    // Obtener parámetros de paginación
    $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
    $perPage = isset($_GET['per_page']) ? intval($_GET['per_page']) : 8;

    // Validar parámetros
    if ($page < 1) $page = 1;
    if ($perPage < 1) $perPage = 8;

    // Calcular offset
    $offset = ($page - 1) * $perPage;

    // Tablas de bitácora a consultar con sus columnas específicas
    $bitacoraTables = [
        'bit_usu' => 'bit_usu_ide',
        'bit_nom' => 'bit_nom_ced',
        'bit_cet' => 'bit_cet_ide',
        'bit_ona' => 'bit_ona_ide',
        'bit_nvl' => 'bit_nvl_ide',
        'bit_sup' => 'bit_sup_ide',
        'bit_cep' => 'bit_cep_ide',
        'bit_ded' => 'bit_ded_ide',
        'bit_pri' => 'bit_pri_ide'
    ];

    try {
        // Paso 1: Obtener el conteo total de registros (para todas las tablas)
        $totalCount = 0;
        foreach ($bitacoraTables as $table => $idColumn) {
            $countQuery = "SELECT COUNT(*) as total FROM {$table}";
            $stmt = $pdo->query($countQuery);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $totalCount += $result['total'];
        }
        
        // Paso 2: Obtener solo los IDs de los registros que corresponden a la página actual
        $unionParts = [];
        foreach ($bitacoraTables as $table => $idColumn) {
            $unionParts[] = "SELECT '{$table}' as source_table, bit_id, bit_fecha FROM {$table}";
        }
        
        $unionQuery = implode(" UNION ALL ", $unionParts);
        $orderedQuery = "SELECT source_table, bit_id FROM ($unionQuery) AS combined ORDER BY bit_fecha DESC LIMIT {$offset}, {$perPage}";
        
        $stmt = $pdo->query($orderedQuery);
        $paginatedRecords = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Paso 3: Obtener los detalles completos solo para los registros paginados
        $allModifications = [];
        foreach ($paginatedRecords as $record) {
            $table = $record['source_table'];
            $idColumn = $bitacoraTables[$table];
            $bitId = $record['bit_id'];
            
            $query = "SELECT 
                    '{$table}' as source_table,
                    b.bit_id,
                    CASE 
                        WHEN b.bit_tabla = 'tescep' THEN 'Caja de Ahorro'
                        WHEN b.bit_tabla = 'tescet' THEN 'Cargos CET'
                        WHEN b.bit_tabla = 'tesded' THEN 'Deducciones'
                        WHEN b.bit_tabla = 'tmanom' THEN 'Tabla de Trabajadores'
                        WHEN b.bit_tabla = 'tesnvl' THEN 'Niveles Salariales'
                        WHEN b.bit_tabla = 'tesona' THEN 'Cargos ONAPRE'
                        WHEN b.bit_tabla = 'tespri' THEN 'Asignaciones'
                        WHEN b.bit_tabla = 'tessup' THEN 'Suplencias de los Trabajadores'
                        WHEN b.bit_tabla = 'tesusu' THEN 'Tabla de Usuarios'
                        ELSE b.bit_tabla
                    END as bit_tabla,
                    b.bit_operacion,
                    b.{$idColumn} as affected_id,
                    COALESCE(u.usu_usu, b.bit_usuario_responsable) as bit_usuario_responsable,
                    b.bit_detalles,
                    b.bit_fecha,
                    CASE 
                        WHEN b.bit_tabla = 'tesusu' THEN 
                            COALESCE(
                                (SELECT bu.bit_usu_usu FROM bit_usu bu WHERE bu.bit_usu_ide = b.{$idColumn} LIMIT 1),
                                usu.usu_usu,
                                b.{$idColumn}
                            )
                        ELSE b.{$idColumn}
                    END as display_affected_id
                FROM {$table} b
                LEFT JOIN tesusu u ON b.bit_usuario_responsable = u.nom_ced
                LEFT JOIN tesusu usu ON b.bit_tabla = 'tesusu' AND b.{$idColumn} = usu.usu_ide
                WHERE b.bit_id = :bit_id";
            
            $stmt = $pdo->prepare($query);
            $stmt->execute([':bit_id' => $bitId]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($result) {
                $allModifications[] = $result;
            }
        }
        
        // Calcular el total de páginas
        $totalPages = ceil($totalCount / $perPage);
        
        // Preparar respuesta
        $response = [
            'success' => true,
            'modifications' => $allModifications,
            'total' => $totalCount,
            'total_pages' => $totalPages,
            'current_page' => $page
        ];
        
    } catch (PDOException $e) {
        $response = [
            'success' => false,
            'message' => 'Error al consultar la base de datos: ' . $e->getMessage()
        ];
    }

    echo json_encode($response);
?>