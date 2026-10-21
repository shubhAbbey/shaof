/**
 * Generates interactive Swagger UI 5 HTML page for ATEEVRA API Documentation.
 */
export function renderSwaggerUiHtml(options: {
  specUrl?: string;
  title?: string;
} = {}): string {
  const specUrl = options.specUrl || '/docs/openapi.json';
  const title = options.title || 'Ateevra API Documentation (OpenAPI 3.1)';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="icon" type="image/png" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/favicon-32x32.png" sizes="32x32" />
  <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui.css" />
  <style>
    html {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    *, *:before, *:after {
      box-sizing: inherit;
    }
    body {
      margin: 0;
      background: #fafafa;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .custom-header {
      background: #0f172a;
      color: #ffffff;
      padding: 16px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    .custom-header h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .custom-header .badge {
      background: #3b82f6;
      color: #fff;
      font-size: 11px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .custom-header .links {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .custom-header .links a {
      color: #cbd5e1;
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
      padding: 6px 12px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.08);
      transition: all 0.2s;
    }
    .custom-header .links a:hover {
      background: rgba(255, 255, 255, 0.16);
      color: #ffffff;
    }
    .swagger-ui .topbar {
      display: none !important;
    }
    .swagger-ui .info {
      margin: 24px 0 16px 0;
    }
    .swagger-ui .info .title {
      font-size: 28px;
      font-weight: 700;
      color: #0f172a;
    }
    .swagger-ui .scheme-container {
      background: #ffffff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      padding: 16px 32px;
      margin-bottom: 24px;
      border-radius: 8px;
    }
    .swagger-ui .btn.authorize {
      background-color: #059669;
      border-color: #059669;
      color: #ffffff;
    }
    .swagger-ui .btn.authorize svg {
      fill: #ffffff;
    }
  </style>
</head>
<body>
  <header class="custom-header">
    <h1>
      <span>ATEEVRA MARKETPLACE</span>
      <span class="badge">OpenAPI 3.1</span>
      <span class="badge" style="background: #10b981;">MVP-1 + MVP-2</span>
    </h1>
    <div class="links">
      <a href="${specUrl}" target="_blank" download="ateevra-openapi.json">Download OpenAPI JSON</a>
      <a href="http://localhost:3000" target="_blank">Storefront (Port 3000)</a>
      <a href="http://localhost:9000" target="_blank">Backend (Port 9000)</a>
    </div>
  </header>

  <div id="swagger-ui"></div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui-bundle.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        url: "${specUrl}",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "BaseLayout",
        displayRequestDuration: true,
        filter: true,
        persistAuthorization: true,
        defaultModelsExpandDepth: 1,
        defaultModelExpandDepth: 2,
        docExpansion: "list",
        showExtensions: true,
        showCommonExtensions: true,
        tryItOutEnabled: false,
        validatorUrl: null
      });
    };
  </script>
</body>
</html>`;
}
