import React, { useState, useEffect } from 'react';
import { Table, Pagination, Card, Dropdown, Modal, Button, Accordion } from 'react-bootstrap';
import moment from 'moment';

// Nuevo componente de Modal para los detalles
export const DetailsModal = ({ show, onHide, oldData, newData }) => {
    // Definición de alias para los campos de la tabla tmab_m
    // Si tu JSON incluye campos de otras tablas, necesitarías añadir sus alias aquí también.
    const fieldAliases = {
        'bim_ide': 'Código de Bien',
        'bim_des': 'Descripción',
        'bim_fec': 'Fecha de Adquisición',
        'bim_ndo': 'Número de Documento',
        'bim_val': 'Valor',
        'bim_moneda': 'Moneda',
        'bim_color': 'Color',
        'bim_ser': 'Serial',
        'bim_cod': 'Código SUDEBIP',
        'bim_obs': 'Observación',
        'bim_sede': 'Sede',
        'estatus_id': 'Estado',
        'foa_ide': 'Forma Adquisición',
        'con_ide': 'Condición',
        'esu_ide': 'Estado Uso',
        'mod_ide': 'Modelo',
        'cae_ide': 'Categoría Específica',
        'bim_inc': 'Estado Incorporado', 
        'bim_fed': 'Fecha de Desincorporación',
        'com_ide': 'Concepto de Movimiento',
        'dep_ide': 'Departamento',
    };

    const renderJsonData = (data) => {
        if (!data) {
            return (
                <p style={{ fontStyle: 'italic', color: '#6c757d' }}>
                    No hay datos disponibles para este campo.
                </p>
            );
        }

        let parsedData;
        if (typeof data === 'string') {
            try {
                parsedData = JSON.parse(data);
            } catch (e) {
                // If it's a string but not valid JSON, display it as plain text
                return (
                    <p style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontSize: '0.9em' }}>
                        {data}
                    </p>
                );
            }
        } else {
            parsedData = data; // Already an object
        }

        // Check if parsedData is an object to iterate over its keys
        if (typeof parsedData === 'object' && parsedData !== null) {
            return (
                <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px' }}>
                    {Object.entries(parsedData).map(([key, value]) => {
                        const displayName = fieldAliases[key] || key; // Usa el alias o el nombre original
                        let displayValue;

                        // Formateo especial para valores booleanos (bim_inc)
                        if (key === 'bim_inc') {
                            displayValue = value === 1 ? 'Sí' : 'No';
                        }
                        // Formateo especial para fechas
                        else if (key.endsWith('_fec') || key.endsWith('_fed')) { // Asume que las fechas terminan en _fec o _fed
                            displayValue = value ? moment(value).format('DD/MM/YYYY HH:mm:ss') : 'N/A';
                        }
                        // Para otros valores, conviértelos a cadena si no son nulos
                        else {
                            displayValue = value !== null && value !== undefined ? String(value) : 'N/A';
                        }

                        return (
                            <p key={key} style={{ marginBottom: '5px', fontSize: '0.95em' }}>
                                <strong>{displayName}:</strong> {displayValue}
                            </p>
                        );
                    })}
                </div>
            );
        } else {
            // Fallback for non-object data that was parsed (e.g., JSON was just a number or boolean)
            return (
                <p style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontSize: '0.9em' }}>
                    {String(parsedData)}
                </p>
            );
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Detalles del Registro de Bitácora</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Accordion defaultActiveKey="0">
                    <Accordion.Item eventKey="0">
                        <Accordion.Header>Datos Anteriores</Accordion.Header>
                        <Accordion.Body>
                            {renderJsonData(oldData)}
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="1">
                        <Accordion.Header>Datos Actuales/Nuevos</Accordion.Header>
                        <Accordion.Body>
                            {renderJsonData(newData)}
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Cerrar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};