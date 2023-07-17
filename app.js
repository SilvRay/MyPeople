// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv").config();

// ℹ️ Connects to the database
require("./db");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");

const app = express();

// Require necessary (isAuthenticated) middleware in order to control access to specific routes
const { isAuthenticated } = require("./middleware/jwt.middleware");

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

// 👇 Start handling routes here
const indexRoutes = require("./routes/index.routes");
app.use("/api", indexRoutes);

const authRoutes = require("./routes/auth.routes");
app.use("/api", authRoutes);

const groupRoutes = require("./routes/group.routes");
app.use("/api", isAuthenticated, groupRoutes);

const postRoutes = require("./routes/post.routes");
app.use("/api", isAuthenticated, postRoutes);

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;
