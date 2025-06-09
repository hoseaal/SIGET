
let expirationMessageShown = false;

async function checkExpiracionToken() {
    if (expirationMessageShown) return;
    
    try {
        const respuesta = await fetch('../PHP/api/check_token.php');
        const valor = await respuesta.json();
        
        if (valor.status === 'expired' && !expirationMessageShown) {
            expirationMessageShown = true;
            verMensajeSesionExpirada();
        }
    } catch (error) {
        console.error('Error al verificar token:', error);
    }
}

function verMensajeSesionExpirada() {
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
            clearInterval(tokenCheckInterval);
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

const tokenCheckInterval = setInterval(checkExpiracionToken, 30000);

// Verificar al cargar la página
document.addEventListener('DOMContentLoaded', checkExpiracionToken);