codigos_table = $('#codigos_table').DataTable({
  columns: [
    { data: 'numero_parte', title: '# Parte', orderable: true, className: 'non-selectable' },
    {
      data: 'code',
      title: 'Código',
      orderable: false,
      className: 'non-selectable'
    }
  ],
  dom: 'rtp',
  language: {
    url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
  },
  order: [[0, 'asc']]
});
