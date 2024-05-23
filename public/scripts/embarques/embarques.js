import { fetchData, isoDateToFormatted } from '../helpers.js';

$(() => {
  init();
});

async function init() {
  new PerfectScrollbar(document.getElementById('embarques_container'), {
    wheelPropagation: false
  });

  $('#add_product_select').select2({
    dropdownParent: $('#addProductsModal'),
    placeholder: 'Selecciona una orden'
  });

  loadEmbarques();

  $('#container-data').addClass('d-none');
}

async function getEmbarques() {
  $('#embarques_container').empty();
  const embarques = await fetchData('/embarques', 'GET');

  if (embarques.status == false) {
    toastr.error('Error al obtener los embarques');
  }

  return embarques;
}

async function loadEmbarques() {
  const $container = $('#embarques_container');

  const embarques = await getEmbarques();

  for (let embarque of embarques.data) {
    const uniqueFolio = Math.random().toFixed(3);

    const $newdiv1 = $(`
    <div class="embarque_container_child card-body border  cursor-pointer" embarque_id="${embarque.id}" id="order_${uniqueFolio}" folio="${embarque.id}">
      <div class="row g-2">
        <div class="col-md-12">
          <div class="d-flex align-items-center justify-content-between p-2 pb-0">
            <span class="badge bg-label-dark">${uniqueFolio}</span>
            <span class="text-capitalize badge bg-secondary">Pendiente</span>
          </div>
        </div>
        <div class="col-md-12">
          <hr class="m-0" />
        </div>
        <div class="col-md-12">
          <div class="p-2 pb-1 pt-0">
            <p class="mb-0 small"><strong>Cliente: </strong>${embarque.descripcion ?? '<span style="color:Red">Sin cliente relacionado</span>'}</p>
            <p class="mb-0 small"><strong>Folio de cliente: </strong></p>
            <p class="mb-0 small"><strong>Fecha de entrega: </strong></p>
            <p class="mb-0 small"><strong>Fecha de creación: ${isoDateToFormatted(embarque.created_at)}</strong></p>   
          </div>      
        </div>
      </div>
    </div>
  `);
    $newdiv1.data({ data: embarque });
    $container.append($newdiv1);
  }
}

$('#create_embarque').on('submit', async function (e) {
  e.preventDefault();

  //Variables para post
  const $descripcion = $('#descripcion_embarque');
  const $tipo_contenedor = $('#tipo_contenedor');

  const descripcion = $descripcion.val().trim();
  const tipo_contenedor = $tipo_contenedor.val().trim();

  if (descripcion == '') {
    toastr.error('Completar los campos para crear el embarque');
    return;
  }

  const result = await fetchData('/embarque/create', 'POST', {
    descripcion: descripcion,
    tipo_contenedor: tipo_contenedor
  });

  const apiResult = result.data;

  if (apiResult.status == false) {
    toastr.error(apiResult.data, 'Ocurrió un error');
    return;
  }

  toastr.success('Creado con éxito');
  $descripcion.val('');
  $tipo_contenedor.val('');

  $('#create_embarque_modal').modal('hide');

  await loadEmbarques();
});

$('#embarques_container').on('click', '.embarque_container_child', async function (e) {
  const $embarque = $(this);
  const data = $embarque.data().data;

  console.log(data);

  $('#data-folio').text($embarque.attr('folio'));
  $('#data-fecha-creacion').text(isoDateToFormatted(data.created_at));

  $('#data-client-data').text('Cliente 1');
  $('#client_id').text('1');
  $('#client_currency').text('MXN');

  $('#container-no-data').addClass('d-none');
  $('#container-data').removeClass('d-none');

  $('#edit_oc').removeClass('d-none');
  $('#delete_oc').removeClass('d-none');
  $('#cancelar_oc').removeClass('d-none');
  $('#restaurar_oc').removeClass('d-none');
  $('#data-last-update').text(data.last_update ? isoDateToFormatted(data.last_update) : '-');
  $('#input_container_type').val(data.tipo_contenedor);
  $('#container-reporte').data(data);
});

$('#addEmbarquesButton').on('click', function () {
  $('#addEmbarqueModal').modal('show');
});

//PARTE PARA ELIMINAR LOS EMBARQUES
$('#delete_oc').on('click', function () {
  $('#delete_embarque_modal').modal('show');
});

$('#confirm_delete_embarque').on('click', async function (e) {
  const data = $('#container-reporte').data();

  const embarque_id = data.id;

  const result = await fetchData('/embarque/' + embarque_id, 'DELETE', {
    embarque_id: embarque_id
  });

  if (result.status == false) {
    toastr.error('Error al eliminar el embarque');
    return;
  }

  toastr.success('Embarque eliminado con éxito');
  $('#delete_embarque_modal').modal('hide');

  $('#container-data').addClass('d-none');
  $('#container-no-data').removeClass('d-none');

  $('#data-folio').text($embarque.attr('-'));
  $('#data-fecha-creacion').text('-');

  await loadEmbarques();
});
//FIN PARTE PARA ELIMINAR EMBARQUES

// PARTE PARA EDITAR LOS EMBARQUES
$('#edit_oc').on('click', function () {
  $('#edit_embarque_modal').modal('show');

  const data = $('#container-reporte').data();

  $('#edit_descripcion_embarque').val(data.descripcion);
  $('#edit_container_type').val(data.tipo_contenedor);
});

