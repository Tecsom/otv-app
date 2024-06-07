import { fetchData, isoDateToFormatted, isoDateToFormattedWithTime } from '../helpers.js';

let page = 1;
const limit = 8;
let loadMore = true;
let isLoading = false;
let estatusFilters = ['pendiente', 'proceso'];
let search = '';
let timeout_debounce;
let createdAtFilter = null;
let deliveryDateFilter = null;

let selectedRowDestination;
let selectedRowContainer;
let selectedRowProduct;
let contenedorId;
const badgeType = {
  pendiente: 'primary',
  proceso: 'secondary',
  embarque: 'info',
  cancelada: 'danger',
  finalizada: 'success'
};

const flatpickOptions = {
  dateFormat: 'd/m/Y',
  mode: 'range',
  locale: {
    firstDayOfWeek: 1,
    weekdays: {
      shorthand: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
      longhand: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    },
    months: {
      shorthand: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Оct', 'Nov', 'Dic'],
      longhand: [
        'Enero',
        'Febrero',
        'Мarzo',
        'Abril',
        'Mayo',
        'Junio',
        'Julio',
        'Agosto',
        'Septiembre',
        'Octubre',
        'Noviembre',
        'Diciembre'
      ]
    }
  }
};

const flatpckr_created = $('#range_filter').flatpickr({
  onChange: function (selectedDates, dateStr) {
    if (selectedDates.length < 2) return;

    const startDate = new Date(selectedDates[0]).toISOString();
    //end date at the end of the day

    const endDate = new Date(new Date(selectedDates[1]).getTime() + 23 * 60 * 60 * 1000).toISOString();

    createdAtFilter = [startDate, endDate];
    page = 1;
    loadMore = true;
    $('#embarques_container').empty();
    loadEmbarques();
  },
  maxDate: 'today',
  ...flatpickOptions
});

const flatpckr_delivery = $('#range_entrega_filter').flatpickr({
  onChange: function (selectedDates, dateStr) {
    if (selectedDates.length < 2) return;

    const startDate = new Date(selectedDates[0]).toISOString();

    //end date at the end of the day
    const endDate = new Date(new Date(selectedDates[1]).getTime() + 23 * 60 * 60 * 1000).toISOString();

    deliveryDateFilter = [startDate, endDate];

    page = 1;
    loadMore = true;
    $('#embarques_container').empty();
    loadEmbarques();
  },
  ...flatpickOptions
});

$(() => {
  init();
});

async function init() {
  new PerfectScrollbar(document.getElementById('embarques_container'), {
    wheelPropagation: false
  });

  $('#productos_table').DataTable({
    data: [],
    columns: [
      { title: '' },
      { title: '# Parte' },
      { title: 'Costo Produccion' },
      { title: 'Descripción' },
      { title: 'Costo Venta' },
      { title: 'Tipo' }
    ],
    searching: false,
    lengthChange: false,
    info: false,
    language: {
      url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
    },
    pageLength: 5,
    ordering: false,
    select: false,
    destroy: true,
    paging: true
  });

  $('#verificaciones_table').DataTable({
    data: [],
    columns: [
      { title: 'nombre contenedor', data: 'nombre_contenedor' },
      {
        title: 'fecha verificacion',
        data: 'created_at',
        render: function (row) {
          return isoDateToFormattedWithTime(row);
        }
      },
      { title: 'codigo', data: 'codigo_contenedor' }
    ],
    pageLength: 5,
    ordering: false,
    select: false,
    destroy: true,
    searching: false,
    lengthChange: false,
    info: false,
    language: {
      url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
    }
  });

  $('#add_product_select').select2({
    dropdownParent: $('#addProductsModal'),
    placeholder: 'Selecciona una orden'
  });

  $('#contenedor_add_product').select2({
    dropdownParent: $('#addProductsModal'),
    placeholder: 'Selecciona un contenedor'
  });

  $('#clientes_select').select2({
    placeholder: 'Selecciona un cliente',
    dropdownParent: $('#add_destination_modal')
  });
  const $fecha_entrega = $('#fecha_entrega');
  $fecha_entrega.flatpickr({
    // EN ESTA PARTE ES DONDE SE REGISTRA EL EVENTO
    onChange: function (selectedDates, dateStr, instance) {
      $fecha_entrega.data({ value: selectedDates[0] });
    },
    // FIN EVENTO
    minDate: 'today',
    dateFormat: 'd/m/Y',
    //maxDate: 'today',
    locale: {
      firstDayOfWeek: 1,
      weekdays: {
        shorthand: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
        longhand: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
      },
      months: {
        shorthand: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Оct', 'Nov', 'Dic'],
        longhand: [
          'Enero',
          'Febrero',
          'Мarzo',
          'Abril',
          'Mayo',
          'Junio',
          'Julio',
          'Agosto',
          'Septiembre',
          'Octubre',
          'Noviembre',
          'Diciembre'
        ]
      }
    }
  });

  const $fecha_embarque = $('#fecha_embarque');
  $fecha_embarque.flatpickr({
    // EN ESTA PARTE ES DONDE SE REGISTRA EL EVENTO
    onChange: function (selectedDates, dateStr, instance) {
      $fecha_embarque.data({ value: selectedDates[0] });
    },
    // FIN EVENTO
    minDate: 'today',
    dateFormat: 'd/m/Y',
    //maxDate: 'today',
    locale: {
      firstDayOfWeek: 1,
      weekdays: {
        shorthand: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
        longhand: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
      },
      months: {
        shorthand: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Оct', 'Nov', 'Dic'],
        longhand: [
          'Enero',
          'Febrero',
          'Мarzo',
          'Abril',
          'Mayo',
          'Junio',
          'Julio',
          'Agosto',
          'Septiembre',
          'Octubre',
          'Noviembre',
          'Diciembre'
        ]
      }
    }
  });
  await loadEmbarques();
}

