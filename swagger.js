const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const PORT = process.env.PORT || 5001;

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
        url: `http://localhost:${PORT}`, // Ensure this matches your running server
        description: "Local server",
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
