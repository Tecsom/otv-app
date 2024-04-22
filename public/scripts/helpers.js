export const fetchData = async (endpoint, method, body) => {
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
    return { status: false, message: error.message, data: {} };
  }
};
