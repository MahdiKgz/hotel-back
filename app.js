const express = require("express");
const app = express();
const morgan = require("morgan");
const path = require("path");
const cors = require("cors");

app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads/")));

app.use(morgan("dev"));

app.use(cors());

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

//api docs

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const authRouter = require("./routers/v1/auth.router");
const hotelRouter = require("./routers/v1/hotel.router");
const domainRouter = require("./routers/v1/domain.router");
const usersRouter = require("./routers/v1/user.router");
const roomRouter = require("./routers/v1/room.router");

// Routers

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/hotel", hotelRouter);
app.use("/api/v1/domain", domainRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/room", roomRouter);

module.exports = app;
