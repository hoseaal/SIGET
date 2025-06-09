let mensajeExpiracionMostrado = false;

async function verificarExpiracionToken() {
    if (mensajeExpiracionMostrado) return;
    
    try {
        const respuesta = await fetch('../PHP/api/check_token.php');
        const datos = await respuesta.json();
        
        if (datos.status === 'expired' && !mensajeExpiracionMostrado) {
            mensajeExpiracionMostrado = true;
            mostrarMensajeSesionExpirada();
        }
    } catch (error) {
        console.error('Error al verificar token:', error);
    }
}

function mostrarMensajeSesionExpirada() {
    if (window.location.pathname.includes('auth-login-basic.php')) return;

    Swal.fire({
        title: 'Sesión expirada',
        text: 'Su sesión ha finalizado. Será redirigido al login...',
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        timer: 4000,
        timerProgressBar: true,
        didOpen: () => {
            Swal.showLoading();
        },
        willClose: () => {
            clearInterval(intervaloVerificacionToken);
            document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            // Cambio clave aquí: usar location.replace() en lugar de location.href
            window.location.replace('auth-login-basic.php?nocache=' + Date.now());
            
            // Bloqueo adicional del historial
            if (window.history && window.history.pushState) {
                window.history.pushState(null, null, window.location.href);
                window.addEventListener('popstate', function() {
                    window.history.pushState(null, null, window.location.href);
                });
            }
        }
    });
}

const intervaloVerificacionToken = setInterval(verificarExpiracionToken, 300000);

// Verificar al cargar la página
document.addEventListener('DOMContentLoaded', verificarExpiracionToken);