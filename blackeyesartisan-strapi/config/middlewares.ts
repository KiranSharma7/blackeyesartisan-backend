export default [
  "strapi::errors",
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "connect-src": ["'self'", "https:"],
          "img-src": [
            "blob:",
            "'self'",
            "data:",
            "cdn.jsdelivr.net",
            "strapi.io",
            process.env.SPACE_URL,
          ],
          "media-src": [
            "'self'",
            "data:",
            "blob:",
            "strapi.io",
            process.env.SPACE_URL,
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  "strapi::cors",
  "strapi::poweredBy",
  "strapi::logger",
  "strapi::query",
  "strapi::body",
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
];
