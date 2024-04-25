const tableActions = `<div class="d-inline-block text-nowrap">
                        <button class="btn btn-sm btn-icon barcode-icon" title="Editar" data-bs-toggle="tooltip" data-bs-placement="top"><i class="ti ti-barcode"></i></button>
                    </div>`;

codigos_table = $('#codigos_table').DataTable({
  columns: [
    { data: 'numero_parte', title: '# Parte', orderable: true, className: 'non-selectable' },
    { data: 'code', title: 'Código', orderable: false, className: 'non-selectable' },
    { title: '', defaultContent: tableActions, width: '10px' }
  ],
  dom: 'rtp',
  language: {
    url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
  },
  order: [[0, 'asc']],
  autoWidth: false
});

$('#codigos_table').on('click', 'tbody tr button', async function (e) {
  const buttonClicked = $(this); // Obtener el botón que ha sido clicado
  const row = buttonClicked.closest('tr'); // Encontrar la fila asociada al botón clicado
  const data = $('#codigos_table').DataTable().row(row).data(); // Obtener los datos de la fila

  if (buttonClicked.hasClass('barcode-icon')) {
    //VERIFICAR QUE TIPO DE CODIGO NECESITA
    const code_type = 'qr';

    if (code_type == 'qr') {
      const svgNode = QRCode(data.code);

      $('#viewCodeModal').modal('show');
      $('#codeWrapper').empty();
      $('#codeWrapper').append(svgNode);
    } else if (code_type == 'datamatrix') {
      const svgNode = DATAMatrix(data.code);

      $('#viewCodeModal').modal('show');
      $('#codeWrapper').empty();
      $('#codeWrapper').append(svgNode);
    }
  }
});
