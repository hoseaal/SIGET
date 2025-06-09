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

    $username = $input['nickname'] ?? '';
    $password = $input['password'] ?? '';

    if (empty($username) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Todos los campos son obligatorios.']);
        exit;
    }

    if (!$pdo) {
        echo json_encode(['success' => false, 'message' => 'Error en la conexión a la base de datos.']);
        exit;
    }

    try {
        // Buscar usuario por username (usu_usu)
        $stmt = $pdo->prepare("
            SELECT tu.usu_usu, tu.usu_con, tu.usu_tip, tu.nom_ced, tu.usu_nom, tu.usu_ape
            FROM tesusu tu
            WHERE tu.usu_usu = :username
        ");
        $stmt->bindParam(':username', $username);
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
            'exp' => time() + (6 * 3600),
            'data' => [
                'username' => $user['usu_usu'],
                'cedula' => $user['nom_ced'],
                'nombre' => $user['usu_nom'],
                'apellido' => $user['usu_ape'],
                'tipo' => $user['usu_tip'],
            ]
        ];

        $jwt = JWT::encode($payload, $secretKey, 'HS256');

        setcookie('token', $jwt, [
            'expires' => $payload['exp'],
            'path' => '/',
            'secure' => true,
            'httponly' => true,
            'samesite' => 'Strict'
        ]);

        echo json_encode([
            'success' => true,
            'token' => $jwt,
            'tipo' => $user['usu_tip'],
            'message' => 'Inicio de sesión exitoso.'
        ]);    

    } catch (PDOException $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Error al iniciar sesión: ' . $e->getMessage()
        ]);
    }