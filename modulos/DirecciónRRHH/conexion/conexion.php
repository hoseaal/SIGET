<?php
    // Parámetros de conexión
    $host = 'localhost';
    $dbname = 'dbsiget';
    $user = 'root';
    $pass = '';

    try {
        // Crear conexión con PDO
        $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
        
        // Establecer el modo de error para que lance excepciones
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Opcional: establecer el modo de retorno de resultados
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    } catch (PDOException $e) {
        // Si hay error en la conexión
        die("Error al conectar con la base de datos: " . $e->getMessage());
    }