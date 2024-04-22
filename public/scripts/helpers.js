export const fetchData = async (endpoint, method = 'GET', body) => {
  const BASE_URL = 'http://localhost:3000/api';
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
