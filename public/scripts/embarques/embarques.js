import { fetchData, isoDateToFormatted } from '../helpers.js';

var estadosMarcados = {
  cancelada: false,
  pendiente: true,
  embarque: true,
  finalizada: false
};

let selectedRowContainer;
let selectedRowProduct;
let contenedorId;
const badgeType = {
  pendiente: 'secondary',
  embarque: 'info',
  cancelada: 'danger',
  finalizada: 'success'
};

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
    paging: false
  });

  $('#add_product_select').select2({
    dropdownParent: $('#addProductsModal'),
    placeholder: 'Selecciona una orden'
  });

  $('#contenedor_add_product').select2({
    dropdownParent: $('#addProductsModal'),
    placeholder: 'Selecciona un contenedor'
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
    const uniqueFolio = addLeadingZeros(embarque.folio_unico, 5);

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
          </div>      
        </div>
      </div>
    </div>
  `);
    $newdiv1.data({ data: embarque });
    $container.append($newdiv1);
  }

  actualizarVisualizacion();
}

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

  await loadEmbarques();
});

$('#embarques_container').on('click', '.embarque_container_child', async function (e) {
  const $embarque = $(this);
  const data = $embarque.data().data;
  //const cliente_id = data?.clientes.id;

  await loadContenedores(data);

  $embarque.addClass('active-container').siblings().removeClass('active-container');

  $('#data-folio').text(addLeadingZeros(data.folio_unico, 5));
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

  $('#edit_oc').removeClass('d-none');
  $('#delete_oc').removeClass('d-none');
  $('#data-last-update').text(data.last_update ? isoDateToFormatted(data.last_update) : '-');
  $('#input_container_type').val(data.tipo_contenedor);
  $('#container-reporte').data(data);

  if (data.estado == 'embarque') {
    $('#delete_oc').addClass('d-none');
    $('#edit_oc').addClass('d-none');
    $('#restaurar_oc').addClass('d-none');
    $('#cancelar_oc').removeClass('d-none');
    $('#finalizar_oc').removeClass('d-none');

    $('#create_container_modal').prop('disabled', true);
    $('#add_product_container_modal').prop('disabled', true);

    $('#generate_embarque').addClass('d-none');
  } else if (data.estado == 'finalizada') {
    $('#delete_oc').addClass('d-none');
    $('#edit_oc').addClass('d-none');
    $('#cancelar_oc').addClass('d-none');
    $('#restaurar_oc').addClass('d-none');
    $('#finalizar_oc').addClass('d-none');

    $('#create_container_modal').prop('disabled', true);
    $('#add_product_container_modal').prop('disabled', true);
    $('#generate_embarque').addClass('d-none');
  } else if (data.estado == 'cancelada') {
    $('#delete_oc').addClass('d-none');
    $('#edit_oc').addClass('d-none');
    $('#cancelar_oc').addClass('d-none');
    $('#finalizar_oc').addClass('d-none');
    $('#restaurar_oc').removeClass('d-none');

    $('#add_product_container_modal').prop('disabled', true);
    $('#create_container_modal').prop('disabled', true);

    $('#generate_embarque').addClass('d-none');
  } else {
    $('#add_product_container_modal').prop('disabled', false);
    $('#create_container_modal').prop('disabled', false);

    $('#delete_oc').removeClass('d-none');
    $('#edit_oc').removeClass('d-none');
    $('#cancelar_oc').addClass('d-none');
    $('#finalizar_oc').addClass('d-none');
    $('#restaurar_oc').addClass('d-none');

    $('#generate_embarque').removeClass('d-none');
  }

  //const profile_pic_res = await fetchData(`/clientes/${cliente_id}/profile-photo`);
  //if (profile_pic_res.status === true) {
  //  $('#profile-pic').attr('src', profile_pic_res.data);
  //  $('#client_avatar').addClass('d-none');
  //  $('#profile-pic').removeClass('d-none');
  //}

  await loadContenedores(data);
  await loadProducts(data);
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
  const response = await fetchData(`/embarques/contenedores/` + data.id, 'GET', {});

  const contenedors_data_table = response.data.map(contenedor => {
    return {
      id: contenedor.id,
      nombre_contenedor: contenedor.nombre_contenedor,
      codigo_contenedor: contenedor.codigo,
      cantidad: contenedor.cantidad,
      //producto: contenedor.order_products.piezas.numero_parte,
      //descripcion_producto: contenedor.order_products.piezas.descripcion,
      //producto_id: contenedor.producto_id,
      //order_id: contenedor.order_id,
      embarque_id: contenedor.embarque_id
    };
  });

  contenedores_table.clear().rows.add(contenedors_data_table).draw();
};
// METODO PARA CARGAR LA TABLA DE PRODUCTOS EN EL APARTADO DE CONTENEDORES
const loadProducts = async data => {
  const response = await fetchData(`/embarques/${data.id}/productos`, 'GET', {});

  console.log('LOAD CONTENEDOR', response);

  const productos_table_data = response.data.map(producto => {
    console.log(producto);
    return {
      id: producto.id,
      nombre_producto: producto.order_products.piezas.numero_parte || '',
      descripcion_producto: producto.order_products.piezas.descripcion || '',
      cliente: producto.order_products.piezas.cliente_id.nombre || '',
      contenedor: producto.contenedor_id.nombre_contenedor,
      producto_id: producto.producto_id,
      cantidad: producto.cantidad,
      contenedor_id: producto.contenedor_id.id
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
  const data = $('#contenedores_table').DataTable().row($(this).closest('tr')).data();
  selectedRowContainer = data;

  console.log(data);
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

  const data = $('#contenedores_table').DataTable().row($('.eliminar-producto').closest('tr')).data();

  const result = await fetchData('/embarque/productos', 'DELETE', {
    embarque_id: data.embarque_id,
    producto_id: data.producto_id,
    order_id: data.order_id
  });

  if (result.status == false) {
    toastr.error('Error al eliminar el contenedor');
    return;
  }

  toastr.success('Producto eliminado con éxito');

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

  const result = await fetchData('/embarque/contenedor/' + data.id, 'DELETE', {});

  if (result.status == false) {
    toastr.error('Error al eliminar el contenedor');
    return;
  }

  toastr.success('Contenedor eliminado con éxito');

  $('#delete_container_modal').modal('hide');

  await loadContenedores(dataContainer);
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
  const allRows = $('#productos_table_tab').DataTable().rows().data().toArray();

  if (allRows.length == 0) {
    toastr.error('Agrega al menos un producto al embarque');
    return;
  }
  $('#generate_embarque_modal').modal('show');
});

$('#confirm_generate_embarque').on('click', async function () {
  cambiarStatus('embarque');

  $('#generate_embarque_modal').modal('hide');

  $('#data-status-data').text('embarque');
  $('#data-status-data').removeClass().addClass(`text-capitalize badge bg-info`);
  $('#create_container_modal').prop('disabled', true);
  $('#add_product_container_modal').prop('disabled', true);
  $('#generate_embarque').addClass('d-none');
  $('#delete_oc').addClass('d-none');
  $('#edit_oc').addClass('d-none');
  $('#cancelar_oc').removeClass('d-none');
  $('#finalizar_oc').removeClass('d-none');

  toastr.success('Embarque generado con éxito');

  await loadEmbarques();
});

$('#confirm_add_container').on('click', async function () {
  const data_contenedor = $('#container-reporte').data();

  const $nombre_contenedor = $('#nombre_contenedor');

  const nombre_contenedor = $nombre_contenedor.val().trim();

  if (nombre_contenedor == '') {
    toastr.error('Completar los campos para generar el contenedor');
    return;
  }

  try {
    await fetchData(`/embarque/${data_contenedor.id}/contenedor`, 'POST', {
      nombre_contenedor: nombre_contenedor
    });

    $nombre_contenedor.val('');
    toastr.success('Contenedor generado con éxito');
    $('#addContainerEmbarque').modal('hide');
  } catch (error) {
    console.log(error);
    toastr.warning('Error al generar el contenedor');
  }
  await loadContenedores(data_contenedor);
});

async function cambiarStatus(estado) {
  const data = $('#container-reporte').data();

  const result = await fetchData('/embarque/estado/' + data.id, 'PUT', {
    estado: estado
  });

  if (result.status == false) {
    toastr.error('Error al cambiar el estado del embarque');
    return;
  }

  loadEmbarques();
}

$('#restaurar_oc').on('click', async function () {});

$('#confirm_cancel_order').on('click', async function () {
  cambiarStatus('cancelada');

  $('#cancel_order_modal').modal('hide');

  $('#data-status-data').text('cancelada');
  $('#data-status-data').removeClass().addClass(`text-capitalize badge bg-danger`);
  $('#create_container_modal').prop('disabled', true);
  $('#add_product_container_modal').prop('disabled', true);
  $('#generate_embarque').addClass('d-none');
  $('#delete_oc').addClass('d-none');
  $('#edit_oc').addClass('d-none');
  $('#cancelar_oc').addClass('d-none');
  $('#finalizar_oc').addClass('d-none');
  $('#restaurar_oc').removeClass('d-none');

  toastr.success('Embarque cancelado con éxito');
});

$('#search-report-filter').on('keyup', function () {
  var value = $(this).val().toLowerCase();
  $('#embarques_container .embarque_container_child').filter(function () {
    $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
  });
});

// Función para actualizar la visualización de los elementos basada en los estados marcados
function actualizarVisualizacion() {
  $('#embarques_container .embarque_container_child').each(function () {
    var estado = $(this).data().data.estado.toLowerCase();
    $(this).toggle(estadosMarcados[estado]);
  });
}

$('#check_cancelada').on('change', function () {
  estadosMarcados['cancelada'] = this.checked;
  actualizarVisualizacion();
});

$('#check_pendiente').on('change', function () {
  estadosMarcados['pendiente'] = this.checked;
  actualizarVisualizacion();
});

$('#check_completada').on('change', function () {
  estadosMarcados['finalizada'] = this.checked;
  actualizarVisualizacion();
});

$('#check_embarque').on('change', function () {
  estadosMarcados['embarque'] = this.checked;
  actualizarVisualizacion();
});

$('#confirm_restore_order').on('click', async function () {
  await cambiarStatus('pendiente');

  $('#restaurar_oc').addClass('d-none');
  $('#cancelar_oc').removeClass('d-none');
  $('#finalizar_oc').removeClass('d-none');
  $('#generate_embarque').removeClass('d-none');

  $('#data-status-data').text('pendiente');
  $('#data-status-data').removeClass().addClass(`text-capitalize badge bg-secondary`);

  $('#create_container_modal').prop('disabled', false);
  $('#add_product_container_modal').prop('disabled', false);

  toastr.success('Embarque restaurado con éxito');
  $('#restore_orden_modal').modal('hide');
});

$('#finalizar_oc').on('click', function () {
  $('#finalizarEmbarque').modal('show');
});

$('#confirm_finish_embarque').on('click', async function () {
  await cambiarStatus('finalizada');

  $('#finalizar_oc').addClass('d-none');
  $('#cancelar_oc').addClass('d-none');
  $('#generate_embarque').addClass('d-none');
  $('#edit_oc').addClass('d-none');
  $('#delete_oc').addClass('d-none');
  $('#restaurar_oc').addClass('d-none');

  $('#data-status-data').text('finalizada');
  $('#data-status-data').removeClass().addClass(`text-capitalize badge bg-success`);

  $('#create_container_modal').prop('disabled', true);
  $('#add_product_container_modal').prop('disabled', true);

  toastr.success('Embarque finalizado con éxito');

  $('#finalizarEmbarque').modal('hide');

  await loadEmbarques();
});
