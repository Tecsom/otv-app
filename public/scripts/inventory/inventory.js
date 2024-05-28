import { fetchData, loadingButton } from '/public/scripts/helpers.js';

const per_page = 20;

const products_table = $('#products_table').DataTable({
  select: {
    style: 'multi',
    selector: 'td:not(.non-selectable)'
  },
  columns: [
    { data: 'name', title: 'Nombre', orderable: true, className: 'non-selectable' },
    { data: 'description', title: 'Descripción', orderable: false, className: 'non-selectable' }
  ],
  dom: 'rtp',
  language: {
    url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
  },
  order: [[0, 'asc']],
  paging: true,
  searching: true,
  pageLength: per_page,
  processing: true,
  serverSide: true,
  ajax: '/api/inventory/paging'
});

$('#search-product').on('keyup', function () {
  products_table.search($('#search-product').val()).draw();
});

$('#create-product-form').submit(async function (e) {
  e.preventDefault();

  //get form data to object
  const formData = new FormData(this);
  const data = Object.fromEntries(formData);

  const button = new loadingButton($('#confirm_new_product'));
  button.start();
  const res = await fetchData('/inventory', 'POST', data);

  if (res.status === true) {
    products_table.ajax.reload();
    $('#create-product-modal').modal('hide');
    $('#create-product-form').trigger('reset');
    toastr.success('Producto creado exitosamente', 'Producto creado');
    return;
  }

  button.stop();
});

products_table.on('click', 'tbody tr', function () {
  const data = products_table.row(this).data();
  const product_id = data.id;
  window.location.href = `/inventario/${product_id}`;
});
