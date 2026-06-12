/**
 * Convierte una URL de imagen a una cadena Base64.
 * @param {string} url - La URL de la imagen.
 * @returns {Promise<string>} - La cadena Base64 de la imagen.
 */
export const getBase64FromUrl = async (url) => {
  const data = await fetch(url);
  const blob = await data.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = reader.result;
      // Eliminar el prefijo "data:image/png;base64," para que ExcelJS lo acepte limpio si es necesario
      // Pero ExcelJS acepta el dataURL completo o solo el base64.
      resolve(base64data);
    };
    reader.onerror = reject;
  });
};
