import { fetchData, loadingButton } from '/public/scripts/helpers.js';

$('#delete_client_btn').on('click', async function () {
  const button = new loadingButton($(this));
  const cliente_id = clientData.id;
  button.start();
  const res = await fetchData(`/clientes/${cliente_id}`, 'DELETE');
  button.stop();
  if (res.status === true) {
    window.location.href = '/clientes';
    return;
  }
  toastr.error(res.message, 'Error eliminando el cliente');
});

$('#edit-client-form').on('submit', async function (e) {
  e.preventDefault();
  const button = new loadingButton($('#edit_client_btn'));
  button.start();
  const cliente_id = clientData.id;
  const data = $(this).serialize();
  const res = await fetchData(`/clientes/${cliente_id}`, 'PUT', data);
  button.stop();
  if (res.status === true) {
    toastr.success(res.message, 'Cliente actualizado');
    updateClientData(res.data);
    return;
  }
  toastr.error(res.message, 'Error actualizando el cliente');
});

const updateClientData = data => {
  $('#nombre_cliente').val(data.nombre);
  $('#rfc_cliente').val(data.rfc);
  $('#email_cliente').val(data.email);
  $('#telefono_cliente').val(data.telefono);
  $('#celular_cliente').val(data.celular);
  $('#domilicio_cliente').val(data.domilicio);
  $('#ciudad_cliente').val(data.ciudad);
  $('#estado_cliente').val(data.estado);
  $('#pais_cliente').val(data.pais);
};
const updateFieldsEdit = () => {
  $('#nombre_cliente').val(clientData.nombre);
  $('#rfc_cliente').val(clientData.rfc);
  $('#email_cliente').val(clientData.email);
  $('#telefono_cliente').val(clientData.telefono);
  $('#celular_cliente').val(clientData.celular);
  $('#domilicio_cliente').val(clientData.domilicio);
  $('#ciudad_cliente').val(clientData.ciudad);
  $('#estado_cliente').val(clientData.estado);
  $('#pais_cliente').val(clientData.pais);
};
