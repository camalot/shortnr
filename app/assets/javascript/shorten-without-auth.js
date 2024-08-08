$('.btn-shorten').on('click', function () {
  $.ajax({
    url: '/api/shorten',
    headers: {
      'Content-Type': 'application/json',
    },
    type: 'POST',
    dataType: 'json',
    data: JSON.stringify({ url: $('#url').val() }),
    success(data) {
      const resultHTML = `<a class="result" href="${data.url}" target="_blank">${data.url}</a>`;
      $('#link').hide().html(resultHTML).fadeIn('slow');
      $('#url').val('');
      toastr.success(`URL shortened to ${data.url}`, { timeOut: -1 });
    },
    error(xhr, status, err) {
      toastr.error('Error shortening URL');
      console.error(`Error: ${status}`);
      console.error(`Error: ${err}`);
    },
  });
});