$('.filter-checkbox').on('change', function () {
  const checked = $(this).prop('checked');
  const value = $(this).val();

  if (checked) {
    estatusFilters.push(value);
  } else {
    estatusFilters = estatusFilters.filter(elm => elm !== value);
  }

  page = 1;
  loadMore = true;
  $('#embarques_container').empty();
  loadEmbarques();
});

async function getEmbarques() {
  // page, pageSize, search
  if (!loadMore) return [];
  const createdAtFilterString = createdAtFilter?.join(',') ?? '';
  const deliveryDateFilterString = deliveryDateFilter?.join(',') ?? '';

  console.log(estatusFilters);
  const query = `?page=${page}&pageSize=${limit}&estatusFiltersStr=${estatusFilters.join(',')}&search=${search}&createdAtFilterString=${createdAtFilterString}&deliveryDateFilterString=${deliveryDateFilterString}`;
  isLoading = true;
  const embarques = await fetchData('/embarques/paging' + query, 'GET'); //api/embarques
  isLoading = false;

  if (!embarques.status) {
    toastr.error('Ocurrió un error al obtener embarques');
    return;
  }

  if (embarques.data.length < limit) {
    loadMore = false;
  }

  page = page + 1;
  return embarques.data;
}

async function loadEmbarques() {
  const $container = $('#embarques_container');

  const embarques = await getEmbarques();

  for (let embarque of embarques) {
    const uniqueFolio = addLeadingZeros(embarque.folio_unico, 6);

    const $newdiv1 = $(`
    <div class="embarque_container_child card-body border  cursor-pointer" embarque_id="${embarque.id}" id="order_${uniqueFolio}" folio="${embarque.id}">
      <div class="row g-2">
        <div class="col-md-12">
          <div class="d-flex align-items-center justify-content-between p-2 pb-0">
            <span class="badge bg-label-dark">${uniqueFolio}</span>
            <span class="text-capitalize badge bg-${badgeType[embarque.estado]}">${embarque.estado}</span>
          </div>
        </div>
        <div class="col-md-12">
          <hr class="m-0" />
        </div>
        <div class="col-md-12">
          <div class="p-2 pb-1 pt-0">
            <p class="mb-0 small"><strong>Descripción: </strong>${embarque.descripcion ?? '<span style="color:Red">Sin cliente relacionado</span>'}</p>
            <p class="mb-0 small"><strong>Fecha de embarque: ${isoDateToFormatted(embarque.fecha_embarque)}</strong></p>   
            <p class="mb-0 small"><strong>Fecha de entrega: ${isoDateToFormatted(embarque.fecha_entrega)}</strong></p>
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

$('#embarques_container').on('scroll', async function () {
  const hasBottomReached = checkIfHasBottomReached(this);

  if (hasBottomReached && loadMore && !isLoading) await loadEmbarques();
});

const checkIfHasBottomReached = el => {
  const offset = 10;
  if (el === null) return false;

  const dif = el.scrollHeight - el.scrollTop;

  return dif <= el.clientHeight + offset;
};

$('#create_embarque').on('submit', async function (e) {
  e.preventDefault();
  //Variables para post
  $('#create_embarque_button').prop('disabled', true);

  const $descripcion = $('#descripcion_embarque');
  const $fecha_embarque = $('#fecha_embarque').data().value;
  const $fecha_entrega = $('#fecha_entrega').data().value;

  if (
    $descripcion.val().trim() == '' ||
    $fecha_embarque == '' ||
    $fecha_embarque == undefined ||
    $fecha_entrega == '' ||
    $fecha_entrega == undefined
  ) {
    toastr.error('Completar los campos para crear el embarque');
    $('#create_embarque_button').prop('disabled', false);

    return;
  }

  const fecha_embarque = new Date($fecha_embarque);
  const fecha_entrega = new Date($fecha_entrega);

  fecha_embarque.setUTCHours(fecha_embarque.getUTCHours() - 6);
  const isoStringEmbarque = fecha_embarque.toISOString();

  fecha_entrega.setUTCHours(fecha_entrega.getUTCHours() - 6);
  const isoStringEntrega = fecha_entrega.toISOString();

  const descripcion = $descripcion.val().trim();

  const result = await fetchData('/embarque/create', 'POST', {
    descripcion: descripcion,
    fecha_embarque: isoStringEmbarque,
    fecha_entrega: isoStringEntrega
  });

  const apiResult = result.data;

  if (apiResult.status == false) {
    $('#create_embarque_button').prop('disabled', false);
    toastr.error(apiResult.data, 'Ocurrió un error');
    return;
  }

  toastr.success('Creado con éxito');
  $descripcion.val('');

  $('#create_embarque_modal').modal('hide');
  $('#create_embarque_button').prop('disabled', false);

  $('#fecha_entrega').val('');
  $('#fecha_embarque').val('');

  $('#fecha_entrega').data({ value: '' });
  $('#fecha_embarque').data({ value: '' });

  await loadEmbarques();
});

$('#embarques_container').on('click', '.embarque_container_child', async function (e) {
  const $embarque = $(this);
  const data = $embarque.data().data;
  //const cliente_id = data?.clientes.id;
  console.log(data);

  await loadContenedores(data);
  await loadCodigos(data);

  $embarque.addClass('active-container').siblings().removeClass('active-container');

  $('#data-folio').text(addLeadingZeros(data.folio_unico, 6));
  $('#data-fecha-creacion').text('Fecha de creación: ' + isoDateToFormatted(data.created_at));

  $('#data-status-data').text(data.estado);
  $('#data-status-data').removeClass().addClass(`text-capitalize badge bg-${badgeType[data.estado]}`);

  $('#data-description-data').text(data.descripcion);
  $('#client_id').text('1');
  $('#client_currency').text('MXN');

  $('#container-no-data').addClass('d-none');
  $('#container-data').removeClass('d-none');

  $('#data-embarque-data').text(data.fecha_embarque ? isoDateToFormatted(data.fecha_embarque) : '-');
  $('#data-fecha-entrega').text(data.fecha_entrega ? isoDateToFormatted(data.fecha_entrega) : '-');

  $('#data-last-update').text(data.last_update ? isoDateToFormatted(data.last_update) : '-');
  $('#input_container_type').val(data.tipo_contenedor);
  $('#container-reporte').data(data);

  $('#generate_order').addClass('d-none');
  $('#generate_embarque').addClass('d-none');
  $('#edit_oc').addClass('d-none');
  $('#delete_oc').addClass('d-none');
  $('#cancelar_oc').addClass('d-none');
  $('#restaurar_oc').addClass('d-none');
  $('#finalizar_oc').addClass('d-none');
  $('#add_product_container_modal').addClass('d-none');
  $('#create_container_modal').addClass('d-none');
  $('#addDestinationButton').addClass('d-none');

  $('#productos_table_tab').DataTable().column(4).visible(false);
  $('#contenedores_table').DataTable().column(3).visible(false);
  $('#destinos_table').DataTable().column(4).visible(false);

  if (data.estado === 'pendiente') {
    $('#generate_order').removeClass('d-none');
    $('#edit_oc').removeClass('d-none');
    $('#delete_oc').removeClass('d-none');
    $('#add_product_container_modal').removeClass('d-none');
    $('#addDestinationButton').removeClass('d-none');
    $('#generate_embarque').removeClass('d-none');

    $('#productos_table_tab').DataTable().column(4).visible(true);
    $('#contenedores_table').DataTable().column(3).visible(true);
    $('#destinos_table').DataTable().column(4).visible(true);

    $('#create_container_modal').removeClass('d-none');
  } else if (data.estado === 'cancelada') {
    $('#restaurar_oc').removeClass('d-none');
  } else if (data.estado === 'finalizada') {
  } else {
    $('#cancelar_oc').removeClass('d-none');
    $('#finalizar_oc').removeClass('d-none');
  }

  await loadProducts(data);
  await loadDestinos();
  await loadVerificaciones(data.id);
  await loadContenedores(data);
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

  $('#data-folio').text('-');
  $('#data-fecha-creacion').text('-');
  $('#edit_oc').addClass('d-none');
  $('#delete_oc').addClass('d-none');
  $('#cancelar_oc').addClass('d-none');
  $('#restaurar_oc').addClass('d-none');

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
  const descripcion = $descripcion.val().trim();

  const last_update = new Date().toISOString();

  if (descripcion == '') {
    toastr.error('Completar los campos para editar el embarque');
    return;
  }

  const result = await fetchData('/embarque/' + embarque_id, 'PUT', {
    descripcion: descripcion,
    last_update: last_update
  });

  if (result.status == false) {
    toastr.error(result.data);
    return;
  }

  toastr.success('Embarque editado con éxito');
  $('#edit_embarque_modal').modal('hide');

  $('#data-last-update').text(isoDateToFormatted(last_update));

  $('#data-description-data').text(descripcion);
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

//agregar campo de fecha de embarque y fecha de entrega al crear un nuevo embarque, actualizar UI, cambiar diseño y logica en la parte de contenedores

// SECCIÓN EN LA QUE SE ABRE MODAL PARA SELECCIONAR ORDENES Y CARGADO DE ORDENES A <select></select>
$('#add_product_container_modal').on('click', async function () {
  $('#addProductsModal').modal('show');
  const embarque_data = $('#container-reporte').data();

  let ordenes = await fetchData('/embarques/ordenes', 'GET', {});

  const dataTable = $('#productos_table_tab').DataTable().data().toArray();

  ordenes = ordenes.data.filter(item => {
    const productIds = item.order_id.productos.map(producto => producto.id);
    return !productIds.every(productId => dataTable.some(dataItem => dataItem.producto_id == productId));
  });
  if (ordenes.status == false) {
    toastr.error('Error al obtener las ordenes');
    return;
  }

  $('#add_product_select').empty();

  $('#add_product_select').append('<option value=""></option>');

  ordenes.forEach(function (item) {
    const option = $(`<option value="${item.id}">Folio unico: ${item.folio} </option>`);
    option.data('productos', item.order_id.productos || item.productos);
    $('#add_product_select').append(option);
  });

  $('#add_product_select').trigger('change');

  const contenedores = await fetchData('/embarque/contenedores/' + embarque_data.id, 'GET', {});

  if (contenedores.status == false) {
    toastr.error('Error al obtener los contenedores');
    return;
  }

  $('#contenedor_add_product').empty();

  $('#contenedor_add_product').append('<option value=""></option>');

  contenedores.data.forEach(function (item) {
    const option = $(`<option value="${item.id}">${item.nombre_contenedor}</option>`);
    option.data('contenedor', item);
    $('#contenedor_add_product').append(option);
  });
});
// FIN DE LA SECCIÓN DE MODAL PARA SELECCIONAR ORDENES

// SECCIÓN DE MODAL PARA AGREGAR Y RECUPERAR LOS DATOS DE LAS ORDENES
$('#contenedor_add_product').on('change', function () {
  const selectedOption = $(this).find('option:selected');
  let data = selectedOption.data('contenedor');

  contenedorId = data.id;
});

$('#add_product_select').on('change', function () {
  const selectedOption = $(this).find('option:selected');
  let data = selectedOption.data('productos');

  if (!data) {
    $('#confirm_add_products').prop('disabled', true);
  } else {
    $('#confirm_add_products').prop('disabled', false);
  }

  if (!data || !Array.isArray(data)) {
    return;
  }

  const dataTable = $('#productos_table_tab').DataTable().data().toArray();

  data = data.filter(item => !dataTable.some(dataItem => dataItem.producto_id == item.id));

  const dataForTable = data.map(function (item) {
    return {
      id: item.id,
      checkbox:
        `<input type="checkbox" class="form-check-input product_check" name="product_${item.id}" id="product_${item.id}">` ||
        '',
      client_id: item.client_id || '',
      client_name: item.client_name || '',
      codigos: item.codigos || '',
      currency_costo_produccion: item.currency_costo_produccion || '',
      currency_costo_venta: item.currency_costo_venta || '',
      descripcion: item.descripcion || '',
      estado: item.estado || '',
      numero_parte: item.numero_parte || '',
      order_id: item.order_id || '',
      pieza_id: item.pieza_id || '',
      piezas: item.piezas || '',
      proveedor_id: item.proveedor_id || '',
      quantity: item.quantity || '',
      revision_description: item.revision_description || '',
      revision_id: item.revision_id || '',
      revision_name: item.revision_name || '',
      revisiones: item.revisiones || '',
      descripcion: item.descripcion || '',
      tipo: item.type == 'bulk' ? 'A granel' : 'Individual'
    };
  });

  if ($.fn.DataTable.isDataTable('#productos_table')) {
    $('#productos_table').DataTable().destroy();
  }

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
      { data: 'numero_parte', title: '# Parte', orderable: true, className: 'non-selectable' },
      { data: 'currency_costo_produccion', title: 'Costo Produccion', orderable: true, className: 'non-selectable' },
      { data: 'descripcion', title: 'Descripcion', orderable: false, className: 'non-selectable' },
      { data: 'currency_costo_venta', title: 'Costo Venta', orderable: true, className: 'non-selectable' },
      { data: 'tipo', title: 'Tipo', orderable: false, className: 'non-selectable' }
    ],
    dom: 'rtp',
    paging: false,
    language: {
      url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
    },
    order: [[0, 'asc']],
    searching: false,
    info: false,
    destroy: true
  });

  $('#productos_table thead, tbody').off('change');
});
//FIN DE LA SECCIÓN DE RECUPARA LOS DATOS DE LAS ORDENES

// INSERTAR DATOS A LA TABLA DE EMBARQUES_PRODUCTS
$('#confirm_add_products').on('click', async function () {
  const data = $('#container-reporte').data();

  const selectedProducts = $('#productos_table').DataTable().rows({ selected: true }).data().toArray();

  if (selectedProducts.length == 0) {
    toastr.error('Selecciona al menos un producto');
    return;
  }
  if ($('#contenedor_add_product').val() == '') {
    toastr.error('Selecciona un contenedor');
    return;
  }

  const contenedorId = $('#contenedor_add_product').val();

  const allRows = $('#productos_table_tab').DataTable().rows().data().toArray();

  const groupRows = allRows.filter(row => row.contenedor_id == contenedorId);
  const totalRows = groupRows.length + selectedProducts.length;

  console.log(groupRows);
  console.log(totalRows);

  for (let product of selectedProducts) {
    console.log({ product });
    let result = await fetchData('/embarques/productos', 'POST', {
      embarque_id: data.id,
      producto_id: product.id,
      cantidad: product.quantity,
      estado: true,
      order_id: product.order_id,
      contenedor_id: contenedorId,
      cantidad_filas: totalRows
    });
  }

  toastr.success('Productos agregados con éxito');
  $('#addProductsModal').modal('hide');
  await loadContenedores(data);
  await loadProducts(data);
});

// METODO PARA CARGAR LA TABLA DE CONTENEDORES EN EL APARTADO DE CONTENEDORES
const loadContenedores = async data => {
  const response = await fetchData('/embarques/contenedores/' + data.id, 'GET', {});

  console.log(response.data);

  const contenedors_data_table = response.data.map(contenedor => {
    return {
      id: contenedor.id,
      nombre_contenedor: contenedor.nombre_contenedor,
      codigo_contenedor: contenedor.codigo,
      cantidad: contenedor.cantidad,
      embarque_id: contenedor.embarque_id
    };
  });

  contenedores_table.clear();
  contenedores_table.rows.add(contenedors_data_table).draw();
};
// METODO PARA CARGAR LA TABLA DE PRODUCTOS EN EL APARTADO DE CONTENEDORES
const loadProducts = async data => {
  const response = await fetchData(`/embarques/${data.id}/productos`, 'GET', {});

  const productos_table_data = response.data.map(producto => {
    console.log({ producto });
    return {
      id: producto.id,
      nombre_producto: producto.order_products.piezas.numero_parte || '',
      descripcion_producto: producto.order_products.piezas.descripcion || '',
      cliente: producto.order_products.piezas.cliente_id.nombre || '',
      contenedor: producto.contenedor_id.nombre_contenedor,
      producto_id: producto.producto_id,
      cantidad: producto.cantidad,
      contenedor_id: producto.contenedor_id.id,
      order_id: producto.order_id
    };
  });

  productos_table.clear().rows.add(productos_table_data).draw();
};

$('#addProductsModal').on('hidden.bs.modal', function () {
  let table = $('#productos_table').DataTable();
  table.clear().draw();
  table.destroy();
});

function addLeadingZeros(number, length) {
  let numStr = String(number);

  let zerosToAdd = Math.max(length - numStr.length, 0);

  return '0'.repeat(zerosToAdd) + numStr;
}

$('#contenedores_table').on('click', '.editar-contenedor', async function (e) {
  selectedRowContainer = $(this).closest('tr');

  const data = $('#contenedores_table').DataTable().row(selectedRowContainer).data();

  console.log({ selectedRowContainer });
  $('#nombre_contenedor_update').val(data.nombre_contenedor);

  $('#update_container_modal').modal('show');
});

$('#confirm_update_container').on('click', async function (e) {
  const $nombre_contenedor = $('#nombre_contenedor_update');
  const nombre_contenedor = $nombre_contenedor.val().trim();

  if (nombre_contenedor == '') {
    toastr.error('Completar los campos para editar el contenedor');
    return;
  }
  const dataContainer = $('#container-reporte').data();

  const data = $('#contenedores_table').DataTable().row(selectedRowContainer).data();

  console.log(data);

  console.log(dataContainer);

  const result = await fetchData('/embarque/contenedor/' + data.id, 'PUT', {
    nombre_contenedor: nombre_contenedor
  });

  if (result.status == false) {
    toastr.error('Error al eliminar el contenedor');
    return;
  }

  toastr.success('Contenedor editado con éxito');

  $('#update_container_modal').modal('hide');

  await loadContenedores(dataContainer);
});

$('#contenedores_table').on('click', '.eliminar-contenedor', async function (e) {
  $('#delete_container_modal').modal('show');
  selectedRowContainer = $(this).closest('tr');
});

$('#confirm_delete_container').on('click', async function (e) {
  const dataContainer = $('#container-reporte').data();

  const data = $('#contenedores_table').DataTable().row(selectedRowContainer).data();
  console.log(data);

  if (data.cantidad > 0) {
    toastr.error('Para eliminar el contenedor primero elimina sus productos');
    return;
  }

  const result = await fetchData('/embarque/contenedor/' + data.id, 'DELETE', {});

  if (result.status == false) {
    toastr.error('Error al eliminar el contenedor');
    return;
  }

  await loadContenedores(dataContainer);

  toastr.success('Contenedor eliminado con éxito');

  $('#delete_container_modal').modal('hide');
});

$('#productos_table_tab').on('click', '.eliminar-producto', async function (e) {
  $('#delete_producto_modal').modal('show');
  selectedRowProduct = $(this).closest('tr');
});

$('#confirm_delete_product').on('click', async function (e) {
  const dataContainer = $('#container-reporte').data();

  const data = $('#productos_table_tab').DataTable().row(selectedRowProduct).data();
  console.log(data);

  const contenedorId = $('#contenedor_add_product').val();

  console.log(contenedorId);

  const allRows = $('#productos_table_tab').DataTable().rows().data().toArray();

  const groupRows = allRows.filter(row => row.contenedor_id == data.contenedor_id);
  const totalRows = groupRows.length - 1;

  console.log(totalRows);

  const result = await fetchData('/embarque/productos/' + data.id, 'PUT', {
    contenedor_id: data.contenedor_id,
    cantidad: totalRows
  });

  if (result.status == false) {
    toastr.error('Error al eliminar el contenedor');
    return;
  }

  toastr.success('Producto eliminado con éxito');

  $('#delete_producto_modal').modal('hide');

  await loadProducts(dataContainer);
  await loadContenedores(dataContainer);
});

$('#create_container_modal').on('click', function () {
  $('#addContainerEmbarque').modal('show');
});

$('#generate_embarque').on('click', async function () {
  $('#generate_embarque_modal').modal('show');
});

$('#confirm_generate_embarque').on('click', async function () {
  const embarque_data = $('#container-reporte').data();
  const contenedor_data = $('#contenedores_table').DataTable().rows().data().toArray();

  const allRows = $('#productos_table_tab').DataTable().rows().data().toArray();
  const rowsDestinos = $('#destinos_table').DataTable().rows().data().toArray();
  if (allRows.length == 0) {
    toastr.error('Agrega al menos un producto al embarque');
    return;
  }
  if (rowsDestinos.length == 0) {
    toastr.error('Agrega al menos un destino al embarque');
    return;
  }

  for (let contenedor of contenedor_data) {
    console.log(contenedor);
    const result = await fetchData('/embarques/codigo/contenedor', 'POST', {
      code: contenedor.codigo_contenedor,
      embarque_id: contenedor.embarque_id.id,
      contenedor_id: contenedor.id
    });

    if (result.status == false) {
      toastr.error('Error al crear los codigos de los contenedores');
      return;
    }
  }

  $('#data-status-data').text('proceso');
  $('#data-status-data').removeClass().addClass(`text-capitalize badge bg-secondary`);
  $('#create_container_modal').prop('disabled', true);
  $('#add_product_container_modal').prop('disabled', true);
  $('#generate_embarque').addClass('d-none');
  $('#delete_oc').addClass('d-none');
  $('#edit_oc').addClass('d-none');
  $('#cancelar_oc').removeClass('d-none');
  $('#finalizar_oc').removeClass('d-none');
  $('#productos_table_tab').DataTable().column(4).visible(false);
  $('#contenedores_table').DataTable().column(3).visible(false);
  $('#destinos_table').DataTable().column(4).visible(false);

  $('#generate_embarque').addClass('d-none');
  $('#addDestinationButton').addClass('d-none');
  $('#create_container_modal').addClass('d-none');
  $('#add_product_container_modal').addClass('d-none');

  await cambiarStatus('proceso');

  await loadCodigos(embarque_data);
  await loadEmbarques();

  toastr.success('Embarque generado con éxito');

  $('#generate_embarque_modal').modal('hide');
});

$('#confirm_add_container').on('click', async function () {
  const data = $('#container-reporte').data();

  const $nombre_contenedor = $('#nombre_contenedor');

  const nombre_contenedor = $nombre_contenedor.val().trim();

  if (nombre_contenedor == '') {
    toastr.error('Completar los campos para generar el contenedor');
    return;
  }

  const response = await fetchData(`/embarque/${data.id}/contenedor`, 'POST', {
    nombre_contenedor: nombre_contenedor
  });

  if (response.status == false) {
    toastr.error('Error al generar el contenedor');
    return;
  }

  await loadContenedores(data);

  $nombre_contenedor.val('');
  toastr.success('Contenedor generado con éxito');

  $('#addContainerEmbarque').modal('hide');
});

async function cambiarStatus(estado) {
  const table_prods_data = $('#productos_table_tab').DataTable().rows().data().toArray();
  const data = $('#container-reporte').data();

  for (let product of table_prods_data) {
    const result = await fetchData('/embarque/estado/' + data.id, 'PUT', {
      estado: estado,
      order_id: product.order_id
    });

    if (result.status == false) {
      toastr.error('Error al cambiar el estado del embarque');
      return;
    }
  }

  $('#embarques_container').empty();
  await loadEmbarques();

  resetPaging();
}

$('#confirm_cancel_order').on('click', async function () {
  cambiarStatus('cancelada');

  $('#productos_table_tab').DataTable().column(4).visible(false);
  $('#cancel_order_modal').modal('hide');

  $('#cancelar_oc').addClass('d-none');
  $('#finalizar_oc').addClass('d-none');
  $('#restaurar_oc').removeClass('d-none');

  $('#data-status-data').text('cancelada');
  $('#data-status-data').removeClass().addClass('text-capitalize badge bg-danger');

  toastr.success('Embarque cancelado con éxito');
});

$('#search-report-filter').on('input', function () {
  //debounce 1 sec
  if (timeout_debounce) clearTimeout(timeout_debounce);
  timeout_debounce = setTimeout(() => {
    search = $(this).val();
    page = 1;
    loadMore = true;
    $('#embarques_container').empty();
    loadEmbarques();
    clearTimeout(timeout_debounce);
    timeout_debounce = null;
  }, 1000);
});

$('#confirm_restore_order').on('click', async function () {
  await cambiarStatus('proceso');

  $('#restaurar_oc').addClass('d-none');
  $('#cancelar_oc').removeClass('d-none');
  $('#finalizar_oc').removeClass('d-none');

  $('#generate_embarque').addClass('d-none');
  $('#addDestinationButton').addClass('d-none');
  $('#create_container_modal').addClass('d-none');
  $('#add_product_container_modal').addClass('d-none');

  $('#data-status-data').text('proceso');
  $('#data-status-data').removeClass().addClass('text-capitalize badge bg-secondary');

  toastr.success('Embarque restaurado con éxito');
  $('#restore_orden_modal').modal('hide');
});

$('#finalizar_oc').on('click', function () {
  $('#finalizarEmbarque').modal('show');
});

$('#confirm_finish_embarque').on('click', async function () {
  await cambiarStatus('finalizada');

  $('#productos_table_tab');
  $('#finalizar_oc').addClass('d-none');
  $('#cancelar_oc').addClass('d-none');
  $('#generate_embarque').addClass('d-none');
  $('#edit_oc').addClass('d-none');
  $('#delete_oc').addClass('d-none');
  $('#restaurar_oc').addClass('d-none');

  $('#data-status-data').text('finalizada');
  $('#data-status-data').removeClass().addClass('text-capitalize badge bg-success');

  $('#create_container_modal').prop('disabled', true);
  $('#add_product_container_modal').prop('disabled', true);
  $('#productos_table_tab').DataTable().column(4).visible(false);
  $('#addDestinationButton').addClass('d-none');
  $('#contenedores_table').DataTable().column(3).visible(false);
  $('#destinos_table').DataTable().column(4).visible(false);

  toastr.success('Embarque finalizado con éxito');

  $('#finalizarEmbarque').modal('hide');
});

$('#addDestinationButton').on('click', async function () {
  $('#add_destination_modal').modal('show');

  $('#direccion_destino').val('');
  $('#correo_cliente').val('');
  $('#telefono_cliente').val('');

  const dataTable = $('#destinos_table').DataTable().data().toArray();

  const result = await fetchData('/clientes', 'GET', {});

  if (result.status == false) {
    toastr.error('Error al obtener los clientes');
    return;
  }

  console.log(result);

  const filteredData = result.data.filter(destino => !dataTable.some(dataItem => dataItem.id == destino.id));

  $('#clientes_select').empty();

  $('#clientes_select').append('<option value=""></option>');

  filteredData.forEach(function (item) {
    const option = $(`<option value='${item.id}'>${item.nombre}</option>`);
    option.data('cliente', item);
    $('#clientes_select').append(option);
  });
});

$('#clientes_select').on('change', function () {
  const selectedOption = $(this).find('option:selected');
  let data = selectedOption.data('cliente');

  $('#direccion_destino').val(`${data.ciudad} ${data.estado}, ${data.pais}  ${data.domicilio}`);
  $('#correo_cliente').val(data.correo);
  $('#telefono_cliente').val(data.telefono);
});

$('#confirm_add_cliente').on('click', async function () {
  const selectedOption = $('#clientes_select').find('option:selected');
  let data = selectedOption.data('cliente');

  const $direccion_destino = $('#direccion_destino');
  const direccion_destino = $direccion_destino.val().trim();

  if (direccion_destino == '') {
    toastr.error('Completar los campos para agregar el destino');
    return;
  }

  const result = await fetchData('/destinos/create', 'POST', {
    ubicacion: direccion_destino,
    correo: data.correo,
    telefono: data.telefono,
    cliente_id: data.id,
    embarque_id: $('#container-reporte').data().id
  });

  console.log(result);

  if (result.status == false) {
    toastr.error('Error al agregar el destino');
    return;
  }

  await loadDestinos();

  toastr.success('Destino agregado con éxito');
  $('#add_destination_modal').modal('hide');
});

$('#destinos_table').on('click', '.eliminar-destino', function () {
  selectedRowDestination = $(this).closest('tr');

  console.log(selectedRowDestination);
  $('#delete_destination_modal').modal('show');
});

$('#confirm_delete_destino').on('click', async function () {
  const data = $('#destinos_table').DataTable().row(selectedRowDestination).data();
  console.log(data);
  const result = await fetchData('/destinos/' + data.id, 'DELETE', {});

  if (result.status == false) {
    toastr.error('Error al eliminar el destino');
    return;
  }

  toastr.success('Destino eliminado con éxito');

  $('#delete_destination_modal').modal('hide');

  await loadDestinos();
});

$('#destinos_table').on('click', '.editar-destino', function () {
  selectedRowDestination = $(this).closest('tr');

  const data = $('#destinos_table').DataTable().row(selectedRowDestination).data();

  $('#edit_ubicacion').val(data.domicilio);

  $('#update_destination_modal').modal('show');
});

$('#confirm_update_destino').on('click', async function () {
  const data = $('#destinos_table').DataTable().row(selectedRowDestination).data();

  const $destino = $('#edit_ubicacion');

  const ubicacion = $destino.val().trim();

  if (ubicacion == '') {
    toastr.error('Completar los campos para editar el destino');
    return;
  }

  const result = await fetchData('/destinos/' + data.id, 'PUT', {
    ubicacion: ubicacion
  });

  if (result.status == false) {
    toastr.error('Error al editar el destino');
    return;
  }

  toastr.success('Destino editado con éxito');

  $('#update_destination_modal').modal('hide');

  await loadDestinos();
});

$('#destinos_table').on('click', '', '');
async function loadDestinos() {
  const data = $('#container-reporte').data();

  const response = await fetchData(`/destinos/${data.id}`, 'GET', {});

  console.log(response);

  const destinos_data_table = response.data.map(destino => {
    return {
      id: destino.id,
      cliente: destino.cliente_id.nombre,
      domicilio: destino.ubicacion,
      telefono: destino.telefono,
      correo: destino.correo
    };
  });

  destinos_table.clear().rows.add(destinos_data_table).draw();
}

async function loadCodigos(data) {
  const response = await fetchData('/embarque/codigo/contenedor/' + data.id, 'GET', {});

  const codigos_data = response.data.map(codigo => {
    return {
      id: codigo.id,
      codigo: codigo.code,
      contenedor: codigo.contenedor_id.nombre_contenedor
    };
  });

  codigos_table.clear().rows.add(codigos_data).draw();
}

$('#remove-filters-btn').on('click', function () {
  $('#search-report-filter').val('');

  flatpckr_created.clear();
  flatpckr_delivery.clear();

  estatusFilters = ['pendiente', 'proceso', 'embarque'];

  $('#check_pendiente').prop('checked', true);
  $('#check_proceso').prop('checked', true);
  $('#check_embarque').prop('checked', true);
  $('#check_cancelada').prop('checked', false);
  $('#check_completada').prop('checked', false);

  search = '';
  createdAtFilter = null;
  deliveryDateFilter = null;

  page = 1;
  loadMore = true;
  $('#embarques_container').empty();

  const lengthCodigos = codigos_table.rows.data().toArray().length;
  console.log(lengthCodigos);

  $('#code_total').text(lengthCodigos);
  loadEmbarques();
});

const loadVerificaciones = async id => {
  const result = await fetchData('/embarques/verificaciones/' + id, 'GET', {});

  console.log({ result: result.data });

  const contenedores_table_data = $('#contenedores_table').DataTable().data().toArray();

  const codigos = result.data.map(item => item.codigo);

  console.log({ codigos });

  const contenedoresFiltrados = contenedores_table_data.filter(row => codigos.includes(row.codigo_contenedor));

  const contenedoresConFecha = contenedoresFiltrados.map(contenedor => {
    const contenedorResult = result.data.find(item => item.codigo === contenedor.codigo_contenedor);
    return {
      ...contenedor,
      created_at: contenedorResult ? contenedorResult.created_at : null
    };
  });

  const progress = (contenedoresConFecha.length / contenedores_table_data.length) * 100;

  $('#progress-bar-verificaciones').css('width', progress + '%');
  $('#progress-bar-verificaciones').text(progress.toFixed(2) + '%');

  $('#verificaciones_table').DataTable().clear().rows.add(contenedoresConFecha).draw();
};

resetPaging = () => {
  page = 1;
  loadMore = true;
};
