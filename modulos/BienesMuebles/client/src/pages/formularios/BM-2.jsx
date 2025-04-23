import React from 'react'

export const Bm2 = () => {
    return (
        <>
            <h4 className="py-3 mb-4"><span className="text-muted fw-light">Bienes Muebles/</span> BM-2</h4>

            {/* <!-- Basic Layout & Basic with Icons --> */}
            <div className="row">
                {/* <!-- Basic Layout --> */}
                <div className="col-xxl">
                    <div className="card mb-4">
                        <div className="card-header d-flex align-items-center justify-content-between">
                            <h5 className="mb-0">Relacion de Movimiento de Bienes Muebles</h5>
                        </div>
                        <div className="card-body">
                            <form>
                                <div className="row mb-3">
                                    <label className="col-sm-2 col-form-label" htmlFor="basic-default-name">Numero de Identificación </label>
                                    <div className="col-sm-10">
                                        <input type="text" className="form-control" id="basic-default-name" placeholder="xxxx" />
                                    </div>
                                </div>
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
                                <div className="row mb-3">
                                    <label className="col-sm-2 col-form-label" htmlFor="basic-default-phone">Estado de Uso</label>
                                    <div className="col-sm-10">
                                        <select
                                                type="text"
                                                id="basic-default-phone"
                                                className="form-control phone-mask"
                                                placeholder="0.00"  />
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <label className="col-sm-2 col-form-label" htmlFor="basic-default-phone">Marca</label>
                                    <div className="col-sm-10">
                                        <select
                                                type="text"
                                                id="basic-default-phone"
                                                className="form-control phone-mask"
                                                placeholder="0.00"  />  
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <label className="col-sm-2 col-form-label" htmlFor="basic-default-phone">Modelo</label>
                                    <div className="col-sm-10">
                                        <select
                                                type="text"
                                                id="basic-default-phone"
                                                className="form-control phone-mask"
                                                placeholder="0.00"  />
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <label className="col-sm-2 col-form-label" htmlFor="basic-default-phone">Categoría General</label>
                                    <div className="col-sm-10">
                                        <select
                                            type="text"
                                            id="basic-default-phone"
                                            className="form-control phone-mask"
                                            placeholder="0.00"  />
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <label className="col-sm-2 col-form-label" htmlFor="basic-default-phone">Sub-Categoría</label>
                                    <div className="col-sm-10">
                                        <select
                                            type="text"
                                            id="basic-default-phone"
                                            className="form-control phone-mask"
                                            placeholder="0.00"  />
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <label className="col-sm-2 col-form-label" htmlFor="basic-default-phone">Categoría Especifica</label>
                                    <div className="col-sm-10">
                                        <select
                                            type="text"
                                            id="basic-default-phone"
                                            className="form-control phone-mask"
                                            placeholder="0.00"  />
                                    </div>
                                </div>
                                <div className="row mb-3">
                                    <label className="col-sm-2 col-form-label" htmlFor="basic-default-message">Message</label>
                                    <div className="col-sm-10">
                                        <textarea
                                            id="basic-default-message"
                                            className="form-control"
                                            placeholder="Hi, Do you have a moment to talk Joe?"
                                            aria-label="Hi, Do you have a moment to talk Joe?"
                                            aria-describedby="basic-icon-default-message2"></textarea>
                                    </div>
                                </div>
                                <div className="row justify-content-end">
                                    <div className="col-sm-10">
                                        <button aria-label='Click me' type="submit" className="btn btn-primary">Send</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
