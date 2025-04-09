<?php
// Eliminar la cookie
setcookie('token', '', time() - 3600, '/', '', false, true);

// Redireccionar al login
header('Location: ../../html/auth-login-basic.php');
exit;
