import { fetchData, loadingButton, isoDateToFormattedWithTime } from '/public/scripts/helpers.js';

//get product_id from url last param
const product_id = window.location.pathname.split('/').pop();

$('#edit-product-form').submit(async function (e) {
  e.preventDefault();
  const formData = new FormData(this);
  const data = Object.fromEntries(formData);
  data.id = product_id;
  const button = new loadingButton($('#confirm_edit_product'));
  button.start();
  const res = await fetchData(`/inventory`, 'PUT', data);
  button.stop();
  if (res.status === true) {
    $('#modal_edit_product').modal('hide');
    toastr.success('Producto actualizado exitosamente', 'Producto actualizado');
    return;
  }
});

$('#delete_product_button').on('click', async function () {
  const button = new loadingButton($('#delete_product_button'));
  button.start();
  const res = await fetchData(`/inventory/${product_id}`, 'DELETE');
  if (res.status === true) {
    window.location.href = '/inventario';
    return;
  }

  toastr.error('Error al eliminar el producto', 'Error');
  button.stop();
});

const historial_table = $('#historial_table').DataTable({
  columns: [
    {
      data: 'created_at',
      title: 'Fecha',
      orderable: true,
      render: (data, type, row) => {
        return isoDateToFormattedWithTime(data);
      }
    },
    {
      data: 'consumed',
      title: 'Cantidad',
      orderable: true,
      render: (data, type, row) => {
        const percentage = data * 100;

        if (row.type === 'input') return '-';

        return percentage.toFixed(2) + '%';
      }
    },
    { data: 'description', title: 'Descripción', orderable: true },
    {
      data: 'type',
      title: 'Tipo',
      orderable: true,
      render: (data, type, row) => {
        return data === 'output'
          ? "<span class='badge bg-danger'>Salida</span>"
          : "<span class='badge bg-success'>Entrada</span>";
      }
    }
  ],
  dom: 'rtp',
  language: {
    url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
  },
  order: [[0, 'desc']],
  paging: true,
  processing: true,
  serverSide: true,
  ajax: {
    url: `/api/inventory/movements/${product_id}`,
    type: 'GET'
  }
});
