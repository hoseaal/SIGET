<?php
    require '../../../conexion/conexion.php';

    header('Content-Type: application/json');

    try {
        $lastUpdate = isset($_GET['last_update']) ? $_GET['last_update'] : null;
        
        // Consulta para verificar cambios recientes en bit_cep
        $query = "SELECT MAX(bit_fecha) as last_update, 
                        COUNT(*) as change_count 
                FROM bit_cep 
                WHERE bit_tabla = 'tescep'";
        
        if ($lastUpdate) {
            $query .= " AND bit_fecha > :last_update";
        }
        
        $stmt = $pdo->prepare($query);
        
        if ($lastUpdate) {
            $stmt->bindValue(':last_update', $lastUpdate);
        }
        
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $response = [
            'success' => true,
            'has_changes' => ($result['change_count'] > 0),
            'last_update' => $result['last_update'] ?: date('Y-m-d H:i:s')
        ];
        
        echo json_encode($response);
        
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error al verificar actualizaciones de caja: ' . $e->getMessage()
        ]);
    }
?>