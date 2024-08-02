function generate(min, max) {
  const source = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  // generate a random string with min length of min and max length of max
  const length = Math.floor(Math.random() * (max - min + 1)) + min;
  let result = '';
  for (let i = 0; i < length; i++) {
    result += source[Math.floor(Math.random() * source.length)];
  }
  return result;
}

module.exports.generate = generate;
