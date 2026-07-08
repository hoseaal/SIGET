export async function generarConstancia(empleadoId, cedula) {
    const res = await fetch(
        `/api/constancias/trabajo?empleado_id=${empleadoId}`,
        { credentials: 'include' }
    );
    if (!res.ok) throw new Error('No se pudo generar la constancia');

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Constancia_${cedula || 'trabajo'}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
}
