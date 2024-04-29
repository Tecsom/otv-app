const client = supabase.createClient(
  'https://ysbttwpoacgzbospykzx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzYnR0d3BvYWNnemJvc3B5a3p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTI3ODEwMTcsImV4cCI6MjAyODM1NzAxN30.b_CJcOMVbNWDvEi7CnhsxirPBUfnPunR5HgZBjSdyTE'
);

$('#formLogin').on('submit', async function (event) {
  event.preventDefault();

  const email = $('#email').val();
  const password = $('#password').val();

  try {
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    const { access_token } = data?.session ?? {};
    if (!access_token) return;
    console.log({ access_token });
    setCookie('accessToken', access_token, 1000);

    const redirect = new URLSearchParams(window.location.search).get('redirect');

    if (redirect && redirect !== '/login') {
      window.location.href = redirect;
    } else {
      window.location.href = '/';
    }
  } catch (error) {
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
    const { error } = await client.auth.signOut();
    if (error) {
      console.error(error);
      return;
    }
    //remove accessToken cookie
    document.cookie = 'accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    window.location.href = '/login';
  } catch (error) {
    console.error(error);
  }
});
