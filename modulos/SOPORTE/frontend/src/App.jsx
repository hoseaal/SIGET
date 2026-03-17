import { useState, useEffect } from 'react';
import { PlusCircle, Search, Edit2, Trash2, X, Save, RefreshCw } from 'lucide-react';

const API_URL = '/api/equipos';

const initialFormState = {
  nro_bien: '', nombre_equipo: '', direccion_oficina: '', tipo_equipo: '',
  puerto_switch: '', mobo_marca: '', mobo_modelo: '', mobo_serial: '',
  disco_marca: '', disco_serial: '', disco_capacidad_gb: '', ram_marca: '',
  ram_tipo: '', ram_capacidad_gb: '', ram_serial: '', fuente_marca: '',
  fuente_vatios: '', fuente_serial: '', fuente_bien_mueble: '',
  unidad_optica_marca: '', unidad_optica_serial: '', sistema_operativo: '',
  version_office: '', elaborado_por: '', observaciones: ''
};

function App() {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);

  // Traer los datos que ya están en la base de datos
  const fetchEquipos = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Error al cargar los datos');
      const data = await res.json();
      setEquipos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Enviar o actualizar los datos
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_URL}/${editingId}` : API_URL;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Error al guardar');
      }

      await fetchEquipos(); // Recargar datos
      handleCloseForm();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Borrar equipo
  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este equipo?')) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      await fetchEquipos();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleEdit = (equipo) => {
    // Normalizar null a string vacío
    const normalizedData = {};
    for (const key in initialFormState) {
      normalizedData[key] = equipo[key] === null ? '' : equipo[key];
    }
    setFormData(normalizedData);
    setEditingId(equipo.id_registro);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setFormData(initialFormState);
    setEditingId(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-xl shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-blue-900 border-l-4 border-blue-600 pl-3">SOPORTE TÉCNICO</h1>
            <p className="text-sm text-gray-500 mt-1">Gestión de Equipos de Cómputo</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={fetchEquipos} 
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refrescar
            </button>
            {!showForm && (
              <button 
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md shadow-blue-200 transition-all cursor-pointer"
              >
                <PlusCircle size={16} />
                Nuevo Equipo
              </button>
            )}
          </div>
        </header>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200">
            {error}
          </div>
        )}

        {showForm ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-blue-50/50 p-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">
                {editingId ? 'Editar Equipo Formulario' : 'Registro de Nuevo Equipo'}
              </h2>
              <button onClick={handleCloseForm} className="text-gray-400 hover:text-red-500 transition-colors p-1 cursor-pointer">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Datos del Bien Mueble */}
                <div className="col-span-full border-b pb-2 mb-2">
                  <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider">Datos del Bien Mueble</h3>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nro Bien *</label>
                  <input required name="nro_bien" value={formData.nro_bien} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nombre Equipo</label>
                  <input name="nombre_equipo" value={formData.nombre_equipo} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Dirección Oficina</label>
                  <input name="direccion_oficina" value={formData.direccion_oficina} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tipo Equipo</label>
                  <input name="tipo_equipo" value={formData.tipo_equipo} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Puerto Switch</label>
                  <input type="number" name="puerto_switch" value={formData.puerto_switch} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm outline-none transition-all" />
                </div>

                {/* Hardware: Tarjeta Madre & Disco */}
                <div className="col-span-full border-b pb-2 mb-2 mt-4">
                  <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider">Motherboard & Disco Duro</h3>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Mobo Marca</label>
                  <input name="mobo_marca" value={formData.mobo_marca} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Mobo Modelo</label>
                  <input name="mobo_modelo" value={formData.mobo_modelo} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Mobo Serial</label>
                  <input name="mobo_serial" value={formData.mobo_serial} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Disco Marca</label>
                  <input name="disco_marca" value={formData.disco_marca} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Disco Capacidad (GB)</label>
                  <input type="number" name="disco_capacidad_gb" value={formData.disco_capacidad_gb} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Disco Serial</label>
                  <input name="disco_serial" value={formData.disco_serial} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm outline-none transition-all" />
                </div>

                {/* RAM e Insumos */}
                <div className="col-span-full border-b pb-2 mb-2 mt-4">
                  <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider">RAM & Fuente de Poder</h3>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">RAM Marca</label>
                  <input name="ram_marca" value={formData.ram_marca} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">RAM Tipo</label>
                  <input name="ram_tipo" placeholder="DDR4" value={formData.ram_tipo} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">RAM Capacidad (GB)</label>
                  <input type="number" name="ram_capacidad_gb" value={formData.ram_capacidad_gb} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">RAM Serial</label>
                  <input name="ram_serial" value={formData.ram_serial} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Fuente Marca</label>
                  <input name="fuente_marca" value={formData.fuente_marca} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Fuente Vatios</label>
                  <input type="number" name="fuente_vatios" value={formData.fuente_vatios} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Fuente Serial</label>
                  <input name="fuente_serial" value={formData.fuente_serial} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Fuente Nro Bien</label>
                  <input name="fuente_bien_mueble" value={formData.fuente_bien_mueble} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm outline-none transition-all" />
                </div>

                {/* Otros */}
                <div className="col-span-full border-b pb-2 mb-2 mt-4">
                  <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider">Óptica & Software & Administrativo</h3>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">U. Óptica Marca</label>
                  <input name="unidad_optica_marca" value={formData.unidad_optica_marca} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">U. Óptica Serial</label>
                  <input name="unidad_optica_serial" value={formData.unidad_optica_serial} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Sistema Operativo</label>
                  <input name="sistema_operativo" value={formData.sistema_operativo} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Versión Office</label>
                  <input name="version_office" value={formData.version_office} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Elaborado por</label>
                  <input name="elaborado_por" value={formData.elaborado_por} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm outline-none transition-all" />
                </div>
                <div className="col-span-full">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Observaciones</label>
                  <textarea name="observaciones" value={formData.observaciones} onChange={handleChange} rows="2" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm outline-none transition-all"></textarea>
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={handleCloseForm} className="px-5 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="px-5 py-2 text-sm text-white bg-blue-600 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-md transition-all cursor-pointer">
                  <Save size={16} />
                  {loading ? 'Guardando...' : (editingId ? 'Actualizar' : 'Guardar')}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {equipos.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <Search size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg mb-2">No hay equipos registrados</p>
                <p className="text-sm">Agrega un nuevo equipo con el botón superior.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 tracking-wider">
                      <th className="p-4 font-semibold">Nro Bien</th>
                      <th className="p-4 font-semibold">Equipo</th>
                      <th className="p-4 font-semibold">Ubicación / Tipo</th>
                      <th className="p-4 font-semibold">SO</th>
                      <th className="p-4 font-semibold text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {equipos.map(eq => (
                      <tr key={eq.id_registro} className="hover:bg-blue-50/30 transition-colors">
                        <td className="p-4 font-medium text-gray-900">{eq.nro_bien}</td>
                        <td className="p-4">
                          <div className="text-gray-900 font-medium">{eq.nombre_equipo || '-'}</div>
                          <div className="text-xs text-gray-500 mt-0.5">Mobo: {eq.mobo_marca}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-gray-900">{eq.direccion_oficina || '-'}</div>
                          <div className="text-xs text-blue-600 mt-0.5 bg-blue-50 inline-block px-1.5 py-0.5 rounded">{eq.tipo_equipo || 'N/A'}</div>
                        </td>
                        <td className="p-4 text-gray-600">{eq.sistema_operativo || '-'}</td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleEdit(eq)}
                              className="p-1.5 text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors cursor-pointer"
                              title="Editar"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(eq.id_registro)}
                              className="p-1.5 text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors cursor-pointer"
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
