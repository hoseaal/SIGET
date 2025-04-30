import React, { useState, useEffect } from 'react';
import { fetchTableColumns, fetchData } from '../../data/fetchData';

export const Categorias = () => {
    //categoria
   const [columns, setColumns] = useState([]);
   const [idColumn, setIdColumn] = useState(null);
   const [data, setData] = useState([]);

   //subcategoria
   const [columns2, setColumns2] = useState([]);
   const [idColumn2, setIdColumn2] = useState(null);
   const [data2, setData2] = useState([]);

   const [loading, setLoading] = useState(true);
 
   // Obtener columnas de categoría
   useEffect(() => {
     const loadData = async () => {
       try {
         const { columns, idColumn } = await fetchTableColumns('tmacat');
         setColumns(columns);
         setIdColumn(idColumn);
       } catch (error) {
         console.error("Error cargando columnas:", error);
       } finally {
         setLoading(false);
       }
     };
     loadData();
   }, []);

   // Obtener columnas de sub-categoría
   useEffect(() => {
    const loadData = async () => {
      try {
        const { columns2, idColumn2 } = await fetchTableColumns('tessca');
        setColumns2(columns2);
        setIdColumn2(idColumn2);
      } catch (error) {
        console.error("Error cargando columnas:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [columns]);
 
   // Obtener datos cuando las columnas de categoría estén listas
   useEffect(() => {
     if (columns.length > 0) {
       const fetchAllData = async () => {
         try {
           const registrosData = await fetchData('tmacat', '*');
           setData(registrosData);
         } catch (error) {
           console.error("Error cargando datos:", error);
         }
       };
       fetchAllData();
     }
   }, [columns2]);

   // Obtener datos cuando las columnas de categoría estén listas
   useEffect(() => {
    if (columns2.length > 0) {
      const fetchAllData = async () => {
        try {
          const registrosData2 = await fetchData('tmacat', '*');
          setData2(registrosData2);
        } catch (error) {
          console.error("Error cargando datos:", error);
        }
      };
      fetchAllData();
    }
  }, [columns2]);
 
   if (loading) return <div>Cargando...</div>;

   console.log("Datos recibidos:", data);

   return (
        <div>
            <h4 className="py-3 mb-4"><span className="text-muted fw-light">Configuración General /</span> Categorias</h4>
            <div className="card">
                <h5 className="card-header">Categorias</h5>
                <div className="table-responsive text-nowrap">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                {columns.map((col, index) => (
                                    <th key={index}>{col}</th>
                                ))}
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody className="table-border-bottom-0">
                            {data.map((item, index) => (
                                <tr key={index}>
                                    {columns.map((col) => (
                                        <td key={`${index}-${col}`}>
                                            {item[col] || 'N/A'}
                                        </td>
                                    ))}
                                    <td>
                                        <div className="dropdown">
                                            <button aria-label='Click me' type="button" className="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                                                <i className="bx bx-dots-vertical-rounded"></i>
                                            </button>
                                            <div className="dropdown-menu">
                                                <a aria-label="dropdown action option" className="dropdown-item" href="#">
                                                    <i className="bx bx-edit-alt me-1"></i> Edit</a>
                                                <a aria-label="dropdown action option" className="dropdown-item" href="#">
                                                    <i className="bx bx-trash me-1"></i> Delete</a>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <hr className="my-5" />
            {/* subcategorias */}
            <div className="card">
                <h5 className="card-header">Sub-Categorias</h5>
                <div className="table-responsive text-nowrap">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                {columns2.map((col, index) => (
                                    <th key={index}>{col}</th>
                                ))}
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody className="table-border-bottom-0">
                            {data2.map((item, index) => (
                                <tr key={index}>
                                    {columns.map((col) => (
                                        <td key={`${index}-${col}`}>
                                            {item[col] || 'N/A'}
                                        </td>
                                    ))}
                                    <td>
                                        <div className="dropdown">
                                            <button aria-label='Click me' type="button" className="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                                                <i className="bx bx-dots-vertical-rounded"></i>
                                            </button>
                                            <div className="dropdown-menu">
                                                <a aria-label="dropdown action option" className="dropdown-item" href="#">
                                                    <i className="bx bx-edit-alt me-1"></i> Edit</a>
                                                <a aria-label="dropdown action option" className="dropdown-item" href="#">
                                                    <i className="bx bx-trash me-1"></i> Delete</a>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}