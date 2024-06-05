const flatpickOptions = {
  dateFormat: 'd/m/Y',
  maxDate: 'today',
  mode: 'range',
  locale: {
    firstDayOfWeek: 1,
    weekdays: {
      shorthand: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
      longhand: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    },
    months: {
      shorthand: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Оct', 'Nov', 'Dic'],
      longhand: [
        'Enero',
        'Febrero',
        'Мarzo',
        'Abril',
        'Mayo',
        'Junio',
        'Julio',
        'Agosto',
        'Septiembre',
        'Octubre',
        'Noviembre',
        'Diciembre'
      ]
    }
  }
};

flatpckr_day = $('#day_fecha_entrega').flatpickr({
  onChange: function (date, dateStr) {
    console.log('changed');
    date = new Date(date[0]);

    const StartDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1, 23, 59, 59);
    const EndDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

    const startUTCDate = new Date(StartDay.getTime() - StartDay.getTimezoneOffset() * 60000);
    const endUTCDate = new Date(EndDay.getTime() - EndDay.getTimezoneOffset() * 60000);

    const startIsoDate = startUTCDate.toISOString();
    const endIsoDate = endUTCDate.toISOString();

    deliveryDateFilter = [startIsoDate, endIsoDate];

    page = 1;
    loadMore = true;
    $('#ordenes_compra_container').empty();
    loadOrdenes();
  },
  ...flatpickOptions,
  mode: 'single',
  maxDate: ''
});

flatpckr_week = $('#week_fecha_entrega').flatpickr({
  onChange: function (date, dateStr) {
    const weekNumber = this.selectedDates[0] ? this.config.getWeek(this.selectedDates[0]) : null;

    const year = this.selectedDates[0] ? this.selectedDates[0].getFullYear() : null;

    const startDay = new Date(year, 0, 1 + (weekNumber - 1) * 7 - 1, 23, 59, 59);
    const endDay = new Date(year, 0, 1 + (weekNumber - 1) * 7 + 5, 23, 59, 59);

    console.log({ startDay, endDay });

    const startUTCDate = new Date(startDay.getTime() - startDay.getTimezoneOffset() * 60000);
    const endUTCDate = new Date(endDay.getTime() - endDay.getTimezoneOffset() * 60000);

    const startIsoDate = startUTCDate.toISOString();
    const endIsoDate = endUTCDate.toISOString();

    deliveryDateFilter = [startIsoDate, endIsoDate];

    page = 1;
    loadMore = true;
    $('#ordenes_compra_container').empty();
    loadOrdenes();
  },
  ...flatpickOptions,
  maxDate: '',
  plugins: [new weekSelect({})],
  locale: {
    firstDayOfWeek: 0,
    weekdays: {
      shorthand: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
      longhand: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    },
    months: {
      shorthand: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Оct', 'Nov', 'Dic'],
      longhand: [
        'Enero',
        'Febrero',
        'Мarzo',
        'Abril',
        'Mayo',
        'Junio',
        'Julio',
        'Agosto',
        'Septiembre',
        'Octubre',
        'Noviembre',
        'Diciembre'
      ]
    }
  }
});
