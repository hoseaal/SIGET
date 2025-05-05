import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import '/node_modules/bootstrap/dist/js/bootstrap.bundle.min'

function ModalInsert({ show, handleClose, columns}) {
    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Insertar</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                {columns.map((col, index) => (
                    <div className="row mb-3">
                    <label className="col-sm-2 col-form-label" htmlFor="basic-default-company">{col}</label>
                    <div className="col-sm-10">
                        <input
                            index={index}
                            type="text"
                            className="form-control"
                            id="basic-default-company"
                            placeholder="xxxx" />
                    </div>
                    </div>
                      ))}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cerrar
                </Button>
                <Button variant="primary">
                    Guardar Cambios
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ModalInsert;
