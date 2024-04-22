import { fetchData, loadingButton } from '/public/scripts/helpers.js';

$('#edit-client-form').on('submit', async function (e) {
  e.preventDefault();
  const button = new loadingButton($('#confirm_edit_client'));
  button.start();
  const cliente_id = clientData.id;
  const formData = new FormData(this);
  const data = Object.fromEntries(formData);
  const res = await fetchData(`/clientes/${cliente_id}`, 'PUT', data);
  button.stop();
  if (res.status === true) {
    toastr.success(res.message, 'Cliente actualizado');
    updateClientData(res.data);
    $('#modal_edit_client').modal('hide');
    return;
  }
  toastr.error(res.message, 'Error actualizando el cliente');
});

const updateClientData = data => {
  $('#details_client_name').text(data.nombre);
  $('#details_client_rfc').text(data.identificador);
  $('#details_client_mail').text(data.correo);
  $('#details_client_phone').text(data.telefono);
  $('#details_client_cellphone').text(data.celular);
  $('#details_client_adress').text(data.domicilio);
  $('#details_client_city').text(data.ciudad);
  $('#details_client_state').text(data.estado);
};
const updateFieldsEdit = cliente => {
  $('#nombre_cliente').val(cliente.nombre);
  $('#rfc_cliente').val(cliente.identificador);
  $('#email_cliente').val(cliente.correo);
  $('#telefono_cliente').val(cliente.telefono);
  $('#celular_cliente').val(cliente.celular);
  $('#domilicio_cliente').val(cliente.domilicio);
  $('#ciudad_cliente').val(cliente.ciudad);
  $('#estado_cliente').val(cliente.estado);
  $('#pais_cliente').val(cliente.pais);
};

$(document).ready(function () {
  updateFieldsEdit(clientData);
});

$('#delete_client_btn').on('click', async function () {
  const button = new loadingButton($(this));
  console.log('click del');
  button.start();
  const res = await fetchData(`/clientes/${clientData.id}`, 'DELETE');

  if (res.status === true) {
    window.location.href = '/clientes';
    return;
  }
  toastr.error(res.message, 'Error eliminando el cliente');
  button.stop();
});
