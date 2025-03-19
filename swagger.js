const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Baazar Limited API",
      version: "1.0.0",
      description: "API Documentation for Baazar Limited",
    },
    servers: [
      {
        url: "https://baazar-ltd.onrender.com",
        description: "On Render Server",
      },
      {
        url: "http://localhost:4000",
        description: "Local Development Server",
      },
      {
        url: "https://baazar-vercel.vercel.app",
        description: "Vercel Server",
      },
    ],
  },
  apis: ["./api/*.js"], // Ensure correct API file paths
};

const swaggerSpec = swaggerJSDoc(options);

const setupSwagger = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = setupSwagger;
