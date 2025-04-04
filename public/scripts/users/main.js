import { fetchData, loadingButton } from '/public/scripts/helpers.js';

const options = `<div class="d-inline-block text-nowrap">
                  <button class="btn btn-sm btn-icon edit-user" title="Editar"><i class="ti ti-edit"></i></button>
                  <button class="btn btn-sm btn-icon delete-user" title="Eliminar"><i class="ti ti-trash-x"></i></button>
                </div>`;

const usersTable = $('#usersTable').DataTable({
  columns: [
    { data: 'name', title: 'Nombre', defaultContent: '' },
    { data: 'email', title: 'Correo' },
    { data: 'status', title: 'Estado', defaultContent: 'Activo' },
    { data: 'rol', title: 'Rol', defaultContent: '' },
    { data: 'action', title: 'Acciones', orderable: false, searchable: false, defaultContent: options, width: '30px' }
  ],
  ordering: false,
  info: false,
  dom: 'rtp',
  language: {
    url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
  },
  autoWidth: false,
  paging: true,
  searching: true,
  pageLength: 20,
  processing: true,
  serverSide: true,
  ajax: '/api/usuarios-table'
});

const createUserRoleSelect = $('#createUserRole').select2({
  placeholder: 'Selecciona un rol',
  allowClear: true,
  width: '100%',
  minimumResultsForSearch: -1
});

const editUserRoleSelect = $('#editUserRole').select2({
  placeholder: 'Selecciona un rol',
  allowClear: true,
  width: '100%',
  minimumResultsForSearch: -1
});

$('#createUserModal').on('hidden.bs.modal', function () {
  $('#createUserForm').trigger('reset');
  createUserRoleSelect.val('admin').trigger('change');
});

$('#searchUserInput').on('keyup', function () {
  usersTable.search(this.value).draw();
});

$('#createUserForm').on('submit', async function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const data = Object.fromEntries(formData);

  const btn = new loadingButton($('#confirmNuewUser'), 'Creando usuario...');
  btn.start();

  const response = await fetchData('/usuarios', 'POST', data);

  if (!response.status) {
    btn.stop();
    return toastr.error('Ocurrió un error al crear el usuario');
  }

  usersTable.ajax.reload();

  toastr.success('Usuario creado correctamente');
  $('#createUserModal').modal('hide');
});

usersTable.on('click', '.edit-user', function () {
  const data = usersTable.row($(this).parents('tr')).data();

  $('#editUserLabel').text(`Editar usuario: ${data.name}`);
  $('#editUserId').val(data.id);
  $('#editUserName').val(data.name);
  $('#editUserEmail').val(data.email);
  $('#editUserRole').val(data.rol).trigger('change');
  $('#editUserStatus').val(data.status).trigger('change');
  $('#editUserVericadorPass').val(data.verificador_pass);

  $('#editUserModal').modal('show');
});

$('#editUserForm').on('submit', async function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const data = Object.fromEntries(formData);

  const btn = new loadingButton($('#confirmEditUser'), 'Actualizando usuario...');
  btn.start();

  const response = await fetchData(`/usuarios`, 'PUT', data);

  if (!response.status) {
    btn.stop();
    return toastr.error('Ocurrió un error al actualizar el usuario');
  }

  usersTable.ajax.reload();

  toastr.success('Usuario actualizado correctamente');
  $('#editUserModal').modal('hide');
});

$('#editUserModal').on('hidden.bs.modal', function () {
  $('#editUserForm').trigger('reset');

  $('#editUserId').val('');
});
