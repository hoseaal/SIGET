<?php
    require_once '../../../conexion/conexion.php';

    header('Content-Type: application/json');

    try {
        if (!isset($_GET['nvl_ide'])) {
            throw new Exception('ID de nivel salarial no proporcionado');
        }

        $nvl_ide = $_GET['nvl_ide'];

        // Consulta para obtener los detalles completos del nivel salarial
        $query = $pdo->prepare("
            SELECT 
                t.nvl_ide,
                t.nvl_ran,
                t.nvl_sal,
                t.ona_ide,
                o.ona_car
            FROM tesnvl t
            LEFT JOIN tesona o ON t.ona_ide = o.ona_ide
            WHERE t.nvl_ide = :nvl_ide
        ");
        
        $query->bindParam(':nvl_ide', $nvl_ide, PDO::PARAM_INT);
        $query->execute();
        
        $salary = $query->fetch(PDO::FETCH_ASSOC);

        if (!$salary) {
            throw new Exception('Nivel salarial no encontrado');
        }

        // Convertir el salario a float
        $salary['nvl_sal'] = (float)$salary['nvl_sal'];

        echo json_encode([
            'success' => true,
            'salary' => $salary
        ]);
        
    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error en la base de datos: ' . $e->getMessage()
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
?>