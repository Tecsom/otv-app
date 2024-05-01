import { fetchData, loadingButton } from '/public/scripts/helpers.js';

$('#user_rol').select2({
  placeholder: 'Selecciona un rol',
  dropdownParent: $('#create-user-modal'),
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
