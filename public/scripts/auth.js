import { loadingButton, fetchData } from '/public/scripts/helpers.js';

$('#formLogin').on('submit', async function (event) {
  event.preventDefault();
  const button = new loadingButton($('#loginButton'), 'Iniciando sesión...');
  button.start();

  const email = $('#email').val();
  const password = $('#password').val();

  try {
    const res = await fetchData('/login', 'POST', { email, password });
    button.stop();
    if (!res.status) {
      toastr.error('Revisa tu correo y contraseña', 'Error al iniciar sesión');
      return;
    }

    const { user, access_token } = res.data;

    setCookie('accessToken', access_token, 1000);

    localStorage.setItem('user_data', JSON.stringify(user));
    const redirect = new URLSearchParams(window.location.search).get('redirect');

    if (redirect && redirect !== '/login') {
      window.location.href = redirect;
    } else {
      window.location.href = '/';
    }
  } catch (error) {
    toastr.error('Revisa tu correo y contraseña', 'Error al iniciar sesión');
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(errorCode, errorMessage);
  }
});

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  let expires = 'expires=' + d.toUTCString();
  document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

$('.logout-btn').on('click', async function (event) {
  event.preventDefault();
  try {
    //remove accessToken cookie
    document.cookie = 'accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    window.location.href = '/login';
  } catch (error) {
    console.error(error);
  }
});
