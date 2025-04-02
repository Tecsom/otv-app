const options = `<div class="d-inline-block text-nowrap">
                  <button class="btn btn-sm btn-icon edit-user" title="Editar"><i class="ti ti-edit"></i></button>
                  <button class="btn btn-sm btn-icon delete-user" title="Eliminar"><i class="ti ti-trash-x"></i></button>
                </div>`;

usuariosTable = $('#usuarios-table').DataTable({
  columns: [
    { data: 'name', title: 'Nombre', defaultContent: '' },
    { data: 'email', title: 'Correo' },
    { data: 'status', title: 'Estado', defaultContent: 'Activo' },
    { data: 'rol', title: 'Rol', defaultContent: '' },
    { data: 'action', title: 'Acciones', orderable: false, searchable: false, defaultContent: options, width: '30px' }
  ],
  searching: false,
  ordering: false,
  info: false,
  dom: 'rtp',
  language: {
    url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
  },
  autoWidth: false
});

$(document).ready(() => {
  usuariosTable.clear().draw();
  usuariosTable.rows.add(usuarios).draw();
});
