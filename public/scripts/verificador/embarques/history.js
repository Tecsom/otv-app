import { fetchData, isoDateToFormatted, loadingButton } from '/public/scripts/helpers.js';
const badgeType = {
  proceso: 'secondary',
  pendiente: 'primary',
  embarque: 'info',
  cancelada: 'danger',
  finalizada: 'success'
};

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

loadEmbarques = async () => {
  const $container = $('#embarques_container');

  const embarques = await getEmbarques();

  for (let embarque of embarques) {
    const uniqueFolio = addLeadingZeros(embarque.folio_unico, 6);

    const $newdiv1 = $(`
    <div class="embarque_container_child card-body border-bottom cursor-pointer" embarque_id="${embarque.id}" id="order_${uniqueFolio}" folio="${embarque.id}">
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

    const selected = $('#embarques_container').data('selected');

    if (selected && parseInt(selected) === orden.id) {
      $newdiv1.trigger('click');
    }
  }
};

$(document).ready(async function () {
  loadEmbarques();
});

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
function addLeadingZeros(number, length) {
  // Convert number to string
  let numStr = String(number);

  // Calculate how many zeros to add
  let zerosToAdd = Math.max(length - numStr.length, 0);

  // Return the number padded with leading zeros
  return '0'.repeat(zerosToAdd) + numStr;
}

$('#exit-checker').on('click', async function () {
  $('#modal_quit_checker').modal('show');
});

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

$('#remove-filters-btn').on('click', function () {
  console.log('entra');
  $('#search-report-filter').val('');

  flatpckr_day.clear();
  flatpicker_created.clear();
  flatpckr_week.clear();

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
  loadEmbarques();
});
