$(() => {
  console.log('ready');
  if (!localStorage.getItem('token')) {
    generateToken();
  }

  $('#token').val(localStorage.getItem('token'));
});

function generateToken() {
  $.ajax({
    url: '/api/token',
    headers: {
      'Content-Type': 'application/json',
    },
    data: JSON.stringify({ name: randomizer(12, 12) }),
    type: 'POST',
    dataType: 'json',
    success(data) {
      localStorage.setItem('token', data.token);
      $('#token').val(data.token);
    },
    error(xhr, status, err) {
      console.error(`Error: ${status}`);
      console.error(`Error: ${err}`);
    }
  });
}