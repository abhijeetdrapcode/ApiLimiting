import voca from 'voca';
import _ from 'lodash';
import { nextGeneratedString, replaceValueFromSource } from 'drapcode-utility';
import { pluginCode } from 'drapcode-constant';

const ensureTrailingSlash = (url) => (url.endsWith('/') ? url : `${url}/`);

export const htmlRegex =
  /<(br|basefont|hr|input|source|frame|param|area|meta|!--|col|link|option|base|img|wbr|!DOCTYPE).*?>|<(a|abbr|acronym|address|applet|article|aside|audio|b|bdi|bdo|big|blockquote|body|button|canvas|caption|center|cite|code|colgroup|command|datalist|dd|del|details|dfn|dialog|dir|div|dl|dt|em|embed|fieldset|figcaption|figure|font|footer|form|frameset|head|header|hgroup|h1|h2|h3|h4|h5|h6|html|i|iframe|ins|kbd|keygen|label|legend|li|map|mark|menu|meter|nav|noframes|noscript|object|ol|optgroup|output|p|pre|progress|q|rp|rt|ruby|s|samp|script|section|select|small|span|strike|strong|style|sub|summary|sup|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|track|tt|u|ul|var|video).*?<\/\2>/i;

export const customInsertOne = async (dbCollection, data) => {
  let savedItem = await dbCollection.insertOne(data);
  savedItem = await dbCollection.findOne({ _id: savedItem.insertedId });
  return savedItem;
};

export const validate = (data = {}) => {
  let result = {};
  let resp = {};
  _.map(data, (val, key) => {
    if ((val && val.length) || (val && typeof val === 'number')) {
      result[key] = val;
    } else {
      resp['msg'] = `${key} is missing`;
    }
  });
  if (resp && _.size(resp)) {
    return { status: false, data: { code: 409, message: resp.msg, data: {} } };
  } else {
    return { status: true, data: result };
  }
};

export const generateNextCustomUuid = (previousUuid, prepend, minLength, append, algorithm) => {
  if (prepend && voca.startsWith(previousUuid, prepend)) {
    previousUuid = voca.last(previousUuid, previousUuid.length - prepend.length);
  }
  if (append && voca.endsWith(previousUuid, append)) {
    const index = voca.lastIndexOf(previousUuid, append);
    previousUuid = voca.first(previousUuid, index);
  }
  if (minLength && voca.startsWith(previousUuid, '0')) {
    previousUuid = removeStartingLetter(voca.slice(previousUuid, 1));
  }
  const options = { prepend, minLength, append, algorithm };
  return nextGeneratedString(previousUuid, options);
};

const removeStartingLetter = (previousUuid) => {
  while (voca.startsWith(previousUuid, '0')) {
    previousUuid = removeStartingLetter(voca.slice(previousUuid, 1));
  }
  return previousUuid;
};

export const generateRandomCustomUuid = (prepend, minLength, append, algorithm) => {
  const allowedChars = getAllowedChars(algorithm);
  const randomStr = generateRandomStr(minLength, allowedChars);
  return `${prepend}${randomStr}${append}`;
};

const generateRandomStr = (length, allowedChars) => {
  let randomStr = '';
  const charactersLength = allowedChars.length;
  for (let i = 0; i < length; i++) {
    randomStr += allowedChars.charAt(Math.floor(Math.random() * charactersLength));
  }
  return randomStr;
};

const getAllowedChars = (algorithm) => {
  const allowedNumericChars = '0123456789';
  const allowedAlphabetChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const allowedAlphaNumericChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (algorithm === 'randomAlphanumeric') {
    return allowedAlphaNumericChars;
  } else if (algorithm === 'randomNumeric') {
    return allowedNumericChars;
  } else if (algorithm === 'randomAlphabet') {
    return allowedAlphabetChars;
  }
};

export const prepareS3Url = async (installedPlugins, environment, isDefault = false) => {
  // Use default S3 bucket URL
  const defaultS3Url = ensureTrailingSlash(process.env.S3_BUCKET_URL);
  if (isDefault) return defaultS3Url;

  // Try to find AWS S3 plugin configuration
  const s3Plugin = installedPlugins.find((plugin) => plugin.code === pluginCode.AWS_S3);

  // Fallback to default URL if plugin config is missing
  if (!s3Plugin) return defaultS3Url;

  // Extract bucket name and region from plugin settings
  let { bucket_name, region } = s3Plugin.setting;

  // Replace placeholders using the environment context
  bucket_name = replaceValueFromSource(bucket_name, environment, null);
  region = replaceValueFromSource(region, environment, null);

  // Build the base S3 URL
  const isDefaultRegion = region === 'us-east-1';
  const regionSuffix = isDefaultRegion ? '' : `.${region}`;
  const s3Url = `https://${bucket_name}${regionSuffix}.s3.amazonaws.com`;

  return ensureTrailingSlash(s3Url);
};

export const prepareRedirectUri = (host, serviceName) => {
  return `https://${host}/api/v1/${serviceName}/auth/callback`;
};

export const getReferenceFieldValue = (data, fieldName) => {
  if (!fieldName) return undefined;
  if (fieldName.startsWith('RF::')) {
    const [, fieldKey] = fieldName.split('::');
    if (fieldKey) {
      const [parent, ref] = fieldKey.split('.');
      if (ref) {
        return data?.[parent]?.[0]?.[ref];
      }
    }
  }
  return data?.[fieldName];
};

export const preparePluginCredentials = (pluginSettings, environment, tenant) => {
  const processedCredentials = {};
  for (const [key, value] of Object.entries(pluginSettings)) {
    processedCredentials[key] = replaceValueFromSource(value, environment, tenant);
  }
  return processedCredentials;
};

export const sanitizeMongoKeys = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(sanitizeMongoKeys);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const safeKey = key.replace(/\./g, '_').replace(/\$/g, '');
      acc[safeKey] = sanitizeMongoKeys(obj[key]);
      return acc;
    }, {});
  }
  return obj;
};
