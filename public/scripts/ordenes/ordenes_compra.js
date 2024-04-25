//ordenes_table
import { fetchData, loadingButton, isoDateToFormatted } from '/public/scripts/helpers.js';

const tableActions = `<div class="d-inline-block text-nowrap">
                    <button class="btn btn-sm btn-icon edit-icon" title="Editar" data-bs-toggle="tooltip" data-bs-placement="top"><i class="ti ti-edit"></i></button>
                    <button class="btn btn-sm btn-icon delete-icon" title="Eliminar" data-bs-toggle="tooltip" data-bs-placement="top"><i class="ti ti-trash-x"></i></button>
                </div>`;

let is_loading = false;
let flatpickr_edit;
$('#ordenes_table').DataTable({
  columns: [
    { data: 'numero_parte', title: '# Parte', orderable: true, className: 'non-selectable' },
    { data: 'revision_name', title: 'Revisión', orderable: false, className: 'non-selectable' },
    //{ data: 'descripcion', title: 'Descripción', orderable: true, className: 'non-selectable' },
    { data: 'currency_costo_produccion', title: 'Costo', orderable: false, className: 'non-selectable' },
    { data: 'quantity', title: 'Cant.', orderable: false, className: 'non-selectable' },
    { data: 'currency_costo_venta', title: 'Precio', orderable: false, className: 'non-selectable' },
    { title: 'Opciones', defaultContent: tableActions, width: '50px' }
  ],
  dom: 'rtp',
  language: {
    url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
  },
  order: [[0, 'asc']]
});

let page = 1;
const limit = 10;
let loadMore = true;
let isLoading = false;

const $clients = $('#select_client').select2({
  language: {
    searching: function () {
      return 'Buscando...';
    }
  },
  placeholder: 'Selecciona un cliente',
  dropdownParent: $('#create_orden_compra'),
  ajax: {
    url: '/api/clientes/paging',
    dataType: 'json',
    delay: 250,
    data: function (params) {
      return {
        search: params.term,
        length: 10,
        draw: 1,
        start: 0
      };
    },
    processResults: function (data) {
      return {
        results: data.data.map(client => {
          return {
            id: client.id,
            text: client.nombre
          };
        })
      };
    },
    cache: true
  }
});

$('#select_client_edit').select2({
  placeholder: 'Selecciona un cliente',
  dropdownParent: $('#edit_orden_compra_modal'),
  ajax: {
    url: '/api/clientes/paging',
    dataType: 'json',
    delay: 250,
    data: function (params) {
      return {
        search: params.term,
        length: 10,
        draw: 1,
        start: 0
      };
    },
    processResults: function (data) {
      return {
        results: data.data.map(client => {
          return {
            id: client.id,
            text: client.nombre
          };
        })
      };
    },
    cache: true
  }
});

$(() => {
  init();
});

