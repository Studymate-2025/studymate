function parseRRN(front6, genderCode) {
  const yearPrefixMap = {
    '1': '19',
    '2': '19',
    '3': '20',
    '4': '20',
    '5': '19',
    '6': '20'
  };

  const prefix = yearPrefixMap[genderCode];
  const isValidFront = /^\d{6}$/.test(front6);

  if (!prefix || !isValidFront) return null;

  return prefix + front6;
}

module.exports = parseRRN;
