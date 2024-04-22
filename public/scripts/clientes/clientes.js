import { fetchData, loadingButton } from '/scripts/helpers.js';

const clientes_table = $('#clientes_table').DataTable({
  select: {
    style: 'multi',
    selector: 'td:not(.non-selectable)'
  },
  columns: [
    { data: 'nombre', title: 'Nombre', orderable: true, className: 'non-selectable' },
    { data: 'identificador', title: 'Identificador', orderable: true, className: 'non-selectable' },
    { data: 'domicilio', title: 'Domicilio', orderable: false, className: 'non-selectable' }
  ],
  dom: 'rtp',
  paging: false,
  language: {
    url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
  },
  order: [[0, 'asc']],
  searching: true
});

$(document).ready(function () {
  clientes_table.clear().draw();
  clientes_table.rows.add(clientes).draw();
});

const searchClientes = async search => {
  const res = await fetchData(`/clientes?search=${search}`);
  clientes_table.clear().draw();
  const { data } = res;
  clientes_table.rows.add(data).draw();
};

$('#create-client-form').on('submit', async function (event) {
  event.preventDefault();
  const formData = new FormData(this);
  const data = Object.fromEntries(formData);

  const button = new loadingButton('#confirm_new_client');
  button.start();

  const res = await fetchData('/clientes', 'POST', data);
  button.stop();
  if (res.status === true) {
    await searchClientes('');
    $('#create-client-modal').modal('hide');
    toastr.success('Cliente creado exitosamente', 'Cliente creado');
    return;
  }
  toastr.error(res.message, 'Error creando el cliente');
});