async function init() {
  new PerfectScrollbar(document.getElementById('ordenes_compra_container'), {
    wheelPropagation: false
  });

  $('#add_product_revision').select2({
    dropdownParent: $('#addProductModal')
  });

  $('#add_product_select').select2({
    dropdownParent: $('#addProductModal'),
    placeholder: 'Selecciona un producto'
  });

  const $date_picker = $('#date_picker');
  $date_picker.flatpickr({
    // EN ESTA PARTE ES DONDE SE REGISTRA EL EVENTO
    onChange: function (selectedDates, dateStr, instance) {
      $date_picker.data({ value: selectedDates[0] });
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
  flatpickr_edit = $('#date_picker_edit').flatpickr({
    // EN ESTA PARTE ES DONDE SE REGISTRA EL EVENTO
    onChange: function (selectedDates, dateStr, instance) {
      $('#date_picker_edit').data({ value: selectedDates[0] });
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
}

$('#create_order').on('submit', async function (e) {
  e.preventDefault();
  const $folio = $('#folio_id');
  const $date = $('#date_picker');
  const $client = $('#select_client');

  const folio = $folio.val().trim();
  const dateval = $date.data().value;
  const client_id = $client.val();

  if (!client_id || !dateval || !folio) {
    toastr.error('Completa los campos para crear orden', 'Formulario incompleto');
    return;
  }

  const date = new Date(dateval);
  date.setUTCHours(date.getUTCHours() - 6);
  const isoStringDate = date.toISOString();

  const result = await fetchData('/ordenes/create', 'POST', {
    folio_id: folio,
    delivery_date: isoStringDate,
    client_id: client_id
  });

  const apiResult = result.data;

  if (!apiResult.status) {
    toastr.error(apiResult.data.details, 'Ocurrió un error');
    return;
  }
  toastr.success('Creado con éxito');
  $folio.val('');
  $date.val('');
  $client.val('');
  $('#create_orden_compra').modal('hide');
  $('#ordenes_compra_container').empty();
  page = 1;
  loadMore = true;
  await loadOrdenes();
});

async function getOrdenes() {
  // page, pageSize, search
  if (!loadMore) return [];
  const query = `?page=${page}&pageSize=${limit}`;
  isLoading = true;
  const ordenes = await fetchData('/ordenes/paging' + query, 'GET'); //api/ordenes
  isLoading = false;

  if (!ordenes.status) {
    toastr.error('Ocurrió un error al obtener ordenes');
    return;
  }

  if (ordenes.data.length < limit) {
    loadMore = false;
  }

  page = page + 1;
  return ordenes.data;
}

async function loadOrdenes() {
  const $container = $('#ordenes_compra_container');

  const ordenes = await getOrdenes();
  for (const orden of ordenes) {
    const uniqueFolio = orden.unique_folio ? addLeadingZeros(orden.unique_folio, 6) : 'Sin Folio';
    const $newdiv1 = $(`
        <div class="order_container_child card-body border-bottom" order_id="${orden.id}" id="order_${orden.unique_folio}">
          <div class="row g-2">
            <div class="col-md-12">
              <div class="d-flex align-items-center justify-content-between">
                <span class="badge bg-label-dark">${uniqueFolio}</span>
                <div class="d-flex align-items-center gap-1 text-muted">
                  <i class="ti ti-calendar-event ti-xs me-1"></i>
                  <small>${isoDateToFormatted(orden.created_at)}</small>
                </div>
              </div>
            </div>
            <div class="col-md-12">
              <hr class="m-0" />
            </div>
            <div class="col-md-12">
              <p class="mb-0 small"><strong>Cliente: </strong>${orden.clientes?.nombre ?? '<span style="color:Red">Sin cliente relacionado</span>'}</p>
              <p class="mb-0 small"><strong>Folio de cliente: </strong>${orden.folio_id}</p>
              <p class="mb-0 small"><strong>Fecha de entrega: </strong>${isoDateToFormatted(orden.delivery_date)}</p>
              <p class="mb-0 small"><strong>Estado: </strong>[En proceso, pendiente, entregada]</p>              
            </div>
          </div>
        </div>
      `);
    $newdiv1.data({ data: orden });

    $container.append($newdiv1);
  }
}

loadOrdenes();

$('#ordenes_compra_container').on('scroll', async function () {
  const hasBottomReached = checkIfHasBottomReached(this);

  if (hasBottomReached && loadMore && !isLoading) await loadOrdenes();
});

const checkIfHasBottomReached = el => {
  const offset = 10;
  if (el === null) return false;

  const dif = el.scrollHeight - el.scrollTop;

  return dif <= el.clientHeight + offset;
};

function addLeadingZeros(number, length) {
  // Convert number to string
  let numStr = String(number);

  // Calculate how many zeros to add
  let zerosToAdd = Math.max(length - numStr.length, 0);

  // Return the number padded with leading zeros
  return '0'.repeat(zerosToAdd) + numStr;
}

//añadir, eliminar, editar productos en las ordenes de compras

$('#ordenes_compra_container').on('click', '.order_container_child', async function () {
  const $order = $(this);
  const data = $order.data().data; //ORDER DATA

  $('#ordenes_table').data(data);
  const $addProductsmodal = $('#addProductModal');
  $addProductsmodal.data(data);
  $('#container-reporte').data(data);

  if (!data.clientes) {
    toastr.warning('Selecciona un nuevo cliente para la orden');
  }

  const $folio = $('#data-folio');
  const $fechaCreacion = $('#data-fecha-creación');
  const $fechaEntrega = $('#data-fecha-entrega');
  const $clientData = $('#data-client-data');
  const uniqueFolio = data.unique_folio ? addLeadingZeros(data.unique_folio, 6) : 'Sin Folio';

  $folio.text(uniqueFolio);
  $fechaEntrega.text(isoDateToFormatted(data.delivery_date));
  $clientData.text(data.clientes?.nombre ?? 'Sin cliente relacionado');
  $fechaCreacion.text(isoDateToFormatted(data.created_at));
  $('#ordenes_compra_container .order_container_child').removeClass('bg-label-primary');
  $(this).addClass('bg-label-primary');

  loadProductos(data.id);
  loadFiles(data.id);
  $('#container-no-data').addClass('d-none');
  $('#container-data').removeClass('d-none');
});

const renderListItem = (name, url) => {
  return `<a ${url && 'signed-url=' + url} href="javascript:void(0);" class="list-group-item list-group-item-action">${name}</a>`;
};

const renderListFile = (name, url, filename) => {
  return `

    <a href="javascript:void(0);"  class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
      ${name} 
      <button style="box-shadow: none;" signed-url=${url} file-name=${filename} type="button" class="btn btn-icon download-file">
        <span class="ti ti-download"></span>
      </button>
    </a>
  `;
};

const renderNoData = type => {
  return `<div class="d-flex justify-content-center align-items-center" style="height: 100%;">
  <h6 class="text-muted">Sin ${type}</h4>
</div>`;
};

loadFiles = async (id, no_reload = false) => {
  if (isLoading === true) return;
  $('#dpz-imgs').empty();
  $('#dpz-files').empty();

  isLoading = true;
  const files = await fetchData(`/ordenes/${id}/files`, 'GET');
  isLoading = false;

  if (!files.status) {
    toastr.error('Ocurrió un error al cargar los archivos');
    return;
  }
  if (no_reload === false) dropzoneFiles.removeAllFiles();

  for (const archivo of files.data) {
    const type = archivo.type;
    const blob = await fetch(archivo.data).then(res => res.blob());
    const file = new File([blob], archivo.name, { type, isUploaded: true });

    if (type.includes('image')) {
      $('#dpz-imgs').append(renderListItem(archivo.name, archivo.data));
    } else {
      $('#dpz-files').append(renderListFile(archivo.name, archivo.data, archivo.name));
    }

    if (no_reload === false) dropzoneFiles.addFile(file);
  }

  if ($('#dpz-imgs').children().length === 0) {
    $('#dpz-imgs').append(renderNoData('imagenes'));
  }

  if ($('#dpz-files').children().length === 0) {
    $('#dpz-files').append(renderNoData('archivos'));
  }
};

$('#dpz-imgs').on('click', '.list-group-item', function () {
  const url = $(this).attr('signed-url');
  const lightbox = new FsLightbox();
  lightbox.props.sources = [url];
  lightbox.open();
});

$('#dpz-files').on('click', '.download-file', async function () {
  const url = $(this).attr('signed-url');
  const filename = $(this).attr('file-name');

  const response = await fetch(url);

  const blob = await response.blob();

  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = filename;
  link.click();
});

function pushUrl(paramName, paramValue) {
  var currentUrl = window.location.href;
  var baseUrl = currentUrl.split('?')[0];
  var newUrl = baseUrl + '?' + paramName + '=' + paramValue;
  window.history.pushState({ path: newUrl }, '', newUrl);
}

$('#addProductsButton').on('click', async function () {
  const $addProducts = $('#addProductModal');
  const modalData = $addProducts.data();
  const $products = $('#add_product_select');
  const $revision = $('#add_product_revision');
  const $quantity = $('#add_product_quantity');

  $products.empty();
  $revision.empty();
  $quantity.val('1');

  if (!modalData.clientes) {
    toastr.warning('Asigna un cliente a la orden para añadir productos');
    return;
  }

  const clientId = modalData.clientes.id;

  const resultProducts = await fetchData(`/clientes/${clientId}/piezas`);
  if (!resultProducts.status) {
    toastr.error('Ocurrió un error al cargar piezas');
  }
  const products = resultProducts.data;

  if (products.length === 0) {
    toastr.warning('Es necesario añadir piezas y/o productos al cliente para poder continuar', 'Cliente sin piezas');
    return;
  }

  products.forEach(product => {
    const matchingRow = $('#ordenes_table')
      .DataTable()
      .rows()
      .data()
      .filter(function (value, index) {
        return value[0] === product.pieza_id;
      });

    // Verifica si matchingRow no es undefined y también si su longitud es cero
    if (!matchingRow || matchingRow.length === 0) {
      $products.append(
        $('<option>', {
          value: product.id,
          text: product.descripcion
        })
      );
    }
  });

  $products.val('');

  // const revisiones = revisionesResponse.data; //Array de revisiones
  // const lastRevision = getLastCreated(revisiones);

  // revisiones.forEach(revision => {
  //   $revision.append(
  //     $('<option>', {
  //       value: revision.id,
  //       text: revision.nombre
  //     })
  //   );
  // });

  // $revision.val(lastRevision.id);
  $addProducts.modal('show');
});

$('#addProduct').on('submit', async function (e) {
  e.preventDefault();
  const confirmButton = $('#confirm_add_product');
  const $addProductsmodal = $('#addProductModal');
  const $revision = $('#add_product_revision');
  const order_id = $addProductsmodal.data().id;

  const $product = $('#add_product_select');
  const $quantity = $('#add_product_quantity');

  if (!$quantity.val() || !$product.val() || !$revision.val()) {
    toastr.error('Añade un producto y su cantidad');
    return;
  }

  const productAdd = {
    order_id: order_id,
    pieza_id: $product.val(),
    quantity: $quantity.val(),
    revision: $revision.val()
  };
  const result = await fetchData('/ordernes/addproduct', 'POST', productAdd);

  if (!result.status) {
    toastr.error('ocurrió un error al agregar cliente');
    return;
  }
  await loadProductos(order_id);
  $('#addProductModal').modal('hide');
});

async function loadProductos(id) {
  $('#ordenes_table').DataTable().clear();
  $('#ordenes_table').DataTable().draw();
  codigos_table.clear().draw();

  const productsResult = await fetchData(`/ordenes/${id}/productos`);
  const productos = productsResult.data;

  if (productos.length == 0) {
    return;
  }

  const tableData = $('#ordenes_table').data();

  const productosTable = productos.map(product => {
    return {
      id: product.id,
      quantity: product.quantity,
      costo_produccion: product.piezas.costo_produccion,
      costo_venta: product.piezas.costo_venta,
      descripcion: product.piezas.descripcion,
      estado: product.piezas.estado,
      pieza_id: product.piezas.id,
      numero_parte: product.piezas.numero_parte,
      revision_name: product.revisiones.nombre,
      revision_id: product.revisiones.id,
      revision_description: product.revisiones.descripcion,
      currency_costo_produccion: formatCurrency(product.piezas.costo_produccion),
      currency_costo_venta: formatCurrency(product.piezas.costo_venta),
      order_id: id,
      client_id: tableData.clientes.id,
      client_name: tableData.clientes.nombre,
      piezas: product.piezas,
      revisiones: product.revisiones,
      proveedor_id: tableData.clientes.proveedor_id
    };
  });

  $('#ordenes_table').DataTable().rows.add(productosTable).draw();
  codigos_table.rows.add(productosTable).draw();
}

function getLastCreated(array) {
  if (array.length === 0) {
    return null;
  }

  let lastCreated = array[0];

  for (let i = 1; i < array.length; i++) {
    const fechaActual = new Date(array[i].created_at);
    const fechaUltimo = new Date(lastCreated.created_at);

    if (fechaActual > fechaUltimo) {
      lastCreated = array[i];
    }
  }

  return lastCreated;
}

$('#edit_oc').on('click', async function () {
  const order_data = $('#container-reporte').data();
  const $editOrder = $('#edit_orden_compra_modal');
  const $folio = $('#folio_id_edit');
  const $date = $('#date_picker_edit');
  const $client = $('#select_client_edit');

  if (!order_data?.id) {
    console.error('No orden de compra seleccionada');
    return;
  }

  $folio.val(order_data.folio_id);
  // +6 hours
  const timestamp = new Date(order_data.delivery_date).getTime() + 6 * 60 * 60 * 1000;

  flatpickr_edit.setDate(new Date(timestamp));

  $client.select2('trigger', 'select', {
    data: { id: order_data?.clientes?.id, text: order_data?.clientes?.nombre }
  });

  $editOrder.modal('show');
});

$('#edit_order_form').on('submit', async function (e) {
  e.preventDefault();
  const order_data = $('#container-reporte').data();
  const $folio = $('#folio_id_edit');
  const $date = $('#date_picker_edit');
  const $client = $('#select_client_edit');

  const folio = $folio.val().trim();

  const dateval = flatpickr_edit.selectedDates[0];
  const client_id = $client.val();

  if (!client_id || !dateval || !folio) {
    toastr.error('Completa los campos para crear orden', 'Formulario incompleto');
    return;
  }

  const date = new Date(dateval);
  date.setUTCHours(date.getUTCHours() - 6);
  const isoStringDate = date.toISOString();

  const result = await fetchData(`/ordenes/update`, 'PUT', {
    folio_id: folio,
    delivery_date: isoStringDate,
    client_id: client_id,
    id: order_data.id
  });

  const apiResult = result.data;

  if (!apiResult.status) {
    toastr.error(apiResult.data.details, 'Ocurrió un error');
    return;
  }
  toastr.success('Editado con éxito');
  $folio.val('');
  $date.val('');
  $client.val('');
  $('#edit_orden_compra_modal').modal('hide');
  page = 1;
  loadMore = true;
  $('#ordenes_compra_container').empty();
  await loadOrdenes();
  const element_selected = $(`[order_id=${order_data.id}]`);
  element_selected.trigger('click');
});

$('#delete_oc').on('click', async function () {
  const order_data = $('#container-reporte').data();
  const order_id = order_data.id;

  if (!order_id) {
    console.error('No orden de compra seleccionada');
    return;
  }

  $('#delete_orden_compra_modal').modal('show');
});

$('#confirm_delete_order').on('click', async function () {
  const order_data = $('#container-reporte').data();
  const order_id = order_data.id;

  if (!order_id) {
    console.error('No orden de compra seleccionada');
    return;
  }

  const result = await fetchData(`/ordenes/${order_id}/delete`, 'DELETE');

  if (!result.status) {
    toastr.error('Ocurrió un error al eliminar la orden de compra');
    return;
  }

  toastr.success('Orden de compra eliminada con éxito');
  $('#delete_orden_compra_modal').modal('hide');
  $('#ordenes_compra_container').empty();
  page = 1;
  loadMore = true;
  await loadOrdenes();
});

$('#add_product_select').on('change', async function () {
  const $addProducts = $('#addProductModal');
  const modalData = $addProducts.data();
  const clientId = modalData.clientes.id;
  const value = $(this).val();

  const revisionesResponse = await fetchData(`/clientes/${clientId}/piezas/${value}/revisiones`);

  if (!revisionesResponse.status) {
    toastr.error('Ocurrio un error al recuperar revisiones');
    return;
  }

  const revisiones = revisionesResponse.data;
  const lastRevision = getLastCreated(revisiones);

  revisiones.forEach(revision => {
    $('#add_product_revision').append(
      $('<option>', {
        value: revision.id,
        text: revision.nombre
      })
    );
  });

  $('#add_product_revision').val(lastRevision.id);
});

function formatCurrency(amount) {
  const currencyCode = 'MXN';
  const locale = 'es-MX';

  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode
  });

  return formatter.format(amount);
}

// Ejemplo de uso

$('#ordenes_table').on('click', 'tbody tr button', async function (e) {
  const buttonClicked = $(this); // Obtener el botón que ha sido clicado
  const row = buttonClicked.closest('tr'); // Encontrar la fila asociada al botón clicado
  const data = $('#ordenes_table').DataTable().row(row).data(); // Obtener los datos de la fila

  if (buttonClicked.hasClass('edit-icon')) {
    $('#edit_product_select').append(
      $('<option>', {
        value: data.pieza_id,
        text: data.descripcion
      })
    );
    $('#edit_product_select').val(data.pieza_id);
    $('#edit_product_select').trigger('change');

    $('#edit_product_quantity').val(data.quantity);

    const revisionesResponse = await fetchData(`/clientes/${data.client_id}/piezas/${data.pieza_id}/revisiones`);

    if (!revisionesResponse.status) {
      toastr.error('Ocurrio un error al recuperar revisiones');
      return;
    }

    const revisiones = revisionesResponse.data;

    $('#edit_product_revision').empty();

    revisiones.forEach(revision => {
      $('#edit_product_revision').append(
        $('<option>', {
          value: revision.id,
          text: revision.nombre
        })
      );
    });

    $('#edit_product_revision').val(data.revision_id);
    const $modal = $('#editProductModal');
    $modal.data({ id: data.id }); // id del row
    $modal.modal('show');
  } else if (buttonClicked.hasClass('delete-icon')) {
    const deleteRes = await fetchData(`/ordenes/producto/delete/${data.id}`, 'DELETE');
    if (!deleteRes.status) {
      toastr.error('Ocurrió un error al eliminar producto de la orden');
      return;
    }
    await loadProductos(data.order_id);
  }
});

$('#editProduct').on('submit', async function (e) {
  e.preventDefault();
  const $modal = $('#editProductModal');
  const productOrderId = $modal.data().id; // id del row
  console.log({ productOrderId });

  const $revision = $('#edit_product_revision');
  const $cantidad = $('#edit_product_quantity');

  if (!$revision.val() || !$cantidad.val()) {
    toastr.error('Ocurrio un error editando el producto');
    return;
  }

  const payload = {
    id: productOrderId,
    revision: $revision.val(),
    cantidad: $cantidad.val()
  };

  const deleteRes = await fetchData(`/ordenes/producto/edit/`, 'PUT', payload);
  if (!deleteRes.status) {
    toastr.error('Ocurrió un error al eliminar producto de la orden');
    return;
  }

  const genealData = $('#ordenes_table').data();
  console.log({ genealData });
  await loadProductos(genealData.id);
  $modal.modal('hide');
});
