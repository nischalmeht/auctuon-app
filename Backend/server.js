const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const connection = require('./db/db.js');
const app = require('./app.js');
const { errorMiddleware } = require('./middlewares/errorHandler.js');
// Use const for PORT
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
  })
);
app.use(errorMiddleware)
// Database connection
connection();

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});