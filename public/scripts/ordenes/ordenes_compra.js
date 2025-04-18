//ordenes_table
import { fetchData, loadingButton, isoDateToFormatted, isoDateToFormattedWithTime } from '/public/scripts/helpers.js';

const tableActions = `<div class="d-inline-block text-nowrap">
                    <button class="btn btn-sm btn-icon edit-icon" title="Editar" data-bs-toggle="tooltip" data-bs-placement="top"><i class="ti ti-edit"></i></button>
                    <button class="btn btn-sm btn-icon delete-icon" title="Eliminar" data-bs-toggle="tooltip" data-bs-placement="top"><i class="ti ti-trash-x"></i></button>
                </div>`;

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
let flatpickr_edit;
$('#ordenes_table').DataTable({
  columns: [
    { data: 'numero_parte', title: '# Parte', orderable: true, className: 'non-selectable' },
    { data: 'revision_name', title: 'Revisión', orderable: false, className: 'non-selectable' },
    {
      data: 'type',
      title: 'Tipo',
      orderable: false,
      className: 'non-selectable',
      render: function (data, type, row) {
        if (data == 'bulk') {
          return 'A granel';
        } else {
          return 'Individual';
        }
      }
    },
    //{ data: 'descripcion', title: 'Descripción', orderable: true, className: 'non-selectable' },
    { data: 'currency_costo_produccion', title: 'Costo', orderable: false, className: 'non-selectable' },
    { data: 'quantity', title: 'Cant.', orderable: false, className: 'non-selectable' },
    { data: 'currency_costo_venta', title: 'Precio', orderable: false, className: 'non-selectable' },
    { title: 'Opciones', defaultContent: tableActions, width: '50px', orderable: false }
  ],
  dom: 'rtp',
  language: {
    url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
  },
  order: [[0, 'asc']],
  autoWidth: false
});

let page = 1;
const limit = 10;
let loadMore = true;
let isLoading = false;
let estatusFilters = ['pendiente', 'proceso', 'embarque'];
let search = '';
let timeout_debounce;
let createdAtFilter = null;
let deliveryDateFilter = null;

const flatpckr_created = $('#range_filter').flatpickr({
  onChange: function (selectedDates, dateStr) {
    if (selectedDates.length < 2) return;

    const startDate = new Date(selectedDates[0]).toISOString();
    //end date at the end of the day

    const endDate = new Date(new Date(selectedDates[1]).getTime() + 23 * 60 * 60 * 1000).toISOString();

    createdAtFilter = [startDate, endDate];
    page = 1;
    loadMore = true;
    $('#ordenes_compra_container').empty();
    loadOrdenes();
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
    $('#ordenes_compra_container').empty();
    loadOrdenes();
  },
  ...flatpickOptions
});

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
      return { search: params.term, length: 10, draw: 1, start: params.page || 1, page: params.page || 1 };
    },
    processResults: function (data, params) {
      return {
        results: data.data.map(prod => ({
          id: prod.id,
          text: prod.nombre,
          ...prod
        })),
        pagination: {
          more: data.data.length === 10
        }
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
let date_picker_new;

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
  date_picker_new = $date_picker.flatpickr({
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

const loadProductosEmbarque = async id => {
  const embarques = await fetchData(`/ordenes/embarques/${id}`, 'GET');
  if (!embarques.status) {
    toastr.error('Ocurrió un error al cargar los embarques');
    return;
  }

  console.log(embarques);

  const embarquesData = embarques.data;

  console.log(embarquesData);

  const data_for_table = embarquesData.map(embarque => {
    return {
      contenedor: embarque.contenedor_id.nombre_contenedor,
      producto: embarque.order_products.piezas.numero_parte,
      fecha_embarque: isoDateToFormatted(embarque.created_at),
      codigo: embarque.contenedor_id.codigo,
      codigo_contenedor: `${embarque.contenedor_id.nombre_contenedor} ${embarque.contenedor_id.codigo}`
    };
  });

  embarques_table.clear().draw();

  embarques_table.rows.add(data_for_table).draw();
};

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
  $('#ordenes_compra_container').empty();
  loadOrdenes();
});

$('#search-report-filter').on('input', function () {
  //debounce 1 sec
  if (timeout_debounce) clearTimeout(timeout_debounce);
  timeout_debounce = setTimeout(() => {
    search = $(this).val();
    page = 1;
    loadMore = true;
    $('#ordenes_compra_container').empty();
    loadOrdenes();
    clearTimeout(timeout_debounce);
    timeout_debounce = null;
  }, 1000);
});

$('#create_order').on('submit', async function (e) {
  e.preventDefault();
  const $folio = $('#folio_id');
  const $date = $('#date_picker');
  const $client = $('#select_client');

  const folio = $folio.val().trim();
  const dateval = $date.data().value;
  const client_id = $client.val();
  const usuario_creador = JSON.parse(localStorage.getItem('user_data'))?.name ?? '';

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
    client_id: client_id,
    usuario_creador
  });

  const apiResult = result.data;

  if (!apiResult.status) {
    toastr.error(apiResult.data.details, 'Ocurrió un error');
    return;
  }
  toastr.success('Creado con éxito');
  $folio.val('');
  $date.val('');
  $client.val('').trigger('change');
  date_picker_new.clear();

  $('#create_orden_compra').modal('hide');
  $('#ordenes_compra_container').empty();
  page = 1;
  loadMore = true;

  $('#ordenes_compra_container').data('selected', apiResult.data.id);
  await loadOrdenes();
});

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
  $('#ordenes_compra_container').empty();
  loadOrdenes();
});

