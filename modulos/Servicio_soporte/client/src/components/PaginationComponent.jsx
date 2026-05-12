import React from "react";
import { Pagination } from "react-bootstrap";

export const PaginationComponent = ({ 
    currentPage, 
    totalItems, 
    itemsPerPage, 
    onPageChange 
}) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    if (totalPages <= 1) return null;

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    const paginationItems = [];
    for (let number = 1; number <= totalPages; number++) {
        if (
            number === 1 || 
            number === totalPages || 
            (number >= currentPage - 1 && number <= currentPage + 1)
        ) {
            paginationItems.push(
                <Pagination.Item 
                    key={number} 
                    active={number === currentPage}
                    onClick={() => onPageChange(number)}
                >
                    {number}
                </Pagination.Item>
            );
        } else if (
            number === currentPage - 2 || 
            number === currentPage + 2
        ) {
            paginationItems.push(<Pagination.Ellipsis key={number} />);
        }
    }

    return (
        <div className="d-flex justify-content-between align-items-center mt-3">
            <div className="text-muted small">
                Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, totalItems)} de {totalItems} registros
            </div>
            <Pagination className="mb-0">
                <Pagination.First onClick={() => onPageChange(1)} disabled={currentPage === 1} />
                <Pagination.Prev onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} />
                {paginationItems}
                <Pagination.Next onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                <Pagination.Last onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} />
            </Pagination>
        </div>
    );
};
