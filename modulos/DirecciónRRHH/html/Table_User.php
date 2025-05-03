<?php
  require_once '../PHP/api/validar-jwt.php';

  if ($decoded->data->tipo == '2') {
      http_response_code(403);
      echo 'Acceso denegado.';
      exit;
  }
?>

<!DOCTYPE html>

<html
  lang="es"
  class="light-style layout-menu-fixed"
  dir="ltr"
  data-theme="theme-default"
  data-assets-path="../assets/"
  data-template="vertical-menu-template-free"
>
<head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0"
    />

    <title>ADMIN - RRHHH</title>

    <meta name="description" content="" />

    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="../../../home/src/img/logo-contraloria-home3.png" />

    <!-- Fonts -->
    <link
      href="../fonts/googlefonts1.css"
      rel="stylesheet"
    />

    <!-- Icons. Uncomment required icon fonts -->
    <link rel="stylesheet" href="../assets/vendor/fonts/boxicons.css" />

    <!-- Core CSS -->
    <link rel="stylesheet" href="../assets/vendor/css/core.css" class="template-customizer-core-css" />
    <link rel="stylesheet" href="../assets/vendor/css/theme-default.css" class="template-customizer-theme-css" />
    <link rel="stylesheet" href="../assets/css/demo.css" />

    <!-- Vendors CSS -->
    <link rel="stylesheet" href="../assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.css" />

    <link rel="stylesheet" href="../assets/vendor/libs/apex-charts/apex-charts.css" />

    <!-- Page CSS -->

    <!-- Helpers -->
    <script src="../assets/vendor/js/helpers.js"></script>

    <script src="../assets/js/config.js"></script>
  </head>

  <body>
    <!-- Layout wrapper -->
    <div class="layout-wrapper layout-content-navbar">
      <div class="layout-container">
        <!-- Menu -->
          <?php require_once __DIR__ . '/../PHP/aside_dashboard.php'; ?>
        <!-- / Menu -->

        <!-- Layout container -->
        <div class="layout-page">
          <!-- Navbar -->
            <?php require_once __DIR__ . '/../PHP/navbar_superior.php'; ?>
          <!-- / Navbar -->

          <!-- Content wrapper -->
          <div class="content-wrapper">
          <!-- Content -->
          <div class="container-xxl flex-grow-1 container-p-y">
            <h4 class="fw-bold py-3 mb-4"><span class="text-muted fw-light">Gestión de Presupuesto /</span> Usuarios</h4>
            <div class="row">
              <!-- Tabla de Usuarios dentro del Sistema -->
              <div class="col-md-12">
                <div class="card mb-4">
                  <h5 class="card-header">Tabla de Usuarios dentro del Sistema</h5>
                  <div class="card-body">
                    <!-- Tabla de Usuarios -->
                    <div class="table-responsive text-nowrap">
                      <table class="table" id="workersTable">
                        <thead>
                          <tr>
                            <th>N° de empleado</th>
                            <th>Cédula del usuario</th>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>Tipo</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody class="table-border-bottom-0">
                          <!-- Las filas se llenarán dinámicamente con JavaScript -->
                        </tbody>
                      </table>
                    </div>

                    <!-- Paginación -->
                    <div class="demo-inline-spacing mt-4">
                      <nav aria-label="Page navigation">
                        <ul class="pagination justify-content-center" id="pagination">
                          <!-- La paginación se generará dinámicamente con JavaScript -->
                        </ul>
                      </nav>
                    </div>
                    <!-- Fin de Paginación -->

                    <hr class="my-5" />

                    <div id="defaultFormControlHelp" class="form-text">
                      No comparta información privada sin previa autorización.
                    </div>
                  </div>
                </div>
              </div>
            </div> <!-- Cierre de .row -->
          </div>
          <!-- / Content -->
          <div class="content-backdrop fade"></div>
        </div>
          <!-- Content wrapper -->
        </div>
        <!-- / Layout page -->
      </div>

      <!-- Overlay -->
      <div class="layout-overlay layout-menu-toggle"></div>
    </div>
    <!-- / Layout wrapper -->

    <!-- Core JS -->
    <!-- build:js assets/vendor/js/core.js -->
    <script src="../assets/vendor/libs/jquery/jquery.js"></script>
    <script src="../assets/vendor/libs/popper/popper.js"></script>
    <script src="../assets/vendor/js/bootstrap.js"></script>
    <script src="../assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.js"></script>

    <script src="../assets/vendor/js/menu.js"></script>
    <!-- endbuild -->

    <!-- Main JS -->
    <script src="../assets/js/main.js"></script>

    <!-- Page JS -->
    <script src="../assets/js/form-basic-inputs.js"></script>

    <!-- Place this tag in your head or just before your close body tag. -->
    <script async defer src="../js/buttons.js"></script>

    <script>
      document.addEventListener('DOMContentLoaded', function() {
        // Datos de ejemplo (20 Usuarios)
        const workersData = [
          { cedula: '1754896325', nombres: 'María José', apellidos: 'González Pérez', tipo: 'Jefe de Área' },
          { cedula: '0802547896', nombres: 'Carlos Andrés', apellidos: 'Martínez López', tipo: 'Trabajador' },
          { cedula: '1708523641', nombres: 'Ana Lucía', apellidos: 'Rodríguez Sánchez', tipo: 'Trabajador' },
          { cedula: '0925874632', nombres: 'Juan Pablo', apellidos: 'Hernández Castro', tipo: 'Trabajador' },
          { cedula: '1306548729', nombres: 'Patricia Elizabeth', apellidos: 'Vargas Mendoza', tipo: 'Trabajador' },
          { cedula: '0801478523', nombres: 'Luis Fernando', apellidos: 'Torres Jiménez', tipo: 'Trabajador' },
          { cedula: '1725489632', nombres: 'Sofía Alejandra', apellidos: 'Díaz Romero', tipo: 'Jefe de Área' },
          { cedula: '0923654781', nombres: 'Diego Armando', apellidos: 'Silva Ortega', tipo: 'Trabajador' },
          { cedula: '1309874562', nombres: 'Gabriela Michelle', apellidos: 'Moreno Ríos', tipo: 'Trabajador' },
          { cedula: '0803698521', nombres: 'Roberto Carlos', apellidos: 'Navas Benítez', tipo: 'Jefe de Área' },
          { cedula: '1712345678', nombres: 'Laura Estefanía', apellidos: 'Cárdenas Ruiz', tipo: 'Trabajador' },
          { cedula: '0808765432', nombres: 'Jorge Luis', apellidos: 'Pazmiño Vega', tipo: 'Trabajador' },
          { cedula: '1723456789', nombres: 'Daniela Carolina', apellidos: 'Espinoza Torres', tipo: 'Trabajador' },
          { cedula: '0912345678', nombres: 'Fernando José', apellidos: 'Mendoza Castro', tipo: 'Trabajador' },
          { cedula: '1312345678', nombres: 'Carmen Rosa', apellidos: 'Vélez Alcívar', tipo: 'Trabajador' },
          { cedula: '0812345678', nombres: 'Pedro Antonio', apellidos: 'Zambrano Paz', tipo: 'Trabajador' },
          { cedula: '1724567890', nombres: 'Isabel Cristina', apellidos: 'Palma Sánchez', tipo: 'Trabajador' },
          { cedula: '0823456789', nombres: 'Ricardo Alfonso', apellidos: 'Salazar Gómez', tipo: 'Trabajador' },
          { cedula: '1713456789', nombres: 'María Fernanda', apellidos: 'Vallejo López', tipo: 'Trabajador' },
          { cedula: '0924567890', nombres: 'Alberto José', apellidos: 'Cedeño Mendoza', tipo: 'Jefe de Área' }
        ];

        // Variables para la paginación
        const rowsPerPage = 7;
        let currentPage = 1;
        const tableBody = document.querySelector('#workersTable tbody');
        const paginationElement = document.getElementById('pagination');

        // Función para mostrar los Usuarios en la página actual
        function displayWorkers(page) {
          tableBody.innerHTML = '';

          const startIndex = (page - 1) * rowsPerPage;
          const endIndex = startIndex + rowsPerPage;
          const paginatedItems = workersData.slice(startIndex, endIndex);

          paginatedItems.forEach((worker, index) => {
            const rowNumber = startIndex + index + 1;
            const row = document.createElement('tr');
            row.innerHTML = `
              <td>${rowNumber}</td>
              <td>${worker.cedula}</td>
              <td><strong>${worker.nombres}</strong></td>
              <td>${worker.apellidos}</td>
              <td>${worker.tipo}</td>
              <td>
                <div class="dropdown">
                  <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                    <i class="bx bx-dots-vertical-rounded"></i>
                  </button>
                  <div class="dropdown-menu">
                    <a class="dropdown-item" href="javascript:void(0);"><i class="bx bx-edit-alt me-1"></i> Editar</a>
                    <a class="dropdown-item" href="javascript:void(0);"><i class="bx bx-trash me-1"></i> Eliminar</a>
                  </div>
                </div>
              </td>
            `;
            tableBody.appendChild(row);
          });
        }

        // Función para configurar la paginación
        function setupPagination(items, rowsPerPage) {
          paginationElement.innerHTML = '';
          
          const pageCount = Math.ceil(items.length / rowsPerPage);
          
          // Botón Primera página
          let li = document.createElement('li');
          li.className = 'page-item first';
          li.innerHTML = `<a class="page-link" href="javascript:void(0);"><i class="tf-icon bx bx-chevrons-left"></i></a>`;
          li.addEventListener('click', () => {
            currentPage = 1;
            displayWorkers(currentPage);
            updatePaginationButtons();
          });
          paginationElement.appendChild(li);
          
          // Botón Página anterior
          li = document.createElement('li');
          li.className = 'page-item prev';
          li.innerHTML = `<a class="page-link" href="javascript:void(0);"><i class="tf-icon bx bx-chevron-left"></i></a>`;
          li.addEventListener('click', () => {
            if (currentPage > 1) {
              currentPage--;
              displayWorkers(currentPage);
              updatePaginationButtons();
            }
          });
          paginationElement.appendChild(li);
          
          // Números de página
          for (let i = 1; i <= pageCount; i++) {
            li = document.createElement('li');
            li.className = 'page-item';
            if (i === currentPage) li.classList.add('active');
            li.innerHTML = `<a class="page-link" href="javascript:void(0);">${i}</a>`;
            li.addEventListener('click', () => {
              currentPage = i;
              displayWorkers(currentPage);
              updatePaginationButtons();
            });
            paginationElement.appendChild(li);
          }
          
          // Botón Página siguiente
          li = document.createElement('li');
          li.className = 'page-item next';
          li.innerHTML = `<a class="page-link" href="javascript:void(0);"><i class="tf-icon bx bx-chevron-right"></i></a>`;
          li.addEventListener('click', () => {
            if (currentPage < pageCount) {
              currentPage++;
              displayWorkers(currentPage);
              updatePaginationButtons();
            }
          });
          paginationElement.appendChild(li);
          
          // Botón Última página
          li = document.createElement('li');
          li.className = 'page-item last';
          li.innerHTML = `<a class="page-link" href="javascript:void(0);"><i class="tf-icon bx bx-chevrons-right"></i></a>`;
          li.addEventListener('click', () => {
            currentPage = pageCount;
            displayWorkers(currentPage);
            updatePaginationButtons();
          });
          paginationElement.appendChild(li);
        }
        
        // Función para actualizar el estado de los botones de paginación
        function updatePaginationButtons() {
          const pageCount = Math.ceil(workersData.length / rowsPerPage);
          const pageItems = paginationElement.querySelectorAll('.page-item');
          
          // Remover clase active de todos los items
          pageItems.forEach(item => {
            item.classList.remove('active');
          });
          
          // Agregar clase active al item correspondiente
          pageItems.forEach((item, index) => {
            // Los primeros 2 items son los botones "first" y "prev"
            // Los últimos 2 items son los botones "next" y "last"
            if (index >= 2 && index < 2 + pageCount) {
              if (index - 1 === currentPage) {
                item.classList.add('active');
              }
            }
          });
          
          // Actualizar estado de los botones de navegación
          const firstBtn = paginationElement.querySelector('.first');
          const prevBtn = paginationElement.querySelector('.prev');
          const nextBtn = paginationElement.querySelector('.next');
          const lastBtn = paginationElement.querySelector('.last');
          
          if (currentPage === 1) {
            firstBtn.classList.add('disabled');
            prevBtn.classList.add('disabled');
          } else {
            firstBtn.classList.remove('disabled');
            prevBtn.classList.remove('disabled');
          }
          
          if (currentPage === pageCount) {
            nextBtn.classList.add('disabled');
            lastBtn.classList.add('disabled');
          } else {
            nextBtn.classList.remove('disabled');
            lastBtn.classList.remove('disabled');
          }
        }

        // Inicializar la tabla y paginación
        displayWorkers(currentPage);
        setupPagination(workersData, rowsPerPage);
      });
    </script>

  </body>
</html>
