<?php
    // Destrucción total de la sesión
    if (session_status() === PHP_SESSION_NONE) session_start();
    $_SESSION = [];
    session_unset();
    session_destroy();

    // Eliminación agresiva de cookies
    setcookie('token', '', [
        'expires' => time() - 3600,
        'path' => '/',
        'domain' => $_SERVER['HTTP_HOST'],
        'secure' => true,
        'httponly' => true,
        'samesite' => 'Strict'
    ]);

    // URL absoluta
    $redirectUrl = 'http://'.$_SERVER['HTTP_HOST'].'/SIGET/modulos/DireccionRRHH/html/auth-login-basic.php';

    // Solución instantánea para Firefox
    echo <<<HTML
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <title>Redireccionando...</title>
        <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
        <style>
            .swal2-container {
                z-index: 999999 !important;
            }
        </style>
        <script>
            // Mostrar mensaje INSTANTÁNEO
            Swal.fire({
                title: 'Sesión cerrada',
                text: 'Redirigiendo al login...',
                icon: 'info',
                showConfirmButton: false,
                allowOutsideClick: false,
                didOpen: () => {
                    // BLOQUEO HIPER-RÁPIDO DEL HISTORIAL
                    history.pushState(null, null, location.href);
                    
                    // Bucle de protección cada 100ms (casi instantáneo)
                    setInterval(() => {
                        history.replaceState(null, null, '{$redirectUrl}');
                    }, 100);
                    
                    // Redirección ultra-rápida
                    setTimeout(() => {
                        location.replace('{$redirectUrl}');
                    }, 10); // 10ms - casi imperceptible
                }
            });

            // Protección continua contra el retroceso
            window.onpopstate = function() {
                Swal.fire({
                    title: 'Sesión finalizada',
                    text: 'Será redirigido al login',
                    icon: 'warning',
                    showConfirmButton: false,
                    timer: 1500,
                    didOpen: () => {
                        location.replace('{$redirectUrl}');
                    }
                });
                history.pushState(null, null, location.href);
            };
        </script>
        <!-- Redirección por si falla JS -->
        <meta http-equiv="refresh" content="0;url={$redirectUrl}">
    </head>
    <body>
        <noscript>
            <meta http-equiv="refresh" content="0;url={$redirectUrl}">
        </noscript>
    </body>
    </html>
    HTML;
    exit;
?>