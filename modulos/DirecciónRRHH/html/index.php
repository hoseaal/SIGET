<?php
  require_once '../conexion/conexion.php';
  require_once '../PHP/api/validar-jwt.php';

  // Verificar si el token es válido y está presente
  if (!isset($decoded) || !isset($decoded->data->tipo)) {
      header('Location: auth-login-basic.php');
      exit;
  }

  // Verificar el tipo de usuario
  $userType = $decoded->data->tipo;
  
  // Redireccionar según el tipo de usuario
  if (in_array($userType, ['0', '1', '2', '3'])) {
      header('Location: index_usur.php');
      exit;
  } elseif ($userType != '4') {
      header('Location: auth-login-basic.php');
      exit;
  }

  echo '<script>const LOGGED_USER_TYPE = "' . $decoded->data->tipo . '";</script>';
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

    <title>INICIO - RRHHH</title>

    <meta name="description" content="" />

    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="../../../home/assets/img/logo-contraloria-home2.png" />

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

    <!-- SweetAlert2 -->
    <link href="../assets/css/sweetalert2.min.css" rel="stylesheet">
    <script src="../assets/js/sweetalert2.all.min.js"></script>

    <!-- Validación de Sesión -->
    <script src="../assets/js/modulos/check_sesion.js"></script>

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
         
          <?php require_once __DIR__ . '/../PHP/navbar_superior.php'; ?>

          <!-- Content wrapper -->
          <div class="content-wrapper">
            <!-- Content -->
              <div class="container-xxl flex-grow-1 container-p-y">
                <div class="row">
                  <!-- Primera fila de métricas -->
                  <div class="col-md-6 col-lg-3 mb-4">
                    <div class="card h-100">
                      <div class="card-body">
                        <div class="card-title d-flex align-items-start justify-content-between">
                          <div class="avatar flex-shrink-0">
                            <img src="../assets/img/icons/unicons/Total_usuarios.png" alt="Usuarios" class="rounded"/>
                          </div>
                        </div>
                        <span class="fw-semibold d-block mb-1">Total de Usuarios</span>
                        <h3 class="card-title mb-2 text-center" id="total-usuarios">Cargando...</h3>
                      </div>
                    </div>
                  </div>
                  
                  <div class="col-md-6 col-lg-3 mb-4">
                    <div class="card h-100">
                      <div class="card-body">
                        <div class="card-title d-flex align-items-start justify-content-between">
                          <div class="avatar flex-shrink-0">
                            <img src="../assets/img/icons/unicons/Total_emp.png" alt="Empleados" class="rounded"/>
                          </div>
                        </div>
                        <span class="fw-semibold d-block mb-1">Total de empleados</span>
                        <h3 class="card-title mb-2 text-center" id="total-empleados">Cargando...</h3>
                      </div>
                    </div>
                  </div>
                  
                  <div class="col-md-6 col-lg-3 mb-4">
                    <div class="card h-100">
                      <div class="card-body">
                        <div class="card-title d-flex align-items-start justify-content-between">
                          <div class="avatar flex-shrink-0">
                            <img src="../assets/img/icons/unicons/Porcen_area.png" alt="Áreas" class="rounded"/>
                          </div>
                        </div>
                        <span class="fw-semibold d-block mb-1">% por Área</span>
                        <h3 class="card-title mb-2 text-center" id="promedioArea">Cargando...</h3>
                      </div>
                    </div>
                  </div>
                  
                  <div class="col-md-6 col-lg-3 mb-4">
                    <div class="card h-100">
                      <div class="card-body">
                        <div class="card-title d-flex align-items-start justify-content-between">
                          <div class="avatar flex-shrink-0">
                            <img src="../assets/img/icons/unicons/Salida_nominaT.png" alt="Nómina" class="rounded"/>
                          </div>
                        </div>
                        <span class="fw-semibold d-block mb-1">Salida total de nómina</span>
                        <h3 class="card-title mb-2 text-center" id="totalNomina">Cargando...</h3>
                      </div>
                    </div>
                  </div>

                  <!-- Segunda fila - 3 columnas del mismo tamaño -->
                  <div class="col-lg-4 mb-4">
                    <!-- Bienvenida -->
                    <div class="card h-100">
                      <div class="card-body d-flex flex-column">
                        <div class="text-center mb-3">
                          <img
                            src="../assets/img/illustrations/man-with-laptop-light.png"
                            height="120"
                            alt="View Badge User"
                            data-app-dark-img="illustrations/man-with-laptop-dark.png"
                            data-app-light-img="illustrations/man-with-laptop-light.png"
                            class="mb-3"
                          />
                          <h5 class="card-title text-primary">Bienvenido al Sistema 🎉</h5>
                        </div>
                        <p class="mb-4 text-center">
                          Automatiza las <span class="fw-bold">nóminas</span> para un trabajo mucho más eficiente y seguro.
                        </p>
                        <div class="text-center mt-auto">
                          <a href="Table_Nomina.php" class="btn btn-sm btn-outline-primary">Acceder a nóminas</a>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="col-lg-4 mb-4">
                    <!-- Últimas Modificaciones -->
                    <div class="card h-100">
                      <div class="card-header d-flex align-items-center justify-content-between">
                        <h5 class="card-title m-0 me-2">Últimas Modificaciones</h5>
                      </div>
                      <div class="card-body">
                        <ul class="p-0 m-0">
                          <?php
                              // Consulta unificada para todas las tablas de bitácora
                              $query = "
                                  (SELECT 'usu' as tipo, bit_operacion, bit_usu_ide as id, bit_usuario_responsable, bit_detalles, bit_fecha FROM bit_usu)
                                  UNION ALL
                                  (SELECT 'nom' as tipo, bit_operacion, bit_nom_ced as id, bit_usuario_responsable, bit_detalles, bit_fecha FROM bit_nom)
                                  UNION ALL
                                  (SELECT 'cet' as tipo, bit_operacion, bit_cet_ide as id, bit_usuario_responsable, bit_detalles, bit_fecha FROM bit_cet)
                                  UNION ALL
                                  (SELECT 'ona' as tipo, bit_operacion, bit_ona_ide as id, bit_usuario_responsable, bit_detalles, bit_fecha FROM bit_ona)
                                  UNION ALL
                                  (SELECT 'nvl' as tipo, bit_operacion, bit_nvl_ide as id, bit_usuario_responsable, bit_detalles, bit_fecha FROM bit_nvl)
                                  UNION ALL
                                  (SELECT 'sup' as tipo, bit_operacion, bit_sup_ide as id, bit_usuario_responsable, bit_detalles, bit_fecha FROM bit_sup)
                                  UNION ALL
                                  (SELECT 'cep' as tipo, bit_operacion, bit_cep_ide as id, bit_usuario_responsable, bit_detalles, bit_fecha FROM bit_cep)
                                  UNION ALL
                                  (SELECT 'ded' as tipo, bit_operacion, bit_ded_ide as id, bit_usuario_responsable, bit_detalles, bit_fecha FROM bit_ded)
                                  UNION ALL
                                  (SELECT 'pri' as tipo, bit_operacion, bit_pri_ide as id, bit_usuario_responsable, bit_detalles, bit_fecha FROM bit_pri)
                                  ORDER BY bit_fecha DESC
                                  LIMIT 3
                              ";

                              $stmt = $pdo->query($query);
                              $modificaciones = $stmt->fetchAll();

                              if (empty($modificaciones)): ?>
                                  <li class="d-flex mb-4 pb-1 justify-content-center">
                                      <div class="text-center">
                                          <small class="text-muted">No han ocurrido cambios en el sistema</small>
                                      </div>
                                  </li>
                              <?php else:
                                  foreach ($modificaciones as $mod):
                                      // Determinar icono y texto según el tipo de operación y tabla
                                      $icono = match($mod['bit_operacion']) {
                                          'INSERT' => 'insert_usu.png',
                                          'UPDATE' => 'update_usu.png',
                                          'DELETE' => 'delete_usu.png',
                                          default => 'cc-success.png'
                                      };
                                      
                                      // Texto descriptivo según la tabla y operación
                                      $texto = match($mod['tipo']) {
                                          'usu' => match($mod['bit_operacion']) {
                                              'INSERT' => 'Inserción de usuario',
                                              'UPDATE' => 'Actualización de usuario',
                                              'DELETE' => 'Eliminación de usuario'
                                          },
                                          'nom' => match($mod['bit_operacion']) {
                                              'INSERT' => 'Inserción en nómina',
                                              'UPDATE' => 'Actualización en nómina',
                                              'DELETE' => 'Eliminación en nómina'
                                          },
                                          'cet' => match($mod['bit_operacion']) {
                                              'INSERT' => 'Nuevo cargo CET',
                                              'UPDATE' => 'Actualización de cargo CET',
                                              'DELETE' => 'Eliminación de cargo CET'
                                          },
                                          'ona' => match($mod['bit_operacion']) {
                                              'INSERT' => 'Nuevo cargo ONAPRE',
                                              'UPDATE' => 'Actualización de cargo ONAPRE',
                                              'DELETE' => 'Eliminación de cargo ONAPRE'
                                          },
                                          'nvl' => match($mod['bit_operacion']) {
                                              'UPDATE' => 'Actualización de nivel',
                                              'DELETE' => 'Eliminación de nivel'
                                          },
                                          'sup' => match($mod['bit_operacion']) {
                                              'INSERT' => 'Nueva suplencia',
                                              'UPDATE' => 'Actualización de suplencia',
                                              'DELETE' => 'Eliminación de suplencia'
                                          },
                                          'cep' => match($mod['bit_operacion']) {
                                              'INSERT' => 'Nuevo registro CEP',
                                              'UPDATE' => 'Actualización de registro CEP',
                                              'DELETE' => 'Eliminación de registro CEP'
                                          },
                                          'ded' => match($mod['bit_operacion']) {
                                              'UPDATE' => 'Actualización de deducción',
                                              'DELETE' => 'Eliminación de deducción'
                                          },
                                          'pri' => match($mod['bit_operacion']) {
                                              'UPDATE' => 'Actualización de prima',
                                              'DELETE' => 'Eliminación de prima'
                                          },
                                          default => 'Modificación en el sistema'
                                      };
                                      
                                      // Mostrar ID según el tipo de registro
                                      $idTexto = match($mod['tipo']) {
                                          'usu', 'nom' => 'CI: ' . htmlspecialchars($mod['id']),
                                          default => 'ID: ' . htmlspecialchars($mod['id'])
                                      };
                          ?>
                          <li class="d-flex mb-4 pb-1">
                            <div class="avatar flex-shrink-0 me-3">
                              <img src="../assets/img/icons/unicons/<?= $icono ?>" alt="<?= $mod['bit_operacion'] ?>" class="rounded">
                            </div>
                            <div class="d-flex w-100 flex-wrap align-items-center justify-content-between gap-2">
                              <div class="me-2">
                                <small class="text-muted d-block mb-1"><?= $texto ?></small>
                                <h6 class="mb-0"><?= $idTexto ?></h6>
                                <small>Realizado por: <?= htmlspecialchars($mod['bit_usuario_responsable']) ?></small>
                              </div>
                              <div class="user-progress">
                                <small class="text-muted"><?= date('d/m/Y H:i', strtotime($mod['bit_fecha'])) ?></small>
                              </div>
                            </div>
                          </li>
                          <?php 
                              endforeach;
                          endif; 
                          ?>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div class="col-lg-4 mb-4">
                    <!-- Empleados por departamento -->
                    <div class="card h-100">
                      <div class="card-header d-flex align-items-center justify-content-between pb-0">
                        <h5 class="card-title m-0 me-2">Empleados por departamentos</h5>
                      </div>
                      <div class="card-body d-flex flex-column">
                        <div class="d-flex justify-content-center align-items-center flex-grow-1">
                          <div id="orderStatisticsChart"></div>
                        </div>
                        <ul class="p-0 m-0 mt-3" id="lista-departamentos">
                          <!-- Los departamentos se cargarán aquí dinámicamente -->
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
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

    <!-- Core JS -->
    <!-- build:js assets/vendor/js/core.js -->
    <script src="../assets/vendor/libs/jquery/jquery.js"></script>
    <script src="../assets/vendor/libs/popper/popper.js"></script>
    <script src="../assets/vendor/js/bootstrap.js"></script>
    <script src="../assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.js"></script>

    <script src="../assets/vendor/js/menu.js"></script>
    <!-- endbuild -->

    <!-- Vendors JS -->
    <script src="../assets/vendor/libs/apex-charts/apexcharts.js"></script>

    <!-- Main JS -->
    <script src="../assets/js/main.js"></script>

    <!-- Page JS -->
    <script src="../assets/js/dashboards-analytics.js"></script>

    <!-- Place this tag in your head or just before your close body tag. -->
    <script async defer src="../js/buttons.js"></script>

    <script>
      // Función para cargar las estadísticas
      function cargarEstadisticas() {
          fetch('../PHP/api/usuarios/total-1_index.php')
              .then(response => response.json())
              .then(data => {
                  document.getElementById('total-usuarios').textContent = data.total_usuarios;
                  document.getElementById('total-empleados').textContent = data.total_empleados;
              })
              .catch(error => console.error('Error al cargar estadísticas:', error));
      }

      // Cargar las estadísticas cuando la página se cargue
      document.addEventListener('DOMContentLoaded', cargarEstadisticas);
    </script>

    <script>
      document.addEventListener('DOMContentLoaded', function() {
          fetch('../PHP/api/usuarios/total-2_index.php')
              .then(response => response.json())
              .then(data => {
                  if (data.success) {
                      document.getElementById('promedioArea').textContent = data.formattedPromedio + ' Bs.S';
                      document.getElementById('totalNomina').textContent = data.formattedTotal + ' Bs.S';
                  } else {
                      console.error(data.message);
                      document.getElementById('promedioArea').textContent = 'Error';
                      document.getElementById('totalNomina').textContent = 'Error';
                  }
              })
              .catch(error => {
                  console.error('Error:', error);
                  document.getElementById('promedioArea').textContent = 'Error';
                  document.getElementById('totalNomina').textContent = 'Error';
              });
      });
    </script>

    <script>
      document.addEventListener('DOMContentLoaded', function() {
        // Verificar si config está definida (debe estar definida en otro lugar de tu aplicación)
        if (typeof config === 'undefined') {
          console.error('La variable config no está definida');
          return;
        }

        // Colores para la gráfica (usando la config existente)
        const colors = {
          primary: config.colors?.primary || '#696cff',
          success: config.colors?.success || '#71dd37',
          info: config.colors?.info || '#03c3ec',
          secondary: config.colors?.secondary || '#8592a3'
        };
        
        const cardColor = '#fff';
        const headingColor = '#566a7f';
        const axisColor = '#a1acb8';

        fetch('../PHP/api/usuarios/empleados_departamentos.php')
          .then(response => {
            if (!response.ok) throw new Error('Error en la respuesta del servidor');
            return response.json();
          })
          .then(data => {
            console.log('Datos recibidos:', data);
            
            // Actualizar total de empleados
            const totalElement = document.getElementById('total-empleados');
            if (totalElement) totalElement.textContent = data.total_empleados;
            
            // Procesar datos para gráfica (valores absolutos)
            const chartData = processChartData(data);
            renderOrderStatisticsChart(chartData, colors);
            renderDepartmentList(data);
          })
          .catch(error => {
            console.error('Error:', error);
            showError('Error al cargar datos');
          });

        function processChartData(data) {
          if (!data.chart_data) return null;
          
          // Filtrar departamentos con empleados
          const result = { labels: [], series: [] };
          data.chart_data.labels.forEach((label, i) => {
            if (data.chart_data.series[i] > 0) {
              result.labels.push(label);
              result.series.push(data.chart_data.series[i]);
            }
          });
          
          // Caso especial: solo un departamento con empleados
          if (result.series.length === 1) {
            result.labels.push('');
            result.series.push(0.001); // Valor mínimo para mostrar donut
          }
          
          return result;
        }

        function renderOrderStatisticsChart(chartData, colors) {
          const chartElement = document.getElementById('orderStatisticsChart');
          if (!chartElement || !chartData) return;
          
          if (window.orderStatsChart) window.orderStatsChart.destroy();
          
          const options = {
            chart: { 
              height: 165, 
              width: 130, 
              type: 'donut' 
            },
            labels: chartData.labels,
            series: chartData.series,
            colors: [colors.primary, colors.success, colors.info, colors.secondary],
            stroke: { 
              width: 5, 
              colors: cardColor 
            },
            dataLabels: { 
              enabled: false 
            },
            legend: { 
              show: false 
            },
            grid: { 
              padding: { 
                top: 0, 
                bottom: 0, 
                right: 15 
              } 
            },
            // Tooltip NORMAL (muestra nombre departamento + valor)
            tooltip: {
              enabled: true,
              y: {
                formatter: function(value) {
                  return value;
                }
              }
            },
            plotOptions: {
              pie: {
                donut: {
                  size: '75%',
                  labels: {
                    show: true,
                    value: {
                      fontSize: '1.5rem',
                      fontFamily: 'Public Sans',
                      color: headingColor,
                      offsetY: -15,
                      formatter: function(val) {
                        return val > 0 ? Math.round(val) : '';
                      }
                    },
                    name: {
                      offsetY: 20,
                      fontFamily: 'Public Sans',
                      formatter: function() {
                        return 'Total';
                      }
                    },
                    total: {
                      show: true,
                      fontSize: '0.8125rem',
                      color: axisColor,
                      label: 'Total',
                      formatter: function(w) {
                        const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                        return Math.round(total);
                      }
                    }
                  }
                }
              }
            }
          };
          
          window.orderStatsChart = new ApexCharts(chartElement, options);
          window.orderStatsChart.render();
        }

        function renderDepartmentList(data) {
          const listElement = document.getElementById('lista-departamentos');
          if (!listElement) return;
          
          listElement.innerHTML = '';
          
          const icons = ['bx-book-alt', 'bx-briefcase-alt', 'bx-cabinet', 'bx-dots-vertical'];
          const bgColors = ['bg-label-primary', 'bg-label-success', 'bg-label-info', 'bg-label-secondary'];
          
          // Filtrar departamentos con empleados
          const departmentsWithEmployees = (data.departamentos || [])
            .filter(dept => dept.cantidad > 0)
            .slice(0, 3);
          
          // Agregar departamentos
          departmentsWithEmployees.forEach((dept, index) => {
            listElement.innerHTML += `
              <li class="d-flex mb-4 pb-1">
                <div class="avatar flex-shrink-0 me-3">
                  <span class="avatar-initial rounded ${bgColors[index]}"><i class="bx ${icons[index]}"></i></span>
                </div>
                <div class="d-flex w-100 flex-wrap align-items-center justify-content-between gap-2">
                  <div class="me-2">
                    <small class="text-muted">Departamento</small>
                    <h6 class="mb-0">${dept.nombre || 'Departamento'}</h6>
                  </div>
                  <div class="user-progress">
                    <small class="fw-semibold">${dept.cantidad}</small>
                  </div>
                </div>
              </li>
            `;
          });
          
          // Agregar "Otros" si aplica
          if (data.otros > 0) {
            listElement.innerHTML += `
              <li class="d-flex">
                <div class="avatar flex-shrink-0 me-3">
                  <span class="avatar-initial rounded ${bgColors[3]}"><i class="bx ${icons[3]}"></i></span>
                </div>
                <div class="d-flex w-100 flex-wrap align-items-center justify-content-between gap-2">
                  <div class="me-2">
                    <h6 class="mb-0">Otros</h6>
                  </div>
                  <div class="user-progress">
                    <small class="fw-semibold">${data.otros}</small>
                  </div>
                </div>
              </li>
            `;
          }
          
          // Mensaje si no hay datos
          if (departmentsWithEmployees.length === 0 && (!data.otros || data.otros === 0)) {
            listElement.innerHTML = '<li class="text-center p-3">No hay empleados registrados</li>';
          }
        }
        
        function showError(message) {
          const chartElement = document.getElementById('orderStatisticsChart');
          if (chartElement) chartElement.innerHTML = `<div class="text-center text-danger p-3">${message}</div>`;
        }
      });
    </script>

  </body>
</html>
