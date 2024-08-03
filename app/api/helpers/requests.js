function getSourceHost(req) {
  const protocol = req.protocol;
  const host = req.get('host');
  const port = req.get('port');

  if (port === '80' || port === '443' || port === undefined || port === null) {
    return `${protocol}://${host}`;
  } else {
    return `${protocol}://${host}:${port}`;
  }
}

module.exports = {
  getSourceHost,
};