import { Express } from "express";
import expressJSDocSwagger from "express-jsdoc-swagger";

export function setupSwagger(app: Express) {
  const options = {
    info: {
      version: "1.0.0",
      title: "Dia-Cura Med API",
      description:
        "API documentation for Dia-Cura Med (patients, doctors, KYC, consultations, etc.)",
      license: {
        name: "MIT",
      },
    },
    security: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
      },
    },
    baseDir: __dirname, // Root directory of your project
    filesPattern: ["../modules/**/*.ts"], // Scan routes/controllers
    swaggerUIPath: "/api-docs", // Swagger endpoint
    exposeSwaggerUI: true,
    exposeApiDocs: true,
    apiDocsPath: "/v3/api-docs", // Raw OpenAPI JSON
  };

  expressJSDocSwagger(app)(options);
}
