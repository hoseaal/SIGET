import React from 'react'
import { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from '../../components/atoms/Buttons';

export const Bm2 = () => {
    const [relacion, setRelacion] = useState(true)
    return (
        <>
            <h4 className="py-3 mb-4"><span className="text-muted fw-light">Bienes Muebles/</span> BM-2</h4>
            <div className='row'>
                <div className="col-xxl">
                    <div className="card mb-4">
                        <div className="card-header d-flex align-items-center justify-content-between">
                            <h5 className="mb-0">Reportes</h5>
                        </div>
                        <div className="card-body">
                            <div className="demo-inline-spacing mx-auto">
                                <Button type='primary'>Generar Reporte de BM-2</Button>
                                <Button type='primary'>Generar Acta de Incorporación de Bien</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* <!-- Basic Layout & Basic with Icons --> */}
            <div className="row">
                {/* <!-- Basic Layout --> */}
                <div className="col-xxl">
                    <div className="card mb-4">
                        <div className="card-header d-flex align-items-center justify-content-between">
                            <h5 className="mb-0">Relacion de Movimiento de Bienes Muebles</h5>
                            <Form.Group className="mb-3">
                                <Form.Select
                                >
                                    <option value="true">Incorporacion</option>
                                    <option value="flase" onClick={() => {setRelacion(false)}}>Desincorporacion</option>
                                </Form.Select>
                            </Form.Group>
                        </div>
                        {relacion ?
                        <div className="card-body">
                            <form>
                                <div className="row mb-3">
                                    <label className="col-sm-2 col-form-label" htmlFor="basic-default-name">Numero de Identificación </label>
                                    <div className="col-sm-10">
                                        <input type="text" className="form-control" id="basic-default-name" placeholder="xxxx" />
                                    </div>
                                </div>
                                <Form.Group className="mb-3">
                                    <Form.Label>UNIDAD ADMINISTRATIVA</Form.Label>
                                    <Form.Select
                                        name='unidad_administrativa'
                                    >
                                        <option value="">Seleccione una opción</option>
                                    </Form.Select>
                                </Form.Group>
                                <div className="row mb-3">
                                    <label className="col-sm-2 col-form-label" htmlFor="basic-default-company">Descripción del Bien</label>
                                    <div className="col-sm-10">
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="basic-default-company"
                                            placeholder="xxxx" />
                                    </div>
                                </div>
                                <Form.Group className="mb-3">
                                    <Form.Label>Forma de Adquisicion</Form.Label>
                                    <Form.Select
                                        name='unidad_administrativa'
                                    >
                                        <option value="">Seleccione una opción</option>
                                    </Form.Select>
                                </Form.Group>
                                <div className="row mb-3">
                                    <label className="col-sm-2 col-form-label" htmlFor="basic-default-email">Fecha de Adquicision</label>
                                    <div className="col-sm-10">
                                        <div className="input-group input-group-merge">
                                            <input
                                                type="date"
                                                id="basic-default-email"
                                                className="form-control"
                                                placeholder="xxxx" />
                                        </div>
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <label className="col-sm-2 col-form-label" htmlFor="basic-default-email">Numero de Documento</label>
                                    <div className="col-sm-10">
                                        <div className="input-group input-group-merge">
                                            <input
                                                type="text"
                                                id="basic-default-email"
                                                className="form-control"
                                                placeholder="xxxx" />
                                        </div>
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <label className="col-sm-2 col-form-label" htmlFor="basic-default-phone">Valor Monetario</label>
                                    <div className="col-sm-10">
                                        <input
                                            type="text"
                                            id="basic-default-phone"
                                            className="form-control phone-mask"
                                            placeholder="0.00"  />
                                    </div>
                                </div>
                                <Form.Group className="mb-3">
                                    <Form.Label>Moneda</Form.Label>
                                    <Form.Select
                                        name='unidad_administrativa'
                                    >
                                        <option value="">Seleccione una opción</option>
                                    </Form.Select>
                                </Form.Group>
                                <div className="row mb-3">
                                    <label className="col-sm-2 col-form-label" htmlFor="basic-default-phone">Color del Bien</label>
                                    <div className="col-sm-10">
                                        <input
                                            type="text"
                                            id="basic-default-phone"
                                            className="form-control phone-mask"
                                            placeholder="0.00"  />
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <label className="col-sm-2 col-form-label" htmlFor="basic-default-phone">Codigo SUDEBIN</label>
                                    <div className="col-sm-10">
                                        <input
                                            type="text"
                                            id="basic-default-phone"
                                            className="form-control phone-mask"
                                            placeholder="0.00"  />
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <label className="col-sm-2 col-form-label" htmlFor="basic-default-phone">Concepto de Movimiento</label>
                                    <div className="col-sm-10">
                                        <select
                                            type="text"
                                            id="basic-default-phone"
                                            className="form-control phone-mask"
                                            placeholder="0.00"  />
                                    </div>
                                </div>
                                <Form.Group className="mb-3">
                                    <Form.Label>Estado de uso</Form.Label>
                                    <Form.Select
                                        name='unidad_administrativa'
                                    >
                                        <option value="">Seleccione una opción</option>
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Condición fisica</Form.Label>
                                    <Form.Select
                                        name='unidad_administrativa'
                                    >
                                        <option value="">Seleccione una opción</option>
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Marca</Form.Label>
                                    <Form.Select
                                        name='unidad_administrativa'
                                    >
                                        <option value="">Seleccione una opción</option>
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Modelo</Form.Label>
                                    <Form.Select
                                        name='unidad_administrativa'
                                    >
                                        <option value="">Seleccione una opción</option>
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Tipo de Bien</Form.Label>
                                    <Form.Select
                                        name='unidad_administrativa'
                                    >
                                        <option value="">Seleccione una opción</option>
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Categoría General</Form.Label>
                                    <Form.Select
                                        name='unidad_administrativa'
                                    >
                                        <option value="">Seleccione una opción</option>
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Sub-Categoría</Form.Label>
                                    <Form.Select
                                        name='unidad_administrativa'
                                    >
                                        <option value="">Seleccione una opción</option>
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Categoría Espcifica</Form.Label>
                                    <Form.Select
                                        name='unidad_administrativa'
                                    >
                                        <option value="">Seleccione una opción</option>
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Concepto de Incorporación</Form.Label>
                                    <Form.Select
                                        name='unidad_administrativa'
                                    >
                                        <option value="">Seleccione una opción</option>
                                    </Form.Select>
                                </Form.Group>
                                <div className="row justify-content-end">
                                       <Button type='primary' size='lg'>Guardar</Button>
                                </div>
                            </form>
                        </div>
                        :
                            <div>
                                <button>uwu</button>
                            </div>
                    }
                    </div>
                    
                </div>
            </div>
        </>
    )
}