$('#edit_embarque_form').on('submit', async function (e) {
  e.preventDefault();

  const data = $('#container-reporte').data();

  const embarque_id = data.id;

  const $descripcion = $('#edit_descripcion_embarque');
  const $tipo_contenedor = $('#edit_container_type');

  const descripcion = $descripcion.val().trim();
  const tipo_contenedor = $tipo_contenedor.val().trim();

  const last_update = new Date().toISOString();

  if (descripcion == '') {
    toastr.error('Completar los campos para editar el embarque');
    return;
  }

  const result = await fetchData('/embarque/' + embarque_id, 'PUT', {
    descripcion: descripcion,
    tipo_contenedor: tipo_contenedor,
    last_update: last_update
  });

  $('#input_container_type').val(tipo_contenedor);

  if (result.status == false) {
    toastr.error(result.data);
    return;
  }

  console.log(result);

  toastr.success('Embarque editado con éxito');
  $('#edit_embarque_modal').modal('hide');

  $('#data-last-update').text(isoDateToFormatted(last_update));

  await loadEmbarques();
});
// FIN PARTE DE EDICION DE EMBARQUES

//EDITAR TIPO DE CONTENEDOR
$('#uploadContainerType').on('click', async function () {
  const data = $('#container-reporte').data();

  const embarque_id = data.id;

  const descripcion = data.descripcion;

  const tipo_contenedor = $('#input_container_type').val().trim();

  $('#edit_container_type').val(tipo_contenedor);
  const last_update = data.last_update;

  data.tipo_contenedor = tipo_contenedor;

  const result = await fetchData('/embarque/' + embarque_id, 'PUT', {
    descripcion: descripcion,
    last_update: last_update,
    tipo_contenedor: tipo_contenedor
  });

  if (result.status == false) {
    toastr.error(result.data);
    return;
  }
  $('#container-reporte').data(data);

  toastr.success('Se editó el tipo de contenedor');

  await loadEmbarques();
});
//FIN PARTE DE EDITAR EL TIPO DE CONTENEDOR

$('#addProductsButton').on('click', async function () {
  $('#addProductsModal').modal('show');

  const ordenes = await fetchData('/embarques/ordenes', 'GET', {});

  console.log(ordenes.data[0]);

  if (ordenes.status == false) {
    toastr.error('Error al obtener las ordenes');
    return;
  }

  $('#add_product_select').empty();

  ordenes.data.forEach(function (item) {
    const option = $(`<option value="${item.id}">${item.folio_unico}  ${item.folio_cliente}</option>`);
    option.data('productos', item.productos); // Asociar datos a la opción
    $('#add_product_select').append(option);
  });

  $('#add_product_select').trigger('change');
});

$('#add_product_select').on('change', function () {
  const selectedOption = $(this).find('option:selected');
  const data = selectedOption.data('productos'); // Recuperar datos de la opción seleccionada

  console.log(data);

  if (!data || !Array.isArray(data)) {
    console.error('No data available');
    return;
  }

  const dataForTable = data.map(function (item) {
    return {
      checkbox: `<input type="checkbox" class="form-check-input product_check" name="product_${item.id}" id="product_${item.id}">`,
      numeroParte: item.numero_parte || '',
      costoProduccion: item.currency_costo_produccion || '',
      descripcion: item.descripcion || '',
      costoVenta: item.currency_costo_venta || '',
      tipo: item.type == 'bulk' ? 'A granel' : 'Individual'
    };
  });

  if ($.fn.DataTable.isDataTable('#productos_table')) {
    $('#productos_table').DataTable().destroy();
  }

  // Ahora puedes inicializar la tabla de nuevo
  $('#productos_table').DataTable({
    data: dataForTable,
    columnDefs: [
      {
        // For Checkboxes
        targets: 0,
        searchable: false,
        orderable: true,
        render: function () {
          return '<input type="checkbox" class="dt-checkboxes form-check-input">';
        },
        checkboxes: {
          selectRow: true,
          selectAllRender: '<input type="checkbox" class="form-check-input">'
        }
      }
    ],
    select: {
      // Select style
      style: 'multi',
      selector: 'td:not(.non-selectable)'
    },
    columns: [
      { orderable: false, defaultContent: '', width: '50px' },
      { data: 'numeroParte', title: 'Numero Parte', orderable: true, className: 'non-selectable' },
      { data: 'costoProduccion', title: 'Costo Produccion', orderable: true, className: 'non-selectable' },
      { data: 'descripcion', title: 'Descripcion', orderable: false, className: 'non-selectable' },
      { data: 'costoVenta', title: 'Costo Venta', orderable: true, className: 'non-selectable' },
      { data: 'tipo', title: 'Tipo', orderable: false, className: 'non-selectable' }
    ],
    dom: 'rtp',
    paging: false,
    language: {
      url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
    },
    order: [[0, 'asc']],
    searching: true
  });

  $('#productos_table thead, tbody').off('change');

  $('#productos_table thead, tbody').on('change', 'input[type="checkbox"]', function () {
    const dataCheck = $('#productos_table').DataTable().rows({ selected: true }).data().toArray();

    console.log(dataCheck);
  });
});
