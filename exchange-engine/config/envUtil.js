export const extractEnvironment = (environments, environment = process.env.APP_ENV) => {
  let currentEnvironment = null;
  if (!environments || environments.length === 0) {
    console.error('No Environment');
    currentEnvironment = null;
  } else if (environment === 'preview') {
    currentEnvironment = environments.find((env) => env.envType === 'PREVIEW');
  } else if (environment === 'production') {
    currentEnvironment = environments.find((env) => env.envType === 'PRODUCTION');
  } else if (environment === 'beta') {
    currentEnvironment = environments.find((env) => env.envType === 'BETA');
  } else if (environment === 'alpha') {
    currentEnvironment = environments.find((env) => env.envType === 'ALPHA');
  } else if (
    ['development', 'staging'].includes(environment) ||
    environment?.toLowerCase()?.trim()?.startsWith('dev')
  ) {
    // To handle development and staging env
    currentEnvironment = environments.find((env) => env.envType === 'PRODUCTION');
  }
  return currentEnvironment;
};
