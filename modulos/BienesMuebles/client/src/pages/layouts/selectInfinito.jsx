import React, { useState, useRef, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';

const InfiniteSelect = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef(null);

  // Filtrar opciones basadas en el término de búsqueda
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Renderizar cada item de la lista
   const Row = ({ index, style }) => (
    <div
      style={style}
      className={`dropdown-item ${value === filteredOptions[index].value ? 'active' : ''}`}
      onClick={() => {
        onChange(filteredOptions[index].value); // Esto ejecutará handleTipoChange
        setIsOpen(false);
      }}
    >
      {filteredOptions[index].label}
    </div>
  );

  // Calcular altura del menú (máximo 300px)
  const menuHeight = Math.min(100, filteredOptions.length * 35);

  return (
    <div className="dropdown" ref={selectRef}>
      <button
        className="btn btn-primary dropdown-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        TIPO
      </button>
      
      {isOpen && (
        <div className="dropdown-menu show" style={{ width: '100%' }}>
          {/* Campo de búsqueda */}
          <div className="px-2 py-1">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          
          {/* Lista con infinite scroll */}
          <List
            height={menuHeight}
            itemCount={filteredOptions.length}
            itemSize={35}
            width="100%"
          >
            {Row}
          </List>
        </div>
      )}
    </div>
  );
};

// Componente para el filtro de tipo
const TipoBienSelect = ({ tipoBien, value, onChange }) => {
  // Preparar opciones
  const options = [
    { value: null, label: 'Selecciona' },
    ...tipoBien.map(item => ({
      value: item.tip_ide,
      label: item.tip_tip
    }))
  ];

  return (
    <InfiniteSelect
      options={options}
      value={value}
      onChange={onChange}
      placeholder="Tipo"
    />
  );
};

export default TipoBienSelect;