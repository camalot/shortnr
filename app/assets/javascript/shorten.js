
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

function randomizer(min, max) {
  const source = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  // generate a random string with min length of min and max length of max
  const length = Math.floor(Math.random() * (max - min + 1)) + min;
  let result = '';
  for (let i = 0; i < length; i++) {
    result += source[Math.floor(Math.random() * source.length)];
  }
  return result;
}

$('.btn-shorten').on('click', function() {
  // todo: check if tokens are required
  if (!localStorage.getItem('token')) {
    generateToken();
  }

  $.ajax({
    url: '/api/shorten',
    headers: {
      'Content-Type': 'application/json',
      'X-Access-Token': localStorage.getItem('token'),
    },
    type: 'POST',
    dataType: 'json',
    data: JSON.stringify({ url: $('#url').val() }),
    success(data) {
      const resultHTML = `<a class="result" href="${data.url}" target="_blank">${data.url}</a>`;
      $('#link').hide().html(resultHTML).fadeIn('slow');
      $('#url').val('');
    },
  });
});

$('.btn-token').on('click', function() {
  console.log('clicked');
  $.ajax({
    url: '/api/token',
    headers: {
      'Content-Type': 'application/json',
    },
    type: 'POST',
    dataType: 'json',
    success(data) {
      localStorage.setItem('token', data.token);
      $('#token').val(data.token);
    },
  });
});

$('.btn.btn-token-showhide').on('click', function() {
  const isHidden = $('#token').attr('type') === 'password';
  if (isHidden) {
    $(this)
      .addClass('btn-token-hidden')
      .removeClass('btn-token-shown')
      .attr('title', 'Hide Token');
    $('.fa-eye', this)
      .removeClass('fa-eye')
      .addClass('fa-eye-slash');
    $('#token').attr('type', 'text');
  } else {
    $(this)
      .addClass('btn-token-shown')
      .removeClass('btn-token-hidden')
      .attr('title', 'Show Token');
    $('.fa-eye-slash', this)
      .removeClass('fa-eye-slash')
      .addClass('fa-eye');
    $('#token').attr('type', 'password');
  }
});


// $('.btn-copy.btn-token-copy').on('click', () => {
//   const $temp = $('<input style="display:none;"/>');
//   $('body').append($temp);
//   $temp.val($('#token').text()).select();
//   document.execCommand('copy');
//   $temp.remove();

//   let range = document.createRange();
//   range.selectNode(document.getElementById("a"));
//   window.getSelection().removeAllRanges(); // clear current selection
//   window.getSelection().addRange(range); // to select text
//   document.execCommand("copy");
//   window.getSelection().removeAllRanges();// to deselect
// });


$('.kpxc').css('display', 'none');
