export const getTableMetadata = async (tableName) => {
  const res = await fetch(`/api/rrhh/meta/table-metadata?table=${tableName}`, {
    credentials: 'include'
  });

  if (!res.ok) throw new Error(`Error obteniendo metadata de ${tableName}`);
  return await res.json();
}
