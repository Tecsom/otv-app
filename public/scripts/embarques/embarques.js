$(() => {
  init();
});

async function init() {
  new PerfectScrollbar(document.getElementById('embarques_container'), {
    wheelPropagation: false
  });
}
