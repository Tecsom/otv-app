//ordenes_table
import { fetchData, loadingButton } from '/public/scripts/helpers.js';

let page = 1;
const limit = 10;
let loadMore = true;

$(() => {
  init();
});

async function init() {
  new PerfectScrollbar(document.getElementById('ordenes_compra_container'), {
    wheelPropagation: false
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

  const $clients = $('#select_client');
  const clientes = await getClientes();

  clientes.forEach(cliente => {
    $clients.append(
      $('<option>', {
        value: cliente.id,
        text: cliente.nombre
      })
    );
  });
}

async function getClientes() {
  const clientes = await fetchData('/clientes', 'GET');
  if (!clientes.status) {
    console.log('No se encontraron clientes');
    return [];
  }

  return clientes.data;
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
  await loadOrdenes();
});

async function getOrdenes() {
  // page, pageSize, search
  if (!loadMore) return [];
  const query = `?page=${page}&pageSize=${limit}`;
  const ordenes = await fetchData('/ordenes/paging' + query, 'GET'); //api/ordenes

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
  $container.empty();
  const ordenes = await getOrdenes();
  for (const orden of ordenes) {
    const uniqueFolio = orden.unique_folio ? addLeadingZeros(orden.unique_folio, 6) : 'Sin Folio';
    const $newdiv1 = $(`
        <div class="order_container_child card-body border-bottom" id="order_${orden.unique_folio}">
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
              <p class="mb-0"><strong>Cliente: </strong>${orden.clientes?.nombre ?? '<span style="color:Red">Sin cliente relacionado</span>'}</p>
              <p class="mb-0"><strong>Folio de cliente: </strong>${orden.folio_id}</p>
              <p class="mb-0"><strong>Fecha de entrega: </strong>${isoDateToFormatted(orden.delivery_date)}</p>       
            </div>
          </div>
        </div>
      `);
    $newdiv1.data({ data: orden });

    $container.append($newdiv1);
  }
}

loadOrdenes();

function addLeadingZeros(number, length) {
  // Convert number to string
  let numStr = String(number);

  // Calculate how many zeros to add
  let zerosToAdd = Math.max(length - numStr.length, 0);

  // Return the number padded with leading zeros
  return '0'.repeat(zerosToAdd) + numStr;
}

function isoDateToFormatted(fechaISO) {
  // Crear un objeto Date usando la cadena de fecha ISO 8601
  const fecha = new Date(fechaISO);

  // Extraer día, mes y año
  const dia = fecha.getUTCDate(); // Obtener día (en formato de 1 a 31)
  const mes = fecha.getUTCMonth() + 1; // Obtener mes (en formato de 0 a 11, por eso se suma 1)
  const anio = fecha.getUTCFullYear(); // Obtener año

  // Formatear la fecha como dd/mm/yyyy
  const fechaFormateada = `${dia.toString().padStart(2, '0')}/${mes.toString().padStart(2, '0')}/${anio}`;

  return fechaFormateada;
}

//añadir, eliminar, editar productos en las ordenes de compras

$('#ordenes_compra_container').on('click', '.order_container_child', function () {
  const $order = $(this);
  const data = $order.data().data;
  const $addProductsmodal = $('#addProductModal');
  $addProductsmodal.data(data);

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
  const $productsSelect = $('#add_product_select');
  if (!modalData.clientes) {
    toastr.warning('Asigna un cliente a la orden para añadir productos');
    return;
  }
  const resultProducts = await fetchData(`/clientes/${modalData.clientes.id}/piezas`);
  if (!resultProducts.status) {
    toastr.error('Ocurrió un error al cargar piezas');
  }
  const products = resultProducts.data;

  if (products.length === 0) {
    toastr.warning('Es necesario añadir piezas y/o productos al cliente para poder continuar', 'Cliente sin piezas');
    return;
  }

  console.log({ products });

  products.forEach(product => {
    $productsSelect.append(
      $('<option>', {
        value: product.id,
        text: product.descripcion
      })
    );
  });

  $addProducts.modal('show');
});

$('#addProduct').on('submit', async function (e) {
  e.preventDefault()
  const confirmButton = $('#confirm_add_product');
  const $addProductsmodal = $('#addProductModal');
  const order_id = $addProductsmodal.data().id

  const $product = $('#add_product_select');
  const $quantity = $('#add_product_quantity');

  if (!$quantity.val() || !$product.val()) {
    toastr.error('Añade un producto y su cantidad');
    return;
  }

  const productAdd = {
    order_id:order_id,
    pieza_id: $product.val(),
    quantity: $quantity.val()
  }
  const result = await fetchData('/ordernes/addproduct', 'POST', productAdd);
  console.log({ result });
});
