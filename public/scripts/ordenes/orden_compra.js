import { fetchData, loadingButton } from '/public/scripts/helpers.js';

$('#generate_order').on('click', async function () {
  const table_data = $('#ordenes_table').data();
  if (table_data.estado === 'entregada') {
    toastr.error('No se puede generar una orden ya generada');
    return;
  }
  if ($('#ordenes_table').DataTable().rows().count() == 0) {
    toastr.error('No se pueden generar ordenes sin productos');
    return;
  }
  if (!table_data.id) {
    toastr.error('Debes seleccionar una orden primero');
    return;
  }
  $('#generate_order_modal').modal('show');
});

$('#confirm_generate_order').on('click', async function () {
  const button = new loadingButton('#confirm_generate_order', 'Generando orden...');
  $('#confirm_generate_order').prop('disabled', true);
  const table_data = $('#ordenes_table').data();
  try {
    const data = await generateOrder();
    $('#data-folio').text(data.folio_unico);

    toastr.success('Orden generada correctamente');
    await loadProductos(table_data.id);

    $('#ordenes_table').data('estado', 'entregada');
    $('#ordenes_table').data('folio_unico', data.folio_unico);
    $('#generate_order_modal').modal('hide');
    $('#ordenes_compra_container').empty();
    resetPaging();
    await loadOrdenes();
  } catch (error) {
    console.error(error);
    toastr.error('Error al generar la orden');
  }
});

const generateOrder = async () => {
  const table_data = $('#ordenes_table').data();
  const cliente = table_data.clientes;
  const productos = $('#ordenes_table').DataTable().rows().data().toArray();
  const folio_cliente = table_data.folio_id;
  const fecha_entrega = table_data.delivery_date;
  const order_id = table_data.id;

  const data = {
    cliente,
    productos,
    folio_cliente,
    fecha_entrega,
    order_id
  };

  console.log(productos);

  const response = await fetchData('/ordenes/generar', 'POST', data);

  if (!response.status) {
    throw new Error(response.message);
  }

  $('#generate_order').addClass('d-none');
  $('#edit_oc').addClass('d-none');
  $('#delete_oc').addClass('d-none');
  $('#restaurar_oc').addClass('d-none');
  $('#cancelar_oc').removeClass('d-none');
  $('#finalizar_oc').removeClass('d-none');

  $('#order_status').text('Proceso');
  $('#order_status').removeClass().addClass('text-capitalize badge bg-secondary');

  $('#ordenes_table').DataTable().column(5).visible(false);

  return response.data;
};
