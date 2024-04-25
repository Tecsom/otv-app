let consecutivo = {};

const code_map = [
  { value: 'Número de parte', id: 'numero_parte', key: 'numero_parte' },
  { value: 'Revisión de parte', id: 'revision_parte', key: 'revision_name' },
  { value: 'ID de cliente', id: 'cliente_id', key: 'client_id' },
  { value: 'ID orden de compra', id: 'orden_compra_id', key: 'id' },
  { value: 'Semana del año (Fecha de entrega - WW)', id: 'semana_ano', key: 'semana_ano' },
  { value: 'Año (Fecha de entrega - YYYY)', id: 'ano_YYYY', key: 'ano_4y' },
  { value: 'Año (Fecha de entrega - YY)', id: 'ano_YY', key: 'ano_2y' },
  { value: 'Identificador de proveedor', id: 'proveedor_id', key: 'proveedor_id' },
  { value: '# Consecutivo de la pieza por OC', id: 'consecutivo', key: 'consecutivo' }
];

codigos_table = $('#codigos_table').DataTable({
  columns: [
    { data: 'numero_parte', title: '# Parte', orderable: true, className: 'non-selectable' },
    {
      title: 'Código',
      orderable: false,
      className: 'non-selectable',
      render: function (data, type, row) {
        const full_data = $('#container-reporte').data() ?? {};
        const { code_string } = $('#container-reporte').data();
        const code = JSON.parse(code_string ?? '[]');

        let code_str = '';
        const { numero_parte } = row;
        console.log({ row });
        console.log(full_data);
        for (const { id: key, value } of code) {
          const key_obj = code_map.find(c => c.value === value)?.key;
          if (key === 'consecutivo') {
            const numero = consecutivo[numero_parte] || 1;
            consecutivo[numero_parte] = numero + 1;
            const folio = `${numero_parte}${numero}`;
            code_str += folio;
            continue;
          } else if (key === 'ano_4y') {
            const delivery_date = new Date(full_data.delivery_date);
            const year = delivery_date.getFullYear();

            code_str += year;

            continue;
          }

          if (!key_obj) {
            code_str += value;
            continue;
          }
          code_str += row[key_obj];
        }
        console.log({ code_str });

        return code_str;
      }
    }
  ],
  dom: 'rtp',
  language: {
    url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
  },
  order: [[0, 'asc']]
});

codigos_table.on('draw', function () {
  consecutivo = {};
});
