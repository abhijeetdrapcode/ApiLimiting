const MFA_PREFIX_SIZE = 3;
const MFA_SUFFIX_SIZE = 7;

function generateRandomHex(size) {
  let hex = '';
  for (let i = 0; i < size; i++) {
    hex += Math.floor(Math.random() * 16).toString(16);
  }
  return hex;
}

export const encodeSecretCode = (secret_code) => {
  const prefix = generateRandomHex(MFA_PREFIX_SIZE);
  const suffix = generateRandomHex(MFA_SUFFIX_SIZE);
  secret_code = `${prefix}${secret_code}${suffix}`;
  secret_code = Buffer.from(secret_code, 'utf8').toString('base64');
  return secret_code;
};

export const decodeSecretCode = (secret_code) => {
  secret_code = Buffer.from(secret_code, 'base64').toString('utf8');
  secret_code = secret_code.slice(MFA_PREFIX_SIZE, secret_code.length - MFA_SUFFIX_SIZE);
  return secret_code;
};
