<?php
    error_reporting(E_ALL);
    ini_set('display_errors', 1);

    require_once '../../conexion/conexion.php';
    require_once '../../../../vendor/autoload.php';

    use Firebase\JWT\JWT;
    use Firebase\JWT\Key;

    header('Content-Type: application/json');

    // Secret Key
    $secretKey = 'C0ntr@l0r!aD3lEst4d0T@ch!r@';

    $input = json_decode(file_get_contents("php://input"), true);

    $cedula = $input['cedula'] ?? '';
    $password = $input['password'] ?? '';

    if (empty($cedula) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios.']);
        exit;
    }

    if (!$pdo) {
        echo json_encode(['success' => false, 'message' => 'Error en la conexión a la base de datos.']);
        exit;
    }

    try {
        // Buscar usuario por cédula
        $stmt = $pdo->prepare("
            SELECT tu.nom_ced, tu.usu_con, tu.usu_tip, tn.nom_nom, tn.nom_ape
            FROM tesusu tu
            INNER JOIN tmanom tn ON tu.nom_ced = tn.nom_ced
            WHERE tu.nom_ced = :cedula
        ");
        $stmt->bindParam(':cedula', $cedula);
        $stmt->execute();

        if ($stmt->rowCount() === 0) {
            echo json_encode(['success' => false, 'message' => 'Usuario no encontrado.']);
            exit;
        }

        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        // Verificar contraseña
        if (!password_verify($password, $user['usu_con'])) {
            echo json_encode(['success' => false, 'message' => 'Contraseña incorrecta.']);
            exit;
        }

        // Crear payload del JWT
        $payload = [
            'iss' => 'siget.com',
            'aud' => 'siget.com',
            'iat' => time(),
            'exp' => time() + (60 * 60 * 24 * 6),
            'data' => [
                'cedula' => $user['nom_ced'],
                'nombre' => $user['nom_nom'],
                'apellido' => $user['nom_ape'],
                'tipo' => $user['usu_tip'],
            ]
        ];

        $jwt = JWT::encode($payload, $secretKey, 'HS256');

        setcookie('token', $jwt, time() + (60 * 60 * 24 * 6), '/', '', false, true);  // token en la cookie

        echo json_encode([
            'success' => true,
            'token' => $jwt,
            'tipo' => $user['usu_tip'], // redireccionar
            'message' => 'Inicio de sesión exitoso.'
        ]);    

    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error al iniciar sesión: ' . $e->getMessage()
        ]);
    }