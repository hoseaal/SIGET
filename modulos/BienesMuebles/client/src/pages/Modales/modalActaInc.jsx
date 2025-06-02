import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Alert from "../../components/atoms/Alert";

function ModalActaInc({ show, handleClose, BienId, DataBien, limpiarFormulario }) {
  const [formData, setFormData] = useState({});
  const [formEnviado, setFormEnviado] = useState(false);
  const [mensajeMostrado, setMensajeMostrado] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [bienes, setBienes] = useState([]);
  const [bienSeleccionado, setBienSeleccionado] = useState(null);

  // Obtener fecha y hora actual
  const today = new Date();
  const dia = today.getDate().toString();
  const mes = today.toLocaleString('default', { month: 'long' });
  const anio = today.getFullYear().toString().slice(-2);
  const hora = today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const [unidadAdmin, setUnidadAdmin] = useState([]);
  const [marca, setMarca] = useState([]);
  const [modelo, setMod] = useState([]);
  const [concepto, setConcepto] = useState([]);

useEffect(() => {
  const fetchAllData = async () => {
    console.log(DataBien)
    try {
      if (BienId ) {
        const unidadAdminData = await fetchData('tesdep', '*', 'dep_ide', DataBien.dep_ide);
        setUnidadAdmin(unidadAdminData || []);

        const marcaData = await fetchData('tmamar', '*', 'mar_ide', DataBien.mar_ide);
        setMarca(marcaData || []);

        const modelosData = await fetchData('tesmod', '*', 'mod_ide', DataBien.mod_ide);
        setMod(modelosData || []);

        const conceptoData = await fetchData('tmacom', '*', 'com_ide', DataBien.com_ide);
        setConcepto(conceptoData || []);

        console.log(marca)

      }

      if (!BienId) {
        const bienesData = await fetchData('tmab_m', '*', 'bim_inc', 1);
        setBienes(bienesData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  
  fetchAllData();
}, [bienSeleccionado]);

const handleSelectBien = async (e) => {
  const bienId = e.target.value;
  if (!bienId) {
    setBienSeleccionado(null);
    return;
  }

  try {
    const bien = bienes.find(b => b.bim_ide === bienId);
    if (!bien) return;

    console.log(bien.bim_color)
    const unidadAdminData = await fetchData('tesdep', '*', 'dep_ide', bien.dep_ide);
    const marcaData = await fetchData('tmamar', '*', 'mar_ide', bien.mar_ide);
    const modeloData = await fetchData('tesmod', '*', 'mod_ide', bien.mod_ide);
    const conceptoData = await fetchData('tmacom', '*', 'com_ide', DataBien.com_ide);

    setBienSeleccionado({
      id: bien.bim_ide,
      descripcion: bien.bim_des,
      unidadAdministrativa: unidadAdminData?.[0]?.dep_nom || 'No disponible',
      marca: marcaData?.[0]?.mar_mar,
      modelo: modeloData?.[0]?.mod_mod,
      color: bien.bim_color,
      concepto: conceptoData?.[0]?.com_com
    });
  } catch (error) {
    console.error('Error al cargar datos del bien:', error);
    // Podrías mostrar un mensaje al usuario aquí
  }
};

  const handleSubmit = async () => {
    const datosActa = {
      fechaActualizacion: 'DICIEMBRE 2015',
      numeroActa: formData.numeroActa,
      ciudad: 'San Cristóbal',
      dia,
      mes,
      anio,
      hora,
      nombreDirectorAdmin: formData.nombreDirectorAdmin,
      ciDirectorAdmin: formData.ciDirectorAdmin,
      nombreDirectorAsignacion: formData.nombreDirectorAsignacion,
      ciDirectorAsignacion: formData.ciDirectorAsignacion,
      unidadAsignacion: unidadAdmin[0]?.dep_nom,
      nombreJefeCompras: formData.nombreJefeCompras,
      ciJefeCompras: formData.ciJefeCompras,
      nombreAnalistaBienes: formData.nombreAnalistaBienes,
      ciAnalistaBienes: formData.ciAnalistaBienes,
      descripcionIncorporacion: DataBien.bim_des || bienSeleccionado?.descripcion,
      codigoBien: BienId || bienSeleccionado?.id || formData.codigoBien,
      unidadDestino: unidadAdmin[0]?.dep_nom,
      nombreFuncionarioElabora: formData.nombreFuncionarioElabora
    };

    const datosActaCET = {
      fechaActualizacion: 'DICIEMBRE 2015',
      numeroActa: formData.numeroActa,
      ciudad: 'San Cristóbal',
      dia,
      mes,
      anio,
      hora,
      nombreDirectorAdmin: formData.nombreDirectorAdmin,
      ciDirectorAdmin: formData.ciDirectorAdmin,
      nombreDirectorServicios: formData.nombreDirectorServicios, // Nuevo campo
      ciDirectorServicios: formData.ciDirectorServicios, // Nuevo campo
      unidadAsignacion: unidadAdmin[0]?.dep_nom,
      nombreJefeCompras: formData.nombreJefeCompras,
      ciJefeCompras: formData.ciJefeCompras,
      descripcionIncorporacion: DataBien.bim_des || bienSeleccionado?.descripcion,
      codigoBien: BienId || bienSeleccionado?.id || formData.codigoBien,
      modelo: bienSeleccionado?.modelo || modelo[0]?.mod_mod, // Nuevo campo
      marca: bienSeleccionado?.marca || marca[0]?.mar_mar, // Nuevo campo
      color: bienSeleccionado?.color || DataBien.bim_color, // Nuevo campo
      unidadDestino: unidadAdmin[0]?.dep_nom,
      nombreFuncionarioElabora: formData.nombreFuncionarioElabora,
      conceptoMovimiento: bienSeleccionado?.concepto || concepto[0]?.com_com,
      cod_conceptoMov: DataBien.com_ide
    };

    try {
      const [pdfResp1, pdfResp2] = await Promise.all([
        axios.post('/api/generar-acta', datosActa, { responseType: 'blob', withCredentials: true }),
        axios.post('/api/generar-acta-CET', datosActaCET, { responseType: 'blob', withCredentials: true })
      ]);

      const blobs = [pdfResp1, pdfResp2];
      const nombres = ['acta_incorporacion', 'acta_CET'];

      blobs.forEach((res, i) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${nombres[i]}_${BienId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      });

      setFormEnviado(true);
      setMensajeMostrado(true);
      setTimeout(() => setMensajeMostrado(false), 3000);

      setFormData({});
      setBienSeleccionado({});

      
    } catch (error) {
      console.error('Error al generar PDF:', error);
      setFormEnviado(false);
      setMensajeMostrado(true);
      setErrorMessage('Error al generar el PDF');
      setTimeout(() => setMensajeMostrado(false), 3000);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Generar Acta de Incorporación</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {BienId ? (
            <>
              <Form.Group className="mb-2">
                <Form.Label>Codigo del Bien</Form.Label>
                <Form.Control type="text" value={BienId} disabled />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Descripción del Bien</Form.Label>
                <Form.Control type="text" value={DataBien.bim_des} disabled />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Unidad Administrativa</Form.Label>
                <Form.Control type="text" value={unidadAdmin[0]?.dep_nom || DataBien.dep_ide} disabled />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Marca</Form.Label>
                <Form.Control type="text" value={marca[0]?.mar_mar} disabled />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Modelo</Form.Label>
                <Form.Control type="text" value={modelo[0]?.mod_mod} disabled />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Color</Form.Label>
                <Form.Control type="text" value={DataBien.bim_color} disabled />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Concepto de Movimiento</Form.Label>
                <Form.Control type="text" value={concepto[0]?.com_com} disabled />
              </Form.Group>
            </>
          ) : (
            <>
              <Form.Group className="mb-2">
                <Form.Label>Seleccionar Bien</Form.Label>
                <Form.Select onChange={handleSelectBien}>
                  <option value="">Seleccione un bien</option>
                  {bienes.map(bien => {
                      const maxLength = 95; // Máximo de caracteres a mostrar
                      const descripcion = bien.bim_des.length > maxLength 
                          ? `${bien.bim_des.substring(0, maxLength)}...` 
                          : bien.bim_des;
                      
                      return (
                          <option 
                              key={bien.bim_ide} 
                              value={bien.bim_ide}
                              title={bien.bim_des} // Texto completo en tooltip
                          >
                              {bien.bim_ide} - {descripcion}
                          </option>
                      );
                  })}
                </Form.Select>
              </Form.Group>

              {bienSeleccionado && (
                <>
                  <Form.Group className="mb-2">
                    <Form.Label>Descripción del Bien</Form.Label>
                    <Form.Control type="text" value={bienSeleccionado.descripcion} disabled />
                  </Form.Group>

                  <Form.Group className="mb-2">
                    <Form.Label>Unidad Administrativa</Form.Label>
                    <Form.Control type="text" value={bienSeleccionado.unidadAdministrativa || unidadAdmin} disabled />
                  </Form.Group>

                  <Form.Group className="mb-2">
                    <Form.Label>Marca</Form.Label>
                    <Form.Control type="text" value={bienSeleccionado.marca} disabled />
                  </Form.Group>

                  <Form.Group className="mb-2">
                    <Form.Label>Modelo</Form.Label>
                    <Form.Control type="text" value={bienSeleccionado.modelo} disabled />
                  </Form.Group>

                  <Form.Group className="mb-2">
                    <Form.Label>Color</Form.Label>
                    <Form.Control type="text" value={bienSeleccionado.color} disabled />
                  </Form.Group>

                  <Form.Group className="mb-2">
                    <Form.Label>Concepto de Movimiento</Form.Label>
                    <Form.Control type="text" value={bienSeleccionado.concepto} disabled />
                  </Form.Group>
                </>
              )}
            </>
          )}

          <Form.Group className="mb-2">
            <Form.Label>Número de Acta</Form.Label>
            <Form.Control type="text" name="numeroActa" value={formData.numeroActa || ''} onChange={handleChange} />
          </Form.Group>

          {[
            ['nombreDirectorAdmin', 'Nombre Director(a) de Administración'],
            ['ciDirectorAdmin', 'CI Director(a) de Administración'],
            ['nombreDirectorAsignacion', 'Nombre Director(a) de la oficina de Asignación del Bien'],
            ['ciDirectorAsignacion', 'CI Director(a) de la oficina de Asignación del Bien'],
            ['nombreJefeCompras', 'Nombre Jefe de la Division de Compras, Bienes e Iventarios'],
            ['ciJefeCompras', 'CI Jefe de la Division de Compras, Bienes e Iventarios'],
            ['nombreAnalistaBienes', 'Nombre Analista de Bienes e Inventarios IV'],
            ['ciAnalistaBienes', 'CI Analista de Bienes e Inventarios IV'],
            ['nombreDirectorServicios', 'Nombre Director Servicios Generales'],
            ['ciDirectorServicios', 'CI Director Servicios Generales'],
            ['nombreFuncionarioElabora', 'Funcionario que Elabora el Acta']
          ].map(([name, label]) => (
            <Form.Group className="mb-2" controlId={name} key={name}>
              <Form.Label>{label}</Form.Label>
              <Form.Control type="text" name={name} value={formData[name] || ''} onChange={handleChange} />
            </Form.Group>
          ))}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button 
          variant="primary" 
          onClick={() => { handleSubmit(); handleClose(); limpiarFormulario();}}
          disabled={!BienId && !bienSeleccionado}
        >
          Generar PDF
        </Button>
      </Modal.Footer>
      {mensajeMostrado && (
        <Alert key={formEnviado ? 'success' : 'danger'} type={formEnviado ? 'success' : 'danger'}>
          {formEnviado ? 'PDF generado con éxito' : `${errorMessage}`}
        </Alert>
      )}
    </Modal>
  );
}

export default ModalActaInc;