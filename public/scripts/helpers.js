export const fetchData = async (endpoint, method = 'GET', body) => {
  const BASE_URL = 'http://localhost:3000/api';
  console.log(BASE_URL + endpoint);
  console.log({ method });
  const noBodyMethods = method === 'GET' || method === 'DELETE';
  try {
    const body_obj = noBodyMethods
      ? {}
      : {
          body: JSON.stringify(body)
        };

    const res_encoded = await fetch(BASE_URL + endpoint, {
      method,
      headers: noBodyMethods
        ? {}
        : {
            'Content-Type': 'application/json'
          },
      ...body_obj
    });

    const status = res_encoded.status;

    const res = await res_encoded.json();

    if (status !== 200) {
      return { status: false, message: res.message, data: {} };
    }

    return { status: true, data: res, message: '' };
  } catch (error) {
    console.log(error);
    return { status: false, message: error.message, data: {} };
  }
};

export class loadingButton {
  constructor(dom, loadingText = 'Cargando') {
    this.dom = dom;
    this.loadingText = loadingText;
    this.original = $(dom).html();
  }

  start() {
    const button = $(this.dom);
    button.html(`<div class="d-flex justify-content-center align-items-center">
                  <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>${this.loadingText}
                </div>`);
    button.prop('disabled', true);
  }

  stop() {
    const button = $(this.dom);

    $(this.dom).html(this.original);
    $(this.dom).find('.waves-ripple').remove();
    button.prop('disabled', false);
  }
}

export function isoDateToFormatted(fechaISO) {
  // Crear un objeto Date usando la cadena de fecha ISO 8601
  const fecha = new Date(fechaISO);

  // Extraer día, mes y año
  const dia = fecha.getUTCDate(); // Obtener día (en formato de 1 a 31)
  const mes = fecha.getUTCMonth() + 1; // Obtener mes (en formato de 0 a 11, por eso se suma 1)
  const anio = fecha.getUTCFullYear(); // Obtener año

  // Formatear la fecha como dd/mm/yyyy
  const fechaFormateada = `${dia.toString().padStart(2, '0')}/${mes.toString().padStart(2, '0')}/${anio}`;

  return fechaFormateada;
}

//neceisto la función que le pase la fecha en utc 2024-04-24 22:17:29.11027+00 y me devuelva la fecha en formato dd/mm/yyyy hh:mm:ss de la hora local

export function isoDateToFormattedWithTime(fechaISO) {
  // Crear un objeto Date usando la cadena de fecha ISO 8601
  const fecha = new Date(fechaISO);

  // Extraer día, mes y año
  const dia = fecha.getDate(); // Obtener día (en formato de 1 a 31)
  const mes = fecha.getMonth() + 1; // Obtener mes (en formato de 0 a 11, por eso se suma 1)
  const anio = fecha.getFullYear(); // Obtener año

  const hora = fecha.getHours();
  const minutos = fecha.getMinutes();
  const segundos = fecha.getSeconds();

  // Formatear la fecha como dd/mm/yyyy
  const fechaFormateada = `${dia.toString().padStart(2, '0')}/${mes.toString().padStart(2, '0')}/${anio} ${hora.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;

  return fechaFormateada;
}

export function setCookie(nombre, valor, expiracion_ms) {
  var fechaExpiracion = new Date();
  fechaExpiracion.setTime(fechaExpiracion.getTime() + (expiracion_ms * 24 * 60 * 60 * 1000)); 
  var expiracionUTC = fechaExpiracion.toUTCString();
  var cookieString = nombre + "=" + encodeURIComponent(valor) + "; expires=" + expiracionUTC + "; path=/";

  document.cookie = cookieString;
}

export function getCookie(nombre) {
  var cookies = document.cookie;
  var cookiesArray = cookies.split(';');
  for (var i = 0; i < cookiesArray.length; i++) {
      var cookie = cookiesArray[i].trim();
      if (cookie.indexOf(nombre + "=") === 0) {
          return decodeURIComponent(cookie.substring(nombre.length + 1));
      }
  }

  return null;
}

export function deleteCookie(nombre) {
  var fechaExpiracion = new Date();
  fechaExpiracion.setTime(fechaExpiracion.getTime() - 1);

  var expiracionUTC = fechaExpiracion.toUTCString();
  document.cookie = nombre + "=; expires=" + expiracionUTC + "; path=/";
}