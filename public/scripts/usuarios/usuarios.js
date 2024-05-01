import { fetchData, loadingButton } from '/public/scripts/helpers.js';

$('#user_rol').select2({
  placeholder: 'Selecciona un rol',
  dropdownParent: $('#create-user-modal'),
  minimumResultsForSearch: -1
});

$('#user_rol_edit').select2({
  placeholder: 'Selecciona un rol',
  dropdownParent: $('#edit-user-modal'),
  minimumResultsForSearch: -1
});

$('#create-user-form').submit(async function (e) {
  e.preventDefault();
  const formData = new FormData(this);
  const data = Object.fromEntries(formData);

  if (data.password !== data.confirmed_password) {
    toastr.error('Las contraseñas no coinciden', 'Error creando el usuario');
    return;
  }

  const button = new loadingButton('#confirm_new_user');
  button.start();

  const res = await fetchData('/usuarios', 'POST', data);
  button.stop();

  if (res.status === true) {
    const user = res.data;
    console.log({ user });
    usuariosTable.row.add(user).draw();
    $('#create-user-modal').modal('hide');
    $('#create-user-form').trigger('reset');
    toastr.success('Usuario creado exitosamente', 'Usuario creado');
    return;
  }
  toastr.error(res.message, 'Error creando el usuario');
});

$('#usuarios-table').on('click', '.edit-user', function () {
  $('#edit-user-modal').modal('show');
  const row = $(this).closest('tr');
  const data = usuariosTable.row(row).data();

  $('#edit-user-modal').data('id', data.id);
  $('#user_name_edit').val(data.name);
  $('#user_rol_edit').val(data.rol).trigger('change');
});

$('#edit-user-form').submit(async function (e) {
  e.preventDefault();
  const formData = new FormData(this);
  let data = Object.fromEntries(formData);

  const button = new loadingButton('#confirm_edit_user');
  button.start();

  const user_id = $('#edit-user-modal').data('id');
  data.id = user_id;

  const res = await fetchData('/usuarios', 'PUT', data);
  button.stop();

  if (res.status === true) {
    const user = res.data;
    const row_index = usuariosTable
      .rows()
      .data()
      .toArray()
      .findIndex(u => u.id === user_id);
    const row = usuariosTable.row(row_index);
    const old_data = usuariosTable.row(row).data();
    const new_data = { ...old_data, ...user };

    usuariosTable.row(row).data(new_data).draw();
    $('#edit-user-modal').modal('hide');
    toastr.success('Usuario actualizado exitosamente', 'Usuario actualizado');
    return;
  }
  toastr.error(res.message, 'Error actualizando el usuario');
});

$('#usuarios-table').on('click', '.delete-user', function () {
  $('#delete-user-modal').modal('show');
  const row = $(this).closest('tr');
  const data = usuariosTable.row(row).data();

  $('#delete-user-modal').data('id', data.id);
});

$('#confirm_delete_user').click(async function () {
  const user_id = $('#delete-user-modal').data('id');
  const button = new loadingButton('#confirm_delete_user');
  button.start();
  const res = await fetchData(`/usuarios/${user_id}`, 'DELETE');
  button.stop();
  if (res.status === true) {
    const row_index = usuariosTable
      .rows()
      .data()
      .toArray()
      .findIndex(u => u.id === user_id);
    usuariosTable.row(row_index).remove().draw();
    $('#delete-user-modal').modal('hide');
    toastr.success('Usuario eliminado exitosamente', 'Usuario eliminado');
    return;
  }
  toastr.error(res.message, 'Error eliminando el usuario');
});