async function getOrdenes() {
  // page, pageSize, search
  if (!loadMore) return [];
  const createdAtFilterString = createdAtFilter?.join(',') ?? '';
  const deliveryDateFilterString = deliveryDateFilter?.join(',') ?? '';
  const query = `?page=${page}&pageSize=${limit}&estatusFiltersStr=${estatusFilters.join(',')}&search=${search}&createdAtFilterString=${createdAtFilterString}&deliveryDateFilterString=${deliveryDateFilterString}`;
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

loadOrdenes = async () => {
  const $container = $('#ordenes_compra_container');

  const ordenes = await getOrdenes();
  for (let orden of ordenes) {
    orden.verifications = orden?.verifications?.filter(elm => elm.id);
    const uniqueFolio = orden.unique_folio ? addLeadingZeros(orden.unique_folio, 6) : 'Sin Folio';
    const $newdiv1 = $(`
        <div class="order_container_child card-body border-bottom" order_id="${orden.id}" id="order_${orden.unique_folio}">
          <div class="row g-2">
            <div class="col-md-12">
              <div class="d-flex align-items-center justify-content-between">
                <span class="badge bg-label-dark">${uniqueFolio}</span>
                <span class="text-capitalize badge bg-${badgeType[orden.estado]}">${orden.estado}</span>
              </div>
            </div>
            <div class="col-md-12">
              <hr class="m-0" />
            </div>
            <div class="col-md-12">
              <p class="mb-0 small"><strong>Cliente: </strong>${orden.clientes?.nombre ?? '<span style="color:Red">Sin cliente relacionado</span>'}</p>
              <p class="mb-0 small"><strong>Folio de cliente: </strong>${orden.folio_id}</p>
              <p class="mb-0 small"><strong>Fecha de entrega: </strong>${isoDateToFormatted(orden.delivery_date)}</p>
              <p class="mb-0 small"><strong>Fecha de creación: </strong>${isoDateToFormatted(orden.created_at)}</p>              
            </div>
          </div>
        </div>
      `);
    $newdiv1.data({ data: orden });

    $container.append($newdiv1);

    const selected = $('#ordenes_compra_container').data('selected');
    if (selected && parseInt(selected) === orden.id) {
      $newdiv1.trigger('click');
    }
  }
};

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
let isLoading_child = false;
$('#ordenes_compra_container').on('click', '.order_container_child', async function () {
  if (isLoading_child) return;
  isLoading_child = true;
  $('.order_container_child').css('cursor', 'wait');
  const $order = $(this);
  const data = $order.data().data; //ORDER DATA
  const cliente_id = data?.clientes.id;

  $('#progress-bar-verificaciones').css('width', 0 + '%');
  $('#progress-bar-verificaciones').text('0%');

  $('#ordenes_table')
    .DataTable()
    .column(6)
    .visible(data.estado === 'pendiente');
  if (data.estado === 'pendiente') $('#addProductsButton').removeClass('d-none');
  else $('#addProductsButton').addClass('d-none');

  $('#client_id').text(data.folio_id);
  $('#data-last-update').text(isoDateToFormattedWithTime(data.last_update));
  $('#order_status').text(data.estado);
  $('#order_status').removeClass().addClass(`text-capitalize badge bg-${badgeType[data.estado]}`);

  $('#generate_order').addClass('d-none');
  $('#edit_oc').addClass('d-none');
  $('#delete_oc').addClass('d-none');
  $('#cancelar_oc').addClass('d-none');
  $('#restaurar_oc').addClass('d-none');
  $('#finalizar_oc').addClass('d-none');
  $('#regenerateOrderCodes').addClass('d-none');
  $('#modify_inventory_button').addClass('d-none');
  if (data.estado === 'pendiente') {
    $('#generate_order').removeClass('d-none');
    $('#edit_oc').removeClass('d-none');
    $('#delete_oc').removeClass('d-none');
    $('#modify_inventory_button').removeClass('d-none');
  } else if (data.estado === 'cancelada') {
    $('#restaurar_oc').removeClass('d-none');
  } else if (data.estado === 'embarque') {
    $('#finalizar_oc').removeClass('d-none');
  } else if (data.estado === 'finalizada') {
  } else {
    $('#cancelar_oc').removeClass('d-none');
    $('#finalizar_oc').removeClass('d-none');
    $('#regenerateOrderCodes').removeClass('d-none');
  }
  if (cliente_id) {
    $('#client_currency').text(data.clientes.currency);
    $('#profile-pic').addClass('d-none');
    $('#client_avatar').removeClass('d-none');
    $('#client_avatar').text(data.clientes?.nombre.charAt(0).toUpperCase());

    const profile_pic_res = await fetchData(`/clientes/${cliente_id}/profile-photo`);
    if (profile_pic_res.status === true) {
      $('#profile-pic').attr('src', profile_pic_res.data);
      $('#client_avatar').addClass('d-none');
      $('#profile-pic').removeClass('d-none');
    }
  }

  const code_type = data?.clientes?.code_type ?? '';

  $('#code_type').text(code_type);
  $('#ordenes_table').data(data);
  const $addProductsmodal = $('#addProductModal');
  $addProductsmodal.data(data);
  $('#container-reporte').data(data);

  if (!data.clientes) {
    toastr.warning('Selecciona un nuevo cliente para la orden');
  }
  await loadVerifications(data);
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

  console.log(data.id);

  await loadProductos(data.id);

  await loadFiles(data.id);
  await loadProductosEmbarque(data.id);
  $('#container-no-data').addClass('d-none');
  $('#container-data').removeClass('d-none');

  $('.order_container_child').css('cursor', 'pointer');
  isLoading_child = false;
});

const loadVerifications = async data => {
  const verifications = data.verifications.reduce((acc, verification) => {
    const key = verification.created_at;

    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(verification);
    return acc;
  }, {});
  console.log({ data });
  const dates = Object.keys(verifications).map(date => {
    const dateVerifications = verifications[date];

    let total = 0;
    let totalScanned = 0;
    const userName = dateVerifications?.[0]?.user ?? '-';

    return {
      fecha: isoDateToFormattedWithTime(date),
      total: 1,
      verifications: verifications[date],
      userName
    };
  });

  verificaciones_table.clear().draw();

  console.log({ dates });

  verificaciones_table.rows.add(dates).draw();
};

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
  console.log('entra');
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
    $('#dpz-imgs').append(renderNoData('imágenes'));
  }

  if ($('#dpz-files').children().length === 0) {
    $('#dpz-files').append(renderNoData('archivos'));
  }
  console.log('sale');
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

  //add products to select
  for (const product of products) {
    $products.append(
      $('<option>', {
        value: product.id,
        text: product.numero_parte
      })
    );
  }

  $products.val('');

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
    toastr.error('Verifica que todos los campos estén completos');
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

