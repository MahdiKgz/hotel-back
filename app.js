const express = require("express");
const app = express();
const morgan = require("morgan");

app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));

app.use(morgan("dev"));

const authRouter = require("./routers/v1/auth.router");

// Routers

app.use("/api/v1/auth", authRouter);

module.exports = app;
