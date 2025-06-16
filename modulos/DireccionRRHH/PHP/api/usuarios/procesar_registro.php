<?php
    require '../../../conexion/conexion.php';
    require '../validar-jwt-js.php';

    if ($_SERVER["REQUEST_METHOD"] === "POST") {
        // 1. Establecer usuario responsable desde JWT
        $usuarioResponsable = $decoded->data->cedula;
        $pdo->exec("SET @usuario_php = " . $pdo->quote($usuarioResponsable));

        // 2. Obtener datos del formulario
        $cedula         = $_POST['cedula'];
        $nombre         = $_POST['nombre'];
        $apellidos      = $_POST['apellidos'];
        $fechaIngreso   = $_POST['fechaingreso'];
        $genero         = $_POST['generoEmpleado'] ?? null;
        $numeroHijos    = $_POST['numeroHijos'];
        $nivelprof      = $_POST['nivelprof'];
        $cargoCet       = $_POST['cargocet'];
        $cargoOnapre    = $_POST['cargoonapre'];
        $nivelsalarial  = $_POST['nivelsalarial'];
        $departamento   = $_POST['departamentoasig'];

        try {
            // 3. Insertar registro (el trigger registrará automáticamente el cambio)
            $stmt = $pdo->prepare("INSERT INTO tmanom 
                (nom_ced, nom_nom, nom_ape, nom_fec, nom_gen, nom_nhi, nom_pro, cet_ide, ona_ide, nvl_ran, dep_ide) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

            $stmt->execute([
                $cedula,
                $nombre,
                $apellidos,
                $fechaIngreso,
                $genero,
                $numeroHijos,
                $nivelprof,
                $cargoCet,
                $cargoOnapre,
                $nivelsalarial,
                $departamento
            ]);

            header("Location: ../../../html/index.php?status=success");
            exit;
        } catch (PDOException $e) {
            header("Location: ../../../html/Register-NewUser.php?status=error&message=" . urlencode($e->getMessage()));
            exit;
        }
    }