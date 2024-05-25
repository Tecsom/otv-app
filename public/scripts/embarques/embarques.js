import { fetchData, isoDateToFormatted } from '../helpers.js';

$(() => {
  init();
});

async function init() {
  new PerfectScrollbar(document.getElementById('embarques_container'), {
    wheelPropagation: false
  });

  $('#productos_table').DataTable({
    data: [], // Empty data
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
      url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
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
  $embarque.addClass('active-container').siblings().removeClass('active-container');

  loadProducts(data);

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

// SECCIÓN EN LA QUE SE ABRE MODAL PARA SELECCIONAR ORDENES Y CARGADO DE ORDENES A <select></select>
$('#addProductsButton').on('click', async function () {
  $('#addProductsModal').modal('show');

  const ordenes = await fetchData('/embarques/ordenes', 'GET', {});

  if (ordenes.status == false) {
    toastr.error('Error al obtener las ordenes');
    return;
  }

  $('#add_product_select').empty();

  $('#add_product_select').append('<option value=""></option>');

  ordenes.data.forEach(function (item) {
    const option = $(`<option value="${item.id}">Folio unico: ${item.codigo} </option>`);
    option.data('productos', item.order_id.productos || item.productos);
    $('#add_product_select').append(option);
  });

  $('#add_product_select').trigger('change');
});
// FIN DE LA SECCIÓN DE MODAL PARA SELECCIONAR ORDENES

// SECCIÓN DE MODAL PARA AGREGAR Y RECUPERAR LOS DATOS DE LAS ORDENES
$('#add_product_select').on('change', function () {
  const selectedOption = $(this).find('option:selected');
  const data = selectedOption.data('productos');

  console.log('DATA', data);

  if (!data) {
    $('#confirm_add_products').prop('disabled', true);
  } else {
    $('#confirm_add_products').prop('disabled', false);
  }

  if (!data || !Array.isArray(data)) {
    return;
  }

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
      url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
    },
    order: [[0, 'asc']],
    searching: false,
    info: false,
    destroy: true
  });

  $('#productos_table thead, tbody').off('change');

  $('#productos_table thead, tbody').on('change', 'input[type="checkbox"]', function () {
    const dataCheck = $('#productos_table').DataTable().rows({ selected: true }).data().toArray();
  });
});
// FIN DE LA SECCIÓN DE RECUPARA LOS DATOS DE LAS ORDENES

// INSERTAR DATOS A LA TABLA DE EMBARQUES_PRODUCTS
$('#confirm_add_products').on('click', async function () {
  const data = $('#container-reporte').data();

  console.log(data);

  const selectedProducts = $('#productos_table').DataTable().rows({ selected: true }).data().toArray();

  console.log('SELECTED PRODUCTS', selectedProducts);

  if (selectedProducts.length == 0) {
    toastr.error('Selecciona al menos un producto');
    return;
  }

  for (let product of selectedProducts) {
    const result = await fetchData('/embarques/productos', 'POST', {
      embarque_id: data.id,
      producto_id: product.id,
      cantidad: product.quantity,
      estado: true,
      order_id: product.order_id
    });

    console.log(result);
  }

  loadProducts(data);

  toastr.success('Productos agregados con éxito');
  $('#addProductsModal').modal('hide');
});

//METODO PARA CARGAR LA TABLA DE PRODUCTOS EN EL APARTADO DE CONTENEDORES
const loadProducts = async data => {
  const result = await fetchData('/embarques/' + data.id + '/productos/', 'GET', {});

  console.log(result);

  if (result.status == false) {
    toastr.error('Error al obtener los productos');
    return;
  }

  const productos = result.data.map(producto => {
    return {
      id: producto.id,
      producto_id: producto.producto_id,
      cantidad: producto.cantidad,
      estado: producto.order_products.piezas.cliente_id.estado,
      cliente: producto.order_products.piezas.cliente_id.nombre || '',
      opciones: `
      <div class="d-inline-block text-nowrap">
        <button class="btn btn-sm btn-icon delete-icon eliminar-producto" title="Eliminar" data-bs-toggle="tooltip" data-bs-placement="top"><i class="ti ti-trash-x"></i></button>
      </div>`
    };
  });

  $('#embarque-product-table').DataTable({
    data: productos,
    paging: true,
    searching: false,
    lengthChange: false,
    columns: [
      { data: 'id', title: 'ID' },
      { data: 'cliente', title: 'Cliente' },
      { data: 'producto_id', title: 'Producto ID' },
      { data: 'cantidad', title: 'Cantidad' },
      { data: 'estado', title: 'Estado' },
      { data: 'opciones', title: 'Opciones' }
    ],
    info: false,
    language: {
      url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
    },
    pageLength: 5,
    ordering: false,
    select: false,
    destroy: true,
    autoWidth: true
  });
};

$('#addProductsModal').on('hidden.bs.modal', function () {
  let table = $('#productos_table').DataTable();
  table.clear().draw();
  table.destroy();
});
