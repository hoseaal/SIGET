import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import axios from 'axios';
import Alert from "../../components/atoms/Alert";
import { fetchData } from '../../data/fetchData';

function ModalActaInc({ show, handleClose, BienId, descripcionBien, unidadAdministrativa }) {
  const [formData, setFormData] = useState({});
  const [formEnviado, setFormEnviado] = useState(false);
  const [mensajeMostrado, setMensajeMostrado] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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

  useEffect(() => {
    const fetchAllData = async () => {
      const unidadAdminData = await fetchData('tesdep', '*', 'dep_ide', unidadAdministrativa);
      setUnidadAdmin(unidadAdminData || []);
    };
    fetchAllData();
  }, []);

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
      unidadAsignacion: unidadAdmin[0].dep_nom,
      nombreJefeCompras: formData.nombreJefeCompras,
      ciJefeCompras: formData.ciJefeCompras,
      nombreAnalistaBienes: formData.nombreAnalistaBienes,
      ciAnalistaBienes: formData.ciAnalistaBienes,
      descripcionIncorporacion: descripcionBien,
      codigoBien: BienId || formData.codigoBien,
      unidadDestino: unidadAdmin[0].dep_nom,
      nombreFuncionarioElabora: formData.nombreFuncionarioElabora,
    };

    try {
      const pdfResponse = await axios.post(
        '/api/generar-acta',
        datosActa,
        { responseType: 'blob', withCredentials: true }
      );

      const url = window.URL.createObjectURL(new Blob([pdfResponse.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `acta_incorporacion_${BienId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      setFormEnviado(true);
      setMensajeMostrado(true);
      setTimeout(() => setMensajeMostrado(false), 3000);

      
    } catch (error) {
      console.error('Error al generar PDF:', error);
      setFormEnviado(false);
      setMensajeMostrado(true);
      setErrorMessage('Error al generar el PDF');
      setTimeout(() => setMensajeMostrado(false), 3000);
    }
  };

  console.log(unidadAdmin[0]?.dep_nom)
  console.log(BienId)
  console.log(descripcionBien)

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Generar Acta de Incorporación</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
            <Form.Group className="mb-2">
                <Form.Label>Codigo del Bien</Form.Label>
                <Form.Control type="text" value={BienId} disabled />
            </Form.Group>

            <Form.Group className="mb-2">
            <Form.Label>Descripción del Bien</Form.Label>
            <Form.Control type="text" value={descripcionBien} disabled />
          </Form.Group>

            <Form.Group className="mb-2">
            <Form.Label>Unidad Administrativa</Form.Label>
            <Form.Control type="text" value={unidadAdmin[0]?.dep_nom} disabled />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Número de Acta</Form.Label>
            <Form.Control type="text" name="numeroActa" value={formData.numeroActa || ''} onChange={handleChange} />
          </Form.Group>

          {[
            ['nombreDirectorAdmin', 'Nombre Director(a) Administración'],
            ['ciDirectorAdmin', 'CI Director(a) Administración'],
            ['nombreDirectorAsignacion', 'Nombre Director(a) Asignación'],
            ['ciDirectorAsignacion', 'CI Director(a) Asignación'],
            ['nombreJefeCompras', 'Nombre Jefe de Compras'],
            ['ciJefeCompras', 'CI Jefe de Compras'],
            ['nombreAnalistaBienes', 'Nombre Analista de Bienes'],
            ['ciAnalistaBienes', 'CI Analista de Bienes'],
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
        <Button variant="primary" onClick={() => { handleSubmit(); handleClose(); }}>
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