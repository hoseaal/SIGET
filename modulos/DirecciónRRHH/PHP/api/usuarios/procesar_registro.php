<?php
require '../../../conexion/conexion.php';

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Obtener y validar los datos del formulario
    $cedula         = $_POST['cedula'];
    $nombre         = $_POST['nombre'];
    $apellidos      = $_POST['apellidos'];
    $fechaIngreso   = $_POST['fechaingreso'];
    $genero         = $_POST['generoEmpleado'] ?? null;
    $numeroHijos    = $_POST['numeroHijos'];
    $cargoCet       = $_POST['cargocet'];
    $cargoOnapre    = $_POST['cargoonapre'];
    $departamento   = $_POST['departamentoasig'];

    try {
        // Preparar consulta
        $stmt = $pdo->prepare("INSERT INTO tmanom 
            (nom_ced, nom_nom, nom_ape, nom_fec, nom_gen, nom_nhi, cet_ide, ona_ide, dep_ide) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");

        // Ejecutar con los valores
        $stmt->execute([
            $cedula,
            $nombre,
            $apellidos,
            $fechaIngreso,
            $genero,
            $numeroHijos,
            $cargoCet,
            $cargoOnapre,
            $departamento
        ]);

        // Redirigir con éxito
        header("Location: ../../../html/index.php?status=success");
        exit;
    } catch (PDOException $e) {
        // Redirigir con error
        header("Location: ../../../html/Register-NewUser.php?status=error");
        exit;
    }
}
?>