const initClock = () => {
  const clock = document.getElementById('datetime');
  const updateClock = () => {
    clock.innerText = new Date().toLocaleString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true
    });
  };
  setInterval(updateClock, 1000);
};

$(document).ready(() => {
  initClock();
});
