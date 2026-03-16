const express = require("express");
const app = express();
const morgan = require("morgan");
const path = require("path");

app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads/")));

app.use(morgan("dev"));

const authRouter = require("./routers/v1/auth.router");
const hotelRouter = require("./routers/v1/hotel.router");

// Routers

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/hotel", hotelRouter);

module.exports = app;
