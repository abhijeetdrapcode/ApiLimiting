// import { cleanXssValuesFromData } from 'drapcode-utility';

// // Middleware
// export const xssSanitizer = (req, res, next) => {
//   const ENABLE_XSS_SANITIZER = process.env.ENABLE_XSS_SANITIZER || true;
//   if (ENABLE_XSS_SANITIZER === false || ENABLE_XSS_SANITIZER === 'false') return next();
//   try {
//     console.log('This is the req query: ', req.query);
//     console.log('This is the req params', req.params);
//     console.log('This is the req header: ', req.headers);

//     if (req.params && Object.keys(req.params)) req.params = cleanXssValuesFromData(req.params);
//     if (req.query && Object.keys(req.query)) req.query = cleanXssValuesFromData(req.query);
//     if (req.headers && Object.keys(req.headers)) req.headers = cleanXssValuesFromData(req.headers);
//   } catch (error) {
//     console.log('\n error :>> ', error);
//   }
//   next();
// };

import { cleanXssValuesFromData } from 'drapcode-utility';

export const xssSanitizer = (req, res, next) => {
  const ENABLE_XSS_SANITIZER = process.env.ENABLE_XSS_SANITIZER || true;
  if (ENABLE_XSS_SANITIZER === false || ENABLE_XSS_SANITIZER === 'false') return next();

  try {
    if (req.params && Object.keys(req.params).length) {
      const sanitized = cleanXssValuesFromData(req.params);
      Object.keys(sanitized).forEach((key) => {
        req.params[key] = sanitized[key];
      });
    }

    if (req.query && Object.keys(req.query).length) {
      const sanitized = cleanXssValuesFromData(req.query);
      Object.keys(sanitized).forEach((key) => {
        req.query[key] = sanitized[key];
      });
    }

    if (req.headers && Object.keys(req.headers).length) {
      const sanitized = cleanXssValuesFromData(req.headers);
      Object.keys(sanitized).forEach((key) => {
        req.headers[key] = sanitized[key];
      });
    }
  } catch (error) {
    console.log('\n error :>> ', error);
  }

  next();
};
