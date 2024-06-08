import { isoDateToFormattedWithTime } from '/public/scripts/helpers.js';
const tableActions = `<div class="d-inline-block text-nowrap">
                        <button class="btn btn-sm btn-icon barcode-icon" title="Editar" data-bs-toggle="tooltip" data-bs-placement="top"><i class="ti ti-barcode"></i></button>
                    </div>`;

codigos_table = $('#codigos_table').DataTable({
  columns: [
    //{ data: 'numero_parte', title: '# Parte', orderable: true, className: 'non-selectable' },
    { data: 'code', title: 'Código', orderable: false, className: 'non-selectable' },
    {
      title: 'Último escaneo',
      orderable: false,
      className: 'non-selectable',
      render: function (data, type, row) {
        const code = row.code;
        const verificaciones = verificaciones_table.rows().data().toArray();

        let last_verification = null;

        for (let i = verificaciones.length - 1; i >= 0; i--) {
          const verificacion = verificaciones[i];
          const verification = verificacion.verifications.find(verification => verification.codigo == code);
          if (verification) {
            last_verification = verification;
            break;
          }
        }

        console.log({ last_verification });

        return last_verification?.created_at
          ? isoDateToFormattedWithTime(last_verification?.created_at)
          : 'No escaneado';
      }
    },
    { title: '', defaultContent: tableActions, width: '30px' }
  ],
  dom: 'rtp',
  language: {
    url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
  },
  order: [[0, 'asc']],
  autoWidth: false,
  rowGroup: {
    dataSrc: 'numero_parte'
  },
  pageLength: 5
});

$('#codigos_table').on('click', 'tbody tr button', async function (e) {
  const buttonClicked = $(this); // Obtener el botón que ha sido clicado
  const row = buttonClicked.closest('tr'); // Encontrar la fila asociada al botón clicado
  const data = $('#codigos_table').DataTable().row(row).data(); // Obtener los datos de la fila

  if (buttonClicked.hasClass('barcode-icon')) {
    //VERIFICAR QUE TIPO DE CODIGO NECESITA
    showBarcode(data);
  }
});

const showBarcode = async data => {
  const code_type = 'QR';
  //get templateCustomizer-vertical-menu-template-starter--Style from localstorage
  const colorPref = localStorage.getItem('templateCustomizer-vertical-menu-template-starter--Style');
  $('#viewCodeModal').modal('show');
  $('#codeWrapper').empty();
  if (code_type == 'QR') {
    const svgNode = QRCode(data.code);

    $('#codeWrapper').append(svgNode);
  } else if (code_type == 'DM') {
    const svgNode = DATAMatrix(data.code);

    $('#codeWrapper').append(svgNode);
  }
  $('#codeWrapper svg').attr('fill', colorPref === 'dark' ? '#fff' : '#000');
};

$('#download-csv').on('click', function () {
  const order_data = $('#ordenes_table').data();
  const proveedor_id = order_data?.clientes?.proveedor_id;
  const data = codigos_table.rows().data();
  const csvData = [];
  const headers = [
    'NUMERACION',
    'PUNTO',
    'PLANO',
    'MARCA',
    'AÑO',
    'SEMANA',
    'NUMERO',
    'SUMA',
    'NUMERO DE PARTE',
    'CODIGO DE BARRAS'
  ];
  csvData.push(headers);

  const year = new Date().getFullYear();
  console.log({ order_data });
  data.each(row => {
    csvData.push([
      escapeCSV(row.consecutivo),
      '.',
      escapeCSV(row?.product?.revisiones?.nombre),
      escapeCSV(proveedor_id),
      escapeCSV(year),
      escapeCSV(getWeekNumber(new Date(order_data.delivery_date))),
      escapeCSV(row.consecutivo.toString().padStart(5, '0')),
      escapeCSV(row.code),
      escapeCSV(row.numero_parte),
      escapeCSV(row.code)
    ]);
  });

  const csv = csvData.map(row => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', 'codigos.csv');

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});

function escapeCSV(value) {
  if (value == null) {
    return '""';
  }
  value = value.toString();
  if (value.includes('"') || value.includes(',')) {
    value = value.replace(/"/g, '""');
    return `"${value}"`;
  }
  return value;
}

function getWeekNumber(d) {
  // Copy date so don't modify original
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  // Get first day of year
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  // Calculate full weeks to nearest Thursday
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  // Return array of year and week number
  return weekNo;
}
