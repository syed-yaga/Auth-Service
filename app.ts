import express from "express";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import authRoute from "./routes/auth.route";
import authorizRoute from "./routes/authorization.route";
import { swaggerSpec } from "./config/swagger.config";

const app = express();

app.use(express.json());

app.use(morgan("dev"));

app.use("/auth", authRoute);
app.use("/admin", authorizRoute);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/", (req, res) => {
  res.send("Authentication service is running");
});

export default app;
