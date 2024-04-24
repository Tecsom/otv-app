import { fetchData, loadingButton } from '/public/scripts/helpers.js';

$('#create-client-form').on('submit', async function (event) {
  event.preventDefault();
  const formData = new FormData(this);
  const data = Object.fromEntries(formData);

  const button = new loadingButton('#confirm_new_client');
  button.start();

  const res = await fetchData('/clientes', 'POST', data);
  button.stop();
  if (res.status === true) {
    clientes_table.ajax.reload();
    $('#create-client-modal').modal('hide');
    $('#create-client-form').trigger('reset');
    toastr.success('Cliente creado exitosamente', 'Cliente creado');
    return;
  }
  toastr.error(res.message, 'Error creando el cliente');
});

clientes_table.on('click', 'tbody tr', function () {
  const data = clientes_table.row(this).data();
  const client_id = data.id;
  window.location.href = `/clientes/${client_id}`;
});
