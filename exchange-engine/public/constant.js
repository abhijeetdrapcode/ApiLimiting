resetItemsFromBrowserStorage();

const getBackendServerUrl = () => {
  return '/api/v1/';
  // const serverUrl = parseCookieForDomain();
  // console.log('serverUrl :>> ', serverUrl);
  // return serverUrl;
  // For Local Development
  // return `http://${projectSubDomain}.prodeless.com:5002/api/v1/`;
};

const parseCookieInfo = () => {
  const parsedCookie = document.cookie
    .split(';')
    .map((v) => v.split('='))
    .reduce((acc, v) => {
      acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(v[1] ? v[1].trim() : '');
      return acc;
    }, {});
  return parsedCookie;
};

const parseCookieForDomain = () => {
  const parsedCookie = parseCookieInfo();
  const domain = parsedCookie['projectSeoName'];
  let environment = parsedCookie['environment'];
  console.log('environment :>> ', environment);
  environment = environment ? `${environment}.` : '';

  //Check if request is coming from our domain
  const hostName = window.location.hostname;
  console.log('hostName :>> ', hostName);
  const nonCustomUrl = `https://${domain}.${environment}webkonnect.site/api/v1/`;
  console.log('nonCustomUrl :>> ', nonCustomUrl);
  if (hostName.includes('webkonnect.site')) {
    return nonCustomUrl;
  }
  //TODO: Test for custom domain
  if (apiDomainName && apiDomainName !== 'undefined' && apiDomainName !== undefined) {
    return `https://${apiDomainName}/api/v1/`;
  } else {
    return nonCustomUrl;
  }
};

function resetItemsFromBrowserStorage() {
  const RESET_SESSION_KEYS = '__resetK';
  let resetKeys = sessionStorage.getItem(RESET_SESSION_KEYS);
  if (resetKeys) resetKeys = resetKeys.split(',');
  if (resetKeys) {
    if (Array.isArray(resetKeys) && resetKeys.length) {
      resetKeys.forEach((key) => sessionStorage.removeItem(key));
    }
  }

  const RESET_SESSION_KEYS_DETAIL_PAGE = '__resetK_dp';
  let resetKeysDetailPage = sessionStorage.getItem(RESET_SESSION_KEYS_DETAIL_PAGE);
  if (resetKeysDetailPage) resetKeysDetailPage = resetKeysDetailPage.split(',');
  if (resetKeysDetailPage) {
    if (Array.isArray(resetKeysDetailPage) && resetKeysDetailPage.length) {
      resetKeysDetailPage.forEach((key) => sessionStorage.removeItem(key));
    }
  }
}

const imageServerUrl = () => {
  const parsedCookie = parseCookieInfo();
  const S3URL = parsedCookie['S3URL'];
  console.log('S3URL :>> ', S3URL);
  if (!S3URL) return '';
  return ensureTrailingSlash(S3URL);
};
const ensureTrailingSlash = (url) => (url.endsWith('/') ? url : `${url}/`);

const getWebSocketUrl = () => {
  // const webSocketUrl = SERVER_URL.replace(/:\/\/([^:/]+)(:\d+)?\/api\/v1\/?$/, '://$1:6003'); //For Local Development
  const webSocketUrl = SERVER_URL.replace(/\/api\/v1\/?$/, '');
  return webSocketUrl;
};

const summernoteFontsArray = [
  'Arial',
  'Arial Black',
  'Comic Sans MS',
  'Courier New',
  'Helvetica',
  'Impact',
  'Times New Roman',
  'Trebuchet MS',
  'Verdana',
  'Georgia',
  'Open Sans',
  'B612',
  'Roboto',
  'Ubuntu',
  'ABeeZee',
  'Spartan',
  'Bungee',
  'Dancing Script',
  'Lato',
  'Lobster',
  'Lobster Two',
  'Lora',
  'Montserrat',
  'Montserrat Alternates',
  'Nunito',
  'Nunito Sans',
  'Open Sans Condensed',
  'PT Sans',
  'PT Serif',
  'Raleway',
  'Roboto Condensed',
  'Roboto Mono',
  'Roboto Slab',
  'Alegreya',
  'Alegreya Sans',
  'Merriweather',
  'Merriweather Sans',
  'Quattrocento',
  'Quattrocento Sans',
  'Arvo',
  'Copse',
  'Cutive',
  'Sanchez',
  'Scope One',
  'Slabo 27px',
  'Trocchi',
  'Vesper Libre',
  'JetBrains Mono',
  'Noto Sans',
  'Noto Serif',
  'Playfair Display',
  'Poppins',
  'Rubik',
  'Source Code Pro',
  'Source Sans Pro',
  'Source Serif Pro',
  'Barlow',
  'Barlow Condensed',
  'Barlow Semi Condensed',
  'Fira Code',
  'Fira Mono',
  'Fira Sans',
  'Fira Sans Condensed',
  'Fira Sans Extra Condensed',
  'Quicksand',
  'Advent Pro',
  'Bitter',
  'Changa',
  'Changa One',
  'Exo',
  'Exo 2',
  'Great Vibes',
  'Inconsolata',
  'Kaushan Script',
  'Nova Cut',
  'Nova Flat',
  'Nova Mono',
  'Nova Oval',
  'Nova Round',
  'Nova Script',
  'Nova Slim',
  'Nova Square',
  'Oswald',
  'Oxygen',
  'Oxygen Mono',
  'Sacramento',
  'Abril Fatface',
  'Aldrich',
  'Balsamiq Sans',
  'Bebas Neue',
  'Berkshire Swash',
  'Bilbo',
  'Carter One',
  'Castoro',
  'Cinzel',
  'Federo',
  'Italianno',
  'Josefin Sans',
  'Josefin Slab',
  'Limelight',
  'Oregano',
  'Padauk',
  'Pattaya',
  'Prata',
  'Vollkorn SC',
  'Yesteryear',
  'Abel',
  'Aladin',
  'B612 Mono',
  'Black Han Sans',
  'Bungee Hairline',
  'Bungee Inline',
  'Bungee Outline',
  'Bungee Shade',
  'Delius',
  'Delius Swash Caps',
  'Delius Unicase',
  'Julee',
  'Mako',
  'Oleo Script',
  'Oleo Script Swash Caps',
  'Space Grotesk',
  'Space Mono',
  'Ubuntu Condensed',
  'Ubuntu Mono',
  'Vollkorn',
  'Work Sans',
  'Zeyada',
  'Zhi Mang Xing',
  'Zilla Slab',
];

const summernoteFontsSizeArray = [
  '8',
  '10',
  '12',
  '14',
  '16',
  '18',
  '20',
  '24',
  '28',
  '32',
  '36',
  '40',
  '48',
  '56',
  '64',
  '72',
];
