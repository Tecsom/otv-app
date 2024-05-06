import { fetchData, loadingButton, isoDateToFormatted, isoDateToFormattedWithTime } from '/public/scripts/helpers.js';

const badgeType = {
  pendiente: 'primary',
  proceso: 'secondary',
  embarque: 'info',
  cancelada: 'danger',
  completada: 'success'
};

const flatpickOptions = {
  dateFormat: 'd/m/Y',
  maxDate: 'today',
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
let page = 1;
const limit = 10;
let loadMore = true;
let isLoading = false;
let estatusFilters = ['proceso', 'embarque'];
let search = '';
let timeout_debounce;
let createdAtFilter = null;
let deliveryDateFilter = null;
let filter = 'folio';

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

$('#exit-checker').on('click', async function () {
  $('#modal_quit_checker').modal('show');
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
$('#remove-filters-btn').on('click', function () {
  $('#search-report-filter').val('');

  flatpckr_day.clear();

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

$('#quit-checker-form').on('submit', async function (e) {
  e.preventDefault();
  const button = new loadingButton($('#button_confirm_quit'));
  button.start();

  const password = $('#password').val();

  if (password === '') {
    toastr.error('Por favor, ingrese su contraseña');
    return;
  }

  const res = await fetchData('/settings/quit-checker?password=' + password);

  if (res.status === true) {
    toastr.success('Contraseña correcta');
    localStorage.removeItem('checker');
    window.location.href = '/';

    return;
  }
  button.stop();
  toastr.error('Contraseña incorrecta');
});

$('#oc_btn').on('click', function () {
  loadOrdenes();
  $('#oc_modal').modal('show');
});

$(document).ready(function () {
  new PerfectScrollbar(document.getElementById('ordenes_compra_container'), {
    wheelPropagation: false
  });
});

async function getOrdenes() {
  // page, pageSize, search
  if (!loadMore) return [];
  const createdAtFilterString = createdAtFilter?.join(',') ?? '';
  const deliveryDateFilterString = deliveryDateFilter?.join(',') ?? '';
  console.log({ deliveryDateFilterString, createdAtFilterString, loadMore, page, limit, estatusFilters, search });
  const query = `?page=${page}&pageSize=${limit}&estatusFiltersStr=${estatusFilters.join(',')}&search=${search}&createdAtFilterString=${createdAtFilterString}&deliveryDateFilterString=${deliveryDateFilterString}`;
  isLoading = true;
  const ordenes = await fetchData('/ordenes/paging' + query, 'GET'); //api/ordenes
  console.log({ ordenes });
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

  if (estatusFilters.length === 0) {
    $('#ordenes_compra_container').empty();
    page = 1;
    loadMore = true;

    return;
  }

  const ordenes = await getOrdenes();
  for (let orden of ordenes) {
    orden.verifications = orden?.verifications?.filter(elm => elm.id);
    const uniqueFolio = orden.unique_folio ? addLeadingZeros(orden.unique_folio, 6) : 'Sin Folio';
    console.log({ orden });
    const $newdiv1 = $(`
        <div class="order_container_child card-body border rounded mt-3 cursor-pointer" order_id="${orden.static_order_id}" id="order_${orden.unique_folio}">
          <div class="row g-2">
            <div class="col-md-12">
              <div class="d-flex align-items-center justify-content-between p-2 pb-0">
                <span class="badge bg-label-dark">${uniqueFolio}</span>
                <span class="text-capitalize badge bg-${badgeType[orden.estado]}">${orden.estado}</span>
              </div>
            </div>
            <div class="col-md-12">
              <hr class="m-0" />
            </div>
            <div class="col-md-12">
              <div class="p-2 pb-1 pt-0">
                <p class="mb-0 small"><strong>Cliente: </strong>${orden.clientes?.nombre ?? '<span style="color:Red">Sin cliente relacionado</span>'}</p>
                <p class="mb-0 small"><strong>Folio de cliente: </strong>${orden.folio_id}</p>
                <p class="mb-0 small"><strong>Fecha de entrega: </strong>${isoDateToFormatted(orden.delivery_date)}</p>
                <p class="mb-0 small"><strong>Fecha de creación: </strong>${isoDateToFormatted(orden.created_at)}</p>   
              </div>      
            </div>
          </div>
        </div>
      `);
    $newdiv1.data({ data: orden });

    $container.append($newdiv1);

    const selected = $('#ordenes_compra_container').data('selected');
    console.log({ orden, selected });
    if (selected && parseInt(selected) === orden.id) {
      $newdiv1.trigger('click');
      console.log('click');
    }
  }
}
function addLeadingZeros(number, length) {
  // Convert number to string
  let numStr = String(number);

  // Calculate how many zeros to add
  let zerosToAdd = Math.max(length - numStr.length, 0);

  // Return the number padded with leading zeros
  return '0'.repeat(zerosToAdd) + numStr;
}

$('#ordenes_compra_container').on('click', '.order_container_child', function () {
  location.href = `/verificador/ordenes/${$(this).attr('order_id')}`;
});

$('#tab_folio_btn').on('click', function () {
  if (filter === 'folio') return;
  filter = 'folio';

  page = 1;
  loadMore = true;
  deliveryDateFilter = null;
  $('#ordenes_compra_container').empty();
  loadOrdenes();
});

$('#tab_dia_btn').on('click', function () {
  if (filter === 'dia') return;
  filter = 'dia';

  page = 1;
  loadMore = true;
  flatpckr_day.setDate(new Date(), true);
});

$('#tab_semana_btn').on('click', function () {
  if (filter === 'semana') return;
  filter = 'semana';

  page = 1;
  loadMore = true;
  deliveryDateFilter = null;

  flatpckr_week.setDate(new Date(), true);
});
