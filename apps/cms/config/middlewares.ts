const isProduction = process.env.NODE_ENV === 'production';
const rawCorsOrigin = process.env.CORS_ORIGIN;

const resolveOrigins = (): string[] => {
  if (rawCorsOrigin && rawCorsOrigin.trim() !== '') {
    return rawCorsOrigin
      .split(',')
      .map((o) => o.trim())
      .filter((o) => Boolean(o) && o !== '*');
  }
  if (isProduction) {
    return ['https://ateevra.com', 'https://www.ateevra.com', 'https://cms.ateevra.com'];
  }
  return ['http://localhost:3000', 'http://localhost:1337'];
};

export default [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
          ],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            'market-assets.strapi.io',
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      origin: resolveOrigins(),
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
      keepHeaderOnError: true,
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
