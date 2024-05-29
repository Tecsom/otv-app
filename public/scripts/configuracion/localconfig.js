import { fetchData, setCookie, getCookie, deleteCookie } from '/public/scripts/helpers.js';
const cookiePortName = 'scannerPort';

async function init() {
  const $isDarkMode = $('#isDarkMode');
  const isDarkMode = window.localStorage.getItem('templateCustomizer-vertical-menu-template-starter--Style') == 'dark';

  if (isDarkMode) {
    $isDarkMode.prop('checked', true);
  }

  await listPorts();
  const cookie = getCookie(cookiePortName);
  if (!cookie) {
    return;
  }
  const $ports = $('#portSelect');

  if ($ports.find(`option[value="${cookie}"]`).length === 0) {
    console.log('option of cookie not found');
    return;
  }

  $ports.val(cookie);
}

//Puerto serie
async function listPorts() {
  const $ports = $('#portSelect');
  const result = await fetchData('/list/ports');
  console.log({ result });
  if (!result.status) {
    toastr.error('Ocurrió un error al leer puertos');
    return;
  }
  result.data.forEach(portPath => {
    const port = portPath.path;
    const portName = getPortName(port);
    $ports.append(
      $('<option>', {
        value: port,
        text: portPath.friendlyName ?? portName
      })
    );
    console.log({ defaultScannerPort });
    if (defaultScannerPort && result.data?.some(elm => elm?.path?.includes(defaultScannerPort))) {
      $ports.val(defaultScannerPort);
    }
  });
}

function getPortName(portPath) {
  const match = portPath.match(/\/dev\/tty\.(.+)/);
  return match ? match[1] : null;
}

$('#localConfigForm').on('submit', async function (e) {
  e.preventDefault();

  const $isDarkMode = $('#isDarkMode');
  const isDarkMode = $isDarkMode.prop('checked');
  console.log({ isDarkMode });

  const $ports = $('#portSelect');
  const portValue = $ports.val();

  if (!!portValue) {
    const res = await fetchData('/settings/verificador/port', 'POST', { port: portValue });
    if (!res.status) {
      toastr.error('Ocurrió un error al guardar puerto');
      return;
    }
  }

  toastr.success(`Aplicando cambios`);
  if (isDarkMode) {
    window.templateCustomizer.setStyle('dark');
  } else {
    window.templateCustomizer.setStyle('light');
  }
});

init();

$('#sync-scanner-button').on('click', async function () {
  const res = await fetchData('/scanner/init');
  if (!res.status) {
    toastr.error('Ocurrió un error al sincronizar');
    return;
  }
  toastr.success('Sincronización exitosa');
});
