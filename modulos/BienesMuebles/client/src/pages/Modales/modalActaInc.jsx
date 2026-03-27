import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Alert from "../../components/atoms/Alert";

function ModalActaInc({ show, handleClose, BienId, limpiarFormulario }) {
  const [formData, setFormData] = useState({});
  const [formEnviado, setFormEnviado] = useState(false);
  const [mensajeMostrado, setMensajeMostrado] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [bienData, setBienData] = useState(null);
  const [codigoBienInput, setCodigoBienInput] = useState('');
  const [loading, setLoading] = useState(false);

  const today = new Date();
  const dia = today.getDate().toString();
  const mes = today.toLocaleString('default', { month: 'long' });
  const anio = today.getFullYear().toString().slice(-2);
  const hora = today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const fetchBienData = async () => {
      console.log(BienId)
      if (BienId) {
        try {
          setLoading(true);
          const response = await fetch(`/api/bienes/${BienId}`);
          if (!response.ok) {
            throw new Error('No se pudo obtener los datos del bien');
          }
          const data = await response.json();
          setBienData(data);
        } catch (error) {
          console.error('Error fetching bien data:', error);
          setErrorMessage('Error al cargar los datos del bien');
          setMensajeMostrado(true);
          setTimeout(() => setMensajeMostrado(false), 3000);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchBienData();
  }, [BienId]);

  const handleBuscarBien = async () => {
    if (!codigoBienInput) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/bienes/${codigoBienInput}`);
      if (!response.ok) {
        throw new Error('Este código no está asignado a ningún bien');
      }
      const data = await response.json();
      setBienData(data);
    } catch (error) {
      console.error('Error buscando bien:', error);
      setErrorMessage(error.message);
      setMensajeMostrado(true);
      setBienData(null);
      setTimeout(() => setMensajeMostrado(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const validarDatosActa = (datos) => {
  const camposRequeridos = [
    'numeroActa',
    'ciudad',
    'dia',
    'mes',
    'anio',
    'hora',
    'nombreDirectorAdmin',
    'ciDirectorAdmin',
    'nombreDirectorAsignacion',
    'ciDirectorAsignacion',
    'unidadAsignacion',
    'nombreJefeCompras',
    'ciJefeCompras',
    'nombreAnalistaBienes',
    'ciAnalistaBienes',
    'descripcionIncorporacion',
    'codigoBien',
    'unidadDestino',
    'nombreFuncionarioElabora'
  ];

  return validarCampos(datos, camposRequeridos);
};
      const validarDatosActaCET = (datos) => {
  const camposRequeridos = [
    'numeroActa',
    'ciudad',
    'dia',
    'mes',
    'anio',
    'hora',
    'nombreDirectorAdmin',
    'ciDirectorAdmin',
    'nombreDirectorAsignacion',
    'ciDirectorAsignacion',
    'nombreJefeCompras',
    'ciJefeCompras',
    'codigoBien',
    'descripcionIncorporacion',
    'marca',
    'modelo',
    'color',
    'unidadDestino',
    'conceptoMovimiento',
    'cod_conceptoMov'
  ];

  return validarCampos(datos, camposRequeridos);
};

  const validarCampos = (datos, camposRequeridos) => {
  // Validar campos faltantes
  const camposFaltantes = camposRequeridos.filter(campo => !datos.hasOwnProperty(campo));
  if (camposFaltantes.length > 0) {
    return {
      valido: false,
      error: `Faltan campos requeridos: ${camposFaltantes.join(', ')}`
    };
  }

  // Validar campos vacíos
  const camposVacios = camposRequeridos.filter(campo => {
    const valor = datos[campo];
    return valor === '' || valor === null || valor === undefined;
  });

  if (camposVacios.length > 0) {
    return {
      valido: false,
      error: `Los siguientes campos no pueden estar vacíos: ${camposVacios.join(', ')}`
    };
  }

  // Validar formatos específicos
  const erroresFormato = [];
  
  // Validar CIs (deben ser números)
  if (datos.ciDirectorAdmin && isNaN(datos.ciDirectorAdmin)) {
    erroresFormato.push('CI Director Admin debe ser numérico');
  }
  if (datos.ciDirectorAsignacion && isNaN(datos.ciDirectorAsignacion)) {
    erroresFormato.push('CI Director Asignación debe ser numérico');
  }
  if (datos.ciJefeCompras && isNaN(datos.ciJefeCompras)) {
    erroresFormato.push('CI Jefe Compras debe ser numérico');
  }

  if (erroresFormato.length > 0) {
    return {
      valido: false,
      error: erroresFormato.join('; ')
    };
  }

  return { valido: true };
};

  const handleSubmit = async () => {
    if (!bienData) return;

  const now = new Date();
  const horaCliente = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

  const fechaInc = bienData.bim_fec ? new Date(bienData.bim_fec) : new Date();

    const datosActa = {
      fechaActualizacion: 'DICIEMBRE 2015',
      numeroActa: formData.numeroActa,
      ciudad: 'San Cristóbal',
      dia: (fechaInc.getDate() + 1).toString(), // +1 si hay desfase por zona horaria en strings ISO
      mes: fechaInc.toLocaleString('es-ES', { month: 'long' }),
      anio: fechaInc.getFullYear().toString(),
      hora: horaCliente, // Enviamos la hora del cliente
      nombreDirectorAdmin: formData.nombreDirectorAdmin,
      ciDirectorAdmin: formData.ciDirectorAdmin,
      nombreDirectorAsignacion: formData.nombreDirectorAsignacion,
      ciDirectorAsignacion: formData.ciDirectorAsignacion,
      unidadAsignacion: bienData.departamento,
      nombreJefeCompras: formData.nombreJefeCompras,
      ciJefeCompras: formData.ciJefeCompras,
      nombreAnalistaBienes: formData.nombreAnalistaBienes,
      ciAnalistaBienes: formData.ciAnalistaBienes,
      descripcionIncorporacion: bienData.bim_des,
      codigoBien: bienData.bim_ide,
      unidadDestino: bienData.departamento,
      nombreFuncionarioElabora: formData.nombreFuncionarioElabora
    };

    const datosActaCET = {
      numeroActa: formData.numeroActa,
      ciudad: 'San Cristóbal',
      dia: (fechaInc.getDate()).toString(),
      mes: fechaInc.toLocaleString('es-ES', { month: 'long' }),
      anio: fechaInc.getFullYear().toString(),
      hora: horaCliente, // Enviamos la hora del cliente
      nombreDirectorAdmin: formData.nombreDirectorAdmin,
      ciDirectorAdmin: formData.ciDirectorAdmin,
      nombreDirectorAsignacion: formData.nombreDirectorAsignacion,
      ciDirectorAsignacion: formData.ciDirectorAsignacion,
      nombreJefeCompras: formData.nombreJefeCompras,
      ciJefeCompras: formData.ciJefeCompras,
      codigoBien: bienData.bim_ide,
      descripcionIncorporacion: bienData.bim_des,
      marca: bienData.marca,
      modelo: bienData.modelo,
      color: bienData.bim_color,
      unidadDestino: bienData.departamento,
      conceptoMovimiento: bienData.concepto,
      cod_conceptoMov: bienData.com_ide
    };

     

    const validacionActa = validarDatosActa(datosActa);
  const validacionActaCET = validarDatosActaCET(datosActaCET);

  if (!validacionActa.valido) {
    setFormEnviado(false);
    setErrorMessage(`Acta Incorporación: ${validacionActa.error}`);
    setMensajeMostrado(true);
    setTimeout(() => setMensajeMostrado(false), 5000);
    return;
  }

  if (!validacionActaCET.valido) {
    setFormEnviado(false);
    setErrorMessage(`Acta CET: ${validacionActaCET.error}`);
    setMensajeMostrado(true);
    setTimeout(() => setMensajeMostrado(false), 5000);
    return;
  }

    try {
      setMensajeMostrado(false);
      setErrorMessage('');

      const [pdfResp1, pdfResp2] = await Promise.all([
        fetch('/api/pdf/acta-incorporacion', {
          method: 'POST',
          body: JSON.stringify(datosActa),
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        }).then(response => response.blob()),

        fetch('/api/pdf/acta-cet', {
          method: 'POST',
          body: JSON.stringify(datosActaCET),
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        }).then(response => response.blob())
    ]);

      const blobs = [pdfResp1, pdfResp2];
      const nombres = ['acta_incorporacion', 'acta_CET'];

      blobs.forEach((blob, i) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${nombres[i]}_${bienData.bim_ide}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      });

       setFormEnviado(true);
        setMensajeMostrado(true);
        setTimeout(() => setMensajeMostrado(false), 3000);

        setFormData({});
        setBienData(null);

        handleClose();

    } catch (error) {
        console.error('Error al generar PDF:', error);
        setFormEnviado(false);
        setErrorMessage('Error al generar el PDF. Por favor intente nuevamente.');
        setMensajeMostrado(true);
        setTimeout(() => setMensajeMostrado(false), 5000);
     };
    }

  return (
    <Modal show={show} onHide={() => { handleClose(); limpiarFormulario(); }} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Generar Acta de Incorporación</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          {/* Input para buscar bien cuando no viene como prop */}
          {!BienId && (
            <Form.Group className="mb-3">
              <Form.Label>Ingrese el código del bien</Form.Label>
              <div className="d-flex">
                <Form.Control
                  type="text"
                  value={codigoBienInput}
                  onChange={(e) => setCodigoBienInput(e.target.value)}
                  placeholder="Código del bien"
                />
                <Button 
                  variant="primary" 
                  onClick={handleBuscarBien}
                  disabled={loading}
                  className="ms-2"
                >
                  {loading ? 'Buscando...' : 'Buscar'}
                </Button>
              </div>
            </Form.Group>
          )}

          {mensajeMostrado && (
        <Alert key={formEnviado ? 'success' : 'danger'} type={formEnviado ? 'success' : 'danger'}>
          {formEnviado ? 'PDF generado con éxito' : errorMessage}
        </Alert>
      )}

          {/* Datos del Bien */}
          {bienData && (
            <>
              {[
                ['Codigo del Bien', bienData.bim_ide],
                ['Descripción del Bien', bienData.bim_des],
                ['Unidad Administrativa', bienData.departamento],
                ['Marca', bienData.marca],
                ['Modelo', bienData.modelo],
                ['Color', bienData.bim_color],
                ['Concepto de Movimiento', bienData.concepto]
              ].map(([label, value], idx) => (
                <Form.Group className="mb-2" key={idx}>
                  <Form.Label>{label}</Form.Label>
                  <Form.Control type="text" value={value || 'No disponible'} disabled />
                </Form.Group>
              ))}
            </>
          )}

          {/* Número de Acta */}
          <Form.Group className="mb-2">
            <Form.Label>Número de Acta</Form.Label>
            <Form.Control
              type="text"
              name="numeroActa"
              value={formData.numeroActa || ''}
              onChange={handleChange}
            />
          </Form.Group>

          {/* Campos de datos del acta */}
          {[
            ['nombreDirectorAdmin', 'Nombre Director(a) de Administración'],
            ['ciDirectorAdmin', 'CI Director(a) de Administración'],
            ['nombreDirectorAsignacion', 'Nombre Director(a) de la oficina de Asignación del Bien'],
            ['ciDirectorAsignacion', 'CI Director(a) de la oficina de Asignación del Bien'],
            ['nombreJefeCompras', 'Nombre Jefe de la División de Compras, Bienes e Inventarios'],
            ['ciJefeCompras', 'CI Jefe de la División de Compras, Bienes e Inventarios'],
            ['nombreAnalistaBienes', 'Nombre Analista de Bienes e Inventarios IV'],
            ['ciAnalistaBienes', 'CI Analista de Bienes e Inventarios IV'],
            ['nombreFuncionarioElabora', 'Funcionario que Elabora el Acta']
          ].map(([name, label]) => (
            <Form.Group className="mb-2" controlId={name} key={name}>
              <Form.Label>{label}</Form.Label>
              <Form.Control
                type="text"
                name={name}
                value={formData[name] || ''}
                onChange={handleChange}
              />
            </Form.Group>
          ))}
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="primary"
          onClick={() => {
            handleSubmit();
            limpiarFormulario();
          }}
          disabled={!bienData}
        >
          Generar PDF
        </Button>
      </Modal.Footer>

      {mensajeMostrado && (
        <Alert key={formEnviado ? 'success' : 'danger'} type={formEnviado ? 'success' : 'danger'}>
          {formEnviado ? 'PDF generado con éxito' : errorMessage}
        </Alert>
      )}
    </Modal>
  );
}

export default ModalActaInc;