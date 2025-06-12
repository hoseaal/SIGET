<?php
    header('Content-Type: application/json');
    error_reporting(E_ALL);
    ini_set('display_errors', 1);

    require_once '../../conexion/conexion.php';
    require_once '../../../../vendor/autoload.php';

    use Firebase\JWT\JWT;
    use Firebase\JWT\Key;

    header('Content-Type: application/json');

    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../../../../');
    $dotenv->load();

    // Obtener la clave desde .env
    $secretKey = $_ENV['JWT_SECRET_KEY'];

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
        $stmt = $pdo->prepare("
            SELECT tu.usu_ide, tu.usu_usu, tu.usu_con, tu.usu_tip, tu.nom_ced, tu.usu_nom, tu.usu_ape
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

        if (!password_verify($password, $user['usu_con'])) {
            echo json_encode(['success' => false, 'message' => 'Contraseña incorrecta.']);
            exit;
        }

        $payload = [
            'iss' => $_ENV['JWT_ISSUER'],     
            'aud' => $_ENV['JWT_AUDIENCE'],    
            'iat' => time(),
            'exp' => time() + ($_ENV['JWT_EXPIRATION_HOURS'] * 3600), 
            'data' => [
                'id' => $user['usu_ide'],
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