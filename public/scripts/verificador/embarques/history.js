import { fetchData, isoDateToFormatted, loadingButton } from '/public/scripts/helpers.js';
const badgeType = {
  proceso: 'secondary',
  pendiente: 'primary',
  embarque: 'info',
  cancelada: 'danger',
  finalizada: 'success'
};

var estadosMarcados = {
  proceso: true,
  cancelada: false,
  pendiente: true,
  embarque: true,
  finalizada: false
};

var estadoOrden = {
  proceso: 1,
  pendiente: 2,
  embarque: 3,
  cancelada: 4,
  finalizada: 5
};

async function loadEmbarques() {
  const $container = $('#embarques_container');

  const embarques = await fetchData('/embarques', 'GET', {});

  embarques.data.sort((a, b) => estadoOrden[a.estado] - estadoOrden[b.estado]);

  console.log(embarques.data);

  for (let embarque of embarques.data) {
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
            </div>      
          </div>
        </div>
      </div>
    `);
    $newdiv1.data({ data: embarque });
    $container.append($newdiv1);

    const selected = $('#ordenes_compra_container').data('selected');

    if (selected && parseInt(selected) === orden.id) {
      $newdiv1.trigger('click');
    }
  }
}

//async function getOrdenes() {
//  // page, pageSize, search
//  if (!loadMore) return [];
//
//  const createdAtFilterString = createdAtFilter?.join(',') ?? '';
//  const deliveryDateFilterString = deliveryDateFilter?.join(',') ?? '';
//  const query = `?page=${page}&pageSize=${limit}&estatusFiltersStr=${estatusFilters.join(',')}&search=${search}&createdAtFilterString=${createdAtFilterString}&deliveryDateFilterString=${deliveryDateFilterString}`;
//  isLoading = true;
//  const ordenes = await fetchData('/ordenes/paging' + query, 'GET'); //api/ordenes
//  isLoading = false;
//
//  if (!ordenes.status) {
//    toastr.error('Ocurrió un error al obtener ordenes');
//    return;
//  }
//
//  if (ordenes.data.length < limit) {
//    loadMore = false;
//  }
//
//  page = page + 1;
//  return ordenes.data;
//}

$(document).ready(async function () {
  loadEmbarques();
});

//$('#ordenes_compra_container').on('scroll', async function () {
//  const hasBottomReached = checkIfHasBottomReached(this);
//
//  if (hasBottomReached && loadMore && !isLoading) await loadOrdenes();
//});

//const checkIfHasBottomReached = el => {
//  const offset = 10;
//  if (el === null) return false;
//
//  const dif = el.scrollHeight - el.scrollTop;
//
//  return dif <= el.clientHeight + offset;
//};

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
$('#check_proceso').on('change', function () {
  estadosMarcados['proceso'] = this.checked;
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
