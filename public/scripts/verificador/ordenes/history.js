import { fetchData, isoDateToFormatted } from '/public/scripts/helpers.js';

const badgeType = {
  pendiente: 'primary',
  proceso: 'secondary',
  embarque: 'info',
  cancelada: 'danger',
  finalizada: 'success'
};

loadOrdenes = async () => {
  console.log('LOADD');
  const $container = $('#ordenes_compra_container');

  const ordenes = await getOrdenes();
  for (let orden of ordenes) {
    orden.verifications = orden?.verifications?.filter(elm => elm.id);
    const uniqueFolio = orden.unique_folio ? orden.unique_folio?.toString().padStart(6, '0') : 'Sin Folio';
    const $newdiv1 = $(`
        <div class="order_container_child card-body border-bottom cursor-pointer" order_id="${orden.static_order_id}" id="order_${orden.static_order_id}">
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
    console.log({ orden, selected });
    if (selected && parseInt(selected) === orden.id) {
      $newdiv1.trigger('click');
      console.log('click');
    }
  }
};

async function getOrdenes() {
  // page, pageSize, search
  if (!loadMore) return [];
  console.log('searchhh');
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

$(document).ready(async function () {
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

$('#ordenes_compra_container').on('click', '.order_container_child', async function () {
  $('#cancel_verification_modal').modal('hide');
  $('#save_verification_btn').addClass('d-none');
  $('#cancel_verificacion_btn').addClass('d-none');
  $('#startVerificacion').removeClass('d-none');
  $('#select_verificaciones ~ span').removeClass('d-none');
  verification_mode = false;

  const $this = $(this);
  const { static_order_id } = $this.data('data') ?? {};

  const res = await fetchData('/ordenes/estaticas/' + static_order_id);
  if (!res.status) return toastr.error('Ocurrió un error al obtener la orden');

  ordenData = res.data;

  $('#ordenes_compra_container').data('selected', static_order_id);

  $('.order_container_child').removeClass('selected');
  $this.addClass('selected');

  $('#oc_modal').modal('show');
  loadOrderData();
  loadVerificaciones();
  $('#container-buttons-verification').removeClass('d-none');
});