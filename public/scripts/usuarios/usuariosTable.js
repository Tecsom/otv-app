const options = `
  <button class="btn btn-sm btn-primary" data-toggle="modal" data-target="#editUsuarioModal">
    <i class="ti ti-edit"></i>
    </button>
    <button class="btn btn-sm btn-danger" data-toggle="modal" data-target="#deleteUsuarioModal">
    <i class="ti ti-trash"></i>
    </button>`;

usuariosTable = $('#usuarios-table').DataTable({
  columns: [
    { data: 'name', title: 'Nombre', defaultContent: '' },
    { data: 'email', title: 'Correo' },
    { data: 'status', title: 'Estado', defaultContent: 'Activo' },
    { data: 'rol', title: 'Rol', defaultContent: '' },
    { data: 'action', title: 'Acciones', orderable: false, searchable: false, defaultContent: options }
  ],
  searching: false,
  ordering: false,
  info: false,
  dom: 'rtp',
  language: {
    url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
  }
});

$(document).ready(() => {
  usuariosTable.clear().draw();
  usuariosTable.rows.add(usuarios).draw();
});
