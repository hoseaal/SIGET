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

    // Array para almacenar todas las modificaciones
    $allModifications = [];

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
        // Consultar cada tabla de bitácora y combinar resultados
        foreach ($bitacoraTables as $table => $idColumn) {
            // Consulta base para cada tabla de bitácora
            $query = "SELECT 
                        '{$table}' as source_table,
                        b.bit_id,
                        b.bit_tabla,
                        b.bit_operacion,
                        b.{$idColumn} as affected_id,
                        COALESCE(u.usu_usu, b.bit_usuario_responsable) as bit_usuario_responsable,
                        b.bit_detalles,
                        b.bit_fecha,
                        CASE 
                            WHEN b.bit_tabla = 'tesusu' THEN 
                                COALESCE(usu.usu_usu, b.{$idColumn})
                            ELSE b.{$idColumn}
                        END as display_affected_id
                    FROM {$table} b
                    LEFT JOIN tesusu u ON b.bit_usuario_responsable = u.nom_ced
                    LEFT JOIN tesusu usu ON b.bit_tabla = 'tesusu' AND b.{$idColumn} = usu.usu_ide
                    ORDER BY b.bit_fecha DESC
                    LIMIT {$offset}, {$perPage}";
            
            $stmt = $pdo->query($query);
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Agregar resultados al array combinado
            $allModifications = array_merge($allModifications, $results);
        }
        
        // Ordenar todas las modificaciones por fecha (más reciente primero)
        usort($allModifications, function($a, $b) {
            return strtotime($b['bit_fecha']) - strtotime($a['bit_fecha']);
        });
        
        // Obtener el conteo total de registros (para todas las tablas)
        $totalCount = 0;
        foreach ($bitacoraTables as $table => $idColumn) {
            $countQuery = "SELECT COUNT(*) as total FROM {$table}";
            $stmt = $pdo->query($countQuery);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $totalCount += $result['total'];
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