loadProductos = async id => {
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
      proveedor_id: tableData.clientes.proveedor_id,
      type: product.piezas.type
    };
  });

  let codeProdsTable = [];
  let total_codes = 0;
  for (const product of productos) {
    const codes = product.codes;
    for (const code of codes) {
      total_codes += 1;
      codeProdsTable.push({
        code: code.code,
        numero_parte: product.piezas.numero_parte,
        code_type: tableData.clientes.code_type,
        product: product,
        consecutivo: code.consecutivo
      });
    }
  }

  $('#ordenes_table').DataTable().rows.add(productosTable).draw();
  $('#code_total').text(codeProdsTable.length);
  codigos_table.rows.add(codeProdsTable).draw();

  //calculate progress of verifications
  const order_data = $('#ordenes_table').data();

  console.log({ order_data });
  const staticOrderId = order_data.static_order_id;
  if (!staticOrderId) return;

  const res = await fetchData('/ordenes/estaticas/' + staticOrderId);
  if (!res.status) return;

  const ordenData = res.data;

  let piezas = 0;
  let piezas_verificadas = 0;

  let totalCodes = 0;
  let totalVerifiedCodes = 0;
  for (const producto of ordenData.codigos) {
    const main_prod = ordenData?.productos?.find(prod => prod.codigos.includes(producto.code));
    if (main_prod.type === 'bulk') {
      const quantity = producto.data.reduce((acc, item) => acc + item.quantity, 0);
      const main_quantity = main_prod.quantity;
      totalCodes += main_quantity;
      totalVerifiedCodes += quantity;
      console.log({ quantity });
      if (quantity > 0) {
        const percentaje = quantity / main_quantity;
        piezas_verificadas += percentaje;
      }
      piezas++;
    } else {
      totalCodes += 1;
      if (producto.verified) {
        totalVerifiedCodes += 1;
        piezas_verificadas++;
      }
      piezas++;
    }
  }
  console.log({ piezas, piezas_verificadas });

  const progress = (piezas_verificadas / piezas) * 100;

  //append total products length to verifications table
  const oldData = verificaciones_table.rows().data().toArray();
  const newData = oldData.map(data => {
    console.log('verfication table:', data);
    const totalVerif = data.verifications.reduce((acc, item) => acc + item.quantity, 0);
    console.log({ totalVerif });
    const total_verificaciones = totalVerif + ' de ' + totalCodes;
    return { ...data, total_verificaciones };
  });

  verificaciones_table.clear().draw();
  verificaciones_table.rows.add(newData).draw();

  $('#progress-bar-verificaciones').css('width', progress + '%');
  $('#progress-bar-verificaciones').text(progress.toFixed(2) + '%');
};
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
  const products = $('#ordenes_table').DataTable().rows().data().toArray();

  if (products.length > 0) {
    $('#select_client_edit').prop('disabled', true);
    $('#remove-products-help').removeClass('d-none');
  } else {
    $('#select_client_edit').prop('disabled', false);
    $('#remove-products-help').addClass('d-none');
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
  resetPaging();
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
  resetPaging();
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

  $('#add_product_revision').empty();
  revisiones.forEach(revision => {
    const tableProds = $('#ordenes_table').DataTable().rows().data().toArray();

    if (tableProds.some(prod => prod.revision_id === revision.id)) return;

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
        text: data.numero_parte
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
  await loadProductos(genealData.id);
  $modal.modal('hide');
});

$('#confirm_cancel_order').on('click', async function () {
  const order_data = $('#container-reporte').data();
  const order_id = order_data.id;
  const button = new loadingButton($(this));

  if (!order_id) {
    console.error('No orden de compra seleccionada');
    return;
  }
  button.start();
  const result = await fetchData(`/ordenes/update`, 'PUT', {
    id: order_id,
    estado: 'cancelada'
  });
  button.stop();

  if (!result.status) {
    toastr.error('Ocurrió un error al cancelar la orden de compra');
    return;
  }

  toastr.success('Orden de compra cancelada con éxito');
  $('#cancel_order_modal').modal('hide');
  $('#ordenes_compra_container').empty();
  resetPaging();
  await loadOrdenes();

  $('#generate_order').addClass('d-none');
  $('#edit_oc').addClass('d-none');
  $('#delete_oc').addClass('d-none');
  $('#cancelar_oc').addClass('d-none');
  $('#restaurar_oc').removeClass('d-none');
  $('#regenerateOrderCodes').removeClass('d-none');
  $('#finalizar_oc').addClass('d-none');

  $('#order_status').text('cancelada');
  $('#order_status')
    .removeClass()
    .addClass('text-capitalize badge bg-' + badgeType['cancelada']);

  $('#ordenes_table').DataTable().column(6).visible(false);
});

$('#confirm_restore_order').on('click', async function () {
  const order_data = $('#container-reporte').data();
  const order_id = order_data.id;
  const button = new loadingButton($(this));

  if (!order_id) {
    console.error('No orden de compra seleccionada');
    return;
  }
  button.start();
  const result = await fetchData(`/ordenes/update`, 'PUT', {
    id: order_id,
    estado: 'proceso'
  });
  button.stop();

  if (!result.status) {
    toastr.error('Ocurrió un error al restaurar la orden de compra');
    return;
  }

  toastr.success('Orden de compra restaurada con éxito');
  $('#restore_orden_modal').modal('hide');
  $('#ordenes_compra_container').empty();
  resetPaging();
  await loadOrdenes();

  $('#finalizar_oc').removeClass('d-none');
  $('#cancelar_oc').removeClass('d-none');
  $('#generate_order').addClass('d-none');
  $('#regenerateOrderCodes').removeClass('d-none');
  $('#edit_oc').addClass('d-none');
  $('#delete_oc').addClass('d-none');
  $('#restaurar_oc').addClass('d-none');

  $('#order_status').text('proceso');
  $('#order_status')
    .removeClass()
    .addClass('text-capitalize badge bg-' + badgeType['proceso']);
});

$('#confirmRestoreOrderCodes').on('click', async function () {
  const order_data = $('#container-reporte').data();
  const order_id = order_data.id;
  const button = new loadingButton($(this));

  if (!order_id) {
    console.error('No orden de compra seleccionada');
    return;
  }
  button.start();
  const result = await fetchData(`/ordenes/update-codes`, 'PUT', {
    orderId: order_id
  });
  button.stop();

  if (!result.status) {
    toastr.error('Ocurrió un error al regenerar los códigos de la orden de compra');
    return;
  }

  toastr.success('Códigos regenerados con éxito');

  //trigger click on order to reload data

  resetPaging();
  $('#ordenes_compra_container').empty();
  await loadOrdenes();

  const element_selected = $(`[order_id=${order_data.id}]`);
  element_selected.trigger('click');

  $('#regerateOrderCodesModal').modal('hide');
});

$('#confirm_finalizar_order').on('click', async function () {
  const order_data = $('#container-reporte').data();
  const order_id = order_data.id;
  const button = new loadingButton($(this));

  if (!order_id) {
    console.error('No orden de compra seleccionada');
    return;
  }
  button.start();

  const result = await fetchData(`/ordenes/update`, 'PUT', {
    id: order_id,
    estado: 'finalizada'
  });
  button.stop();

  if (!result.status) {
    toastr.error(result.message);
    return;
  }

  toastr.success('Orden de compra finalizada con éxito');
  $('#finalizar_orden_modal').modal('hide');
  $('#ordenes_compra_container').empty();
  resetPaging();
  await loadOrdenes();

  $('#finalizar_oc').addClass('d-none');
  $('#regenerateOrderCodes').addClass('d-none');
  $('#cancelar_oc').addClass('d-none');
  $('#generate_order').addClass('d-none');
  $('#edit_oc').addClass('d-none');
  $('#delete_oc').addClass('d-none');
  $('#restaurar_oc').addClass('d-none');

  $('#order_status').text('finalizada');
  $('#order_status')
    .removeClass()
    .addClass('text-capitalize badge bg-' + badgeType['finalizada']);
});

resetPaging = () => {
  page = 1;
  loadMore = true;
};
