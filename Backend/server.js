const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const connection = require('./db/db.js');
const app = require('./app.js');
const { errorMiddleware } = require('./middlewares/errorHandler.js');
const bodyParser = require('body-parser');
const routes = require('./router/user-router.js');
const auctionroutes=require("./router/auction-routes.js")
const placeBid=require("./router/bidder-routes.js");
const commissionBidroute=require("./router/commission-routes.js");
const superAdminroute=require("./router/super-admin-routes.js");
const endedAuctionCron = require('./automation/endedAuctuonCron.js');
// Use const for PORT
const PORT = process.env.PORT || 3000;


app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: '/tmp/',
    })
);
// Middleware setup
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Routes setup

app.use(errorMiddleware);
// Database connection
endedAuctionCron()
connection();
app.use('/api/v1/user', routes);
app.use('/api/auction', auctionroutes);
app.use('/api/placebid', placeBid);
app.use('/api/commissionBidroute', commissionBidroute);
app.use('/api/super-admin',superAdminroute);


